"""
The query handler serves as middleware between the API and the database.
It takes as input lists of search filters and keywords in JSON format passed from the search UI 
and returns lists of corresponding cases (nodes) and citations (edges) in JSON format to be used in the perfect graph app.
It handles the following tasks:
1. check authorization / permission to access legal intelligence data
2. check validity of input (search filters and keywords) and offer sample network if input too broad or invalid
3. select cases matching input filters and keywords
4. fetch meta data (nodes) and citations (edges) of matching cases
5. format output
"""

import os
import time
# @TODO: remove imported local modules to make function dependent on lambda layers (not suitable for testing)
from clients.elasticsearch_client import ElasticsearchClient
from clients.dynamodb_client import DynamodbClient
from utils import get_key, format_node_data, verify_input_string_list, verify_input_ecli_string, get_user_authorization
from attributes import NODE_ESSENTIAL, NODE_ESSENTIAL_LI, KEYWORD_SEARCH, KEYWORD_SEARCH_LI, ARTICLE_SEARCH
from settings import TABLE_NAME, ELASTICSEARCH_ENDPOINT
from network_statistics import add_network_statistics


TEST = False

# set up Elasticsearch client
es_client = ElasticsearchClient(
    endpoint=ELASTICSEARCH_ENDPOINT,
    index=TABLE_NAME,
    max_hits=100,       # limit number of hits per page
    timeout= 20,       # limit query time (s)
    page_limit=100     # limit number of pages per query
)

# set up DynamoDB client
ddb_client = DynamodbClient(
    table_name=os.getenv(f'API_CASEEXPLORERUI_{TABLE_NAME.upper()}TABLE_NAME'),
    page_limit=50       # limit number of pages per query
)


def handler(event, context):
    """
    Main function that is executed when lambda function is triggered.
    :param event: dict containing event meta information and function arguments (here: search filters) under event.argments
    :param context: dict containing context information of triggered event
    :return: dict of nodes (id, data) and edges (edge_id, source_node_id, target_node_id, data)
    """
    # function call without input arguments scheduled every 15mins to keep warm
    #print(event)
    #if event == {}:
    #    return {"pong"}

    start = time.time()
    search_params = event['arguments'].copy()
    attributes = NODE_ESSENTIAL

    print(context.aws_request_id)


    # 1. CHECK USER AUTHORIZATION
    authorized_user = get_user_authorization(event)
    

    # 2. CHECK INPUT VALIDITY
    search_params["DataSources"] = verify_input_string_list("DataSources", search_params["DataSources"])
    search_params["Instances"] = verify_input_string_list("Instances", search_params["Instances"])
    search_params["Domains"] = verify_input_string_list("Domains", search_params["Domains"])
    search_params["Doctypes"] = verify_input_string_list("Doctypes", search_params["Doctypes"])
    search_params["Eclis"] = verify_input_ecli_string("Eclis", search_params["Eclis"])


    # 3. SELECT CASES MATCHING SEARCH INPUT
    # a. select cases matching filters
    node_eclis, searched_dynamodb = filter_dynamodb(search_params)

    # add li entries if permission given
    if authorized_user:
        attributes = NODE_ESSENTIAL_LI
        node_eclis_li, _ = filter_dynamodb(search_params, authorized=True)
        node_eclis = node_eclis.union(node_eclis_li)

    # b. filter selected cases by keyword match if keywords given and filters did not return no matches
    if (search_params['Keywords'] != '' or search_params['Articles'] != '') and not (node_eclis == set() and searched_dynamodb):
        print('in ES')
        es_query = build_elasticsearch_query(search_params['Keywords'], search_params['Articles'], node_eclis, authorized_user)
        result = es_client.execute(es_query, ['ecli'])
        node_eclis = {item['_source']['ecli'] for item in result}


    # 4. FETCH NODES AND EDGES DATA OF SELECTED CASES

    # fetch edges
    edges, new_node_eclis = fetch_edges_data(node_eclis, search_params['DegreesSources'], search_params['DegreesTargets'])
    
    # fetch nodes data
    keys_list = []
    for node_ecli in node_eclis.union(new_node_eclis):
        keys_list.append(get_key(node_ecli))
    items = ddb_client.execute_batch(keys_list, attributes)

    # 5. FORMAT NODES
    nodes = []
    for item in items:
        nodes.append(format_node_data(item))

    print('Duration total:', time.time()-start)
    
    if TEST:  # @TODO remove
        return {'nodes': len(nodes), 'edges': len(edges), 'statistics': len(add_network_statistics(nodes, edges)), 'message': 'test message'}

    return {'nodes': nodes, 'edges': edges, 'statistics': add_network_statistics(nodes, edges), 'message': 'test message'}


def build_elasticsearch_query(keywords, articles, eclis, authorized):
    """
    Builds Elasticsearch query to filter by doc_source_eclis if provided and match keywords and articles.
    :param keywords: string of keywords in simple query string syntax*
    :param articles: string of legal provisions in simple query string syntax*
    :param eclis: list of eclis
    :param authorized: boolean flag whether or not permission to access Legal Intelligence data is given
    :return: dict of Elasticsearch query in Query DSL
    * simple query string syntax: https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-simple-query-string-query.html
    """
    filters = []
    if list(eclis) != []:
        filters.append({'terms': {'ecli': list(eclis)}})
    if keywords != '': 
        fields = KEYWORD_SEARCH
        if authorized:
            fields = KEYWORD_SEARCH_LI
        filters.append({
                'simple_query_string': {
                    'query': keywords,
                    'fields': fields,
                    'analyzer': 'dutch'
                },
            })
    if articles != '': 
        filters.append({
                'simple_query_string': {
                    'query': articles,
                    'fields': ARTICLE_SEARCH
                },
            })
    return {'bool': {'filter': filters}}


def filter_dynamodb(filters, authorized=False):
    """
    Handles querying of data to match all given input filters and keywords:
    - Queries DynamoDB by selecting the most suitable index for the given input filters and looping through all filters.
    - Queries Elasticsearch to match selected cases to keywords.
    :param s_params: dictionary of search filters
    :param authorized: boolean flag whether or not permission to access Legal Intelligence data is given
    :return: set of DocSourceIds of cases matching search input
    """
 
    if authorized:
        domain_name = 'DOM_LI'
        domains_name = 'domains_li'
        instance_name = 'instance_li'
        gsi_instance_name = 'GSI-instance_li'
    else:
        domain_name = 'DOM'
        domains_name = 'domains'
        instance_name = 'instance'
        gsi_instance_name = 'GSI-instance'

    # CASE 1: neither eclis, nor instances given --> fetch by domain:
    if filters['Eclis'] == [''] and filters['Instances'] == [''] and filters['Domains'] != ['']:
        print('IN DOMAINS')
        node_eclis = set()
        for source in filters['DataSources']:
            for doc in filters['Doctypes']:
                for domain in filters['Domains']:
                    response = ddb_client.execute_query(
                        IndexName='GSI-ItemType',
                        ProjectionExpression='#ecli',
                        KeyConditionExpression='#ItemType = :ItemType AND #SourceDocDate BETWEEN :DateStart AND :DateEnd',
                        ExpressionAttributeNames={'#ItemType': 'ItemType', '#ecli': 'ecli', '#SourceDocDate': 'SourceDocDate'},
                        ExpressionAttributeValues={
                            ':ItemType': f"{domain_name}_{domain}",
                            ':DateStart': f"{source}_{doc}_{filters['DateStart']}",
                            ':DateEnd': f"{source}_{doc}_{filters['DateEnd']}"
                        }
                    )
                    node_eclis = node_eclis.union({item['ecli'] for item in response['Items']})
        return node_eclis, True
    
    # CASE 2: eclis given
    if filters['Eclis'] != ['']:
        print('IN ECLIS') 
        q_params = {
            'ProjectionExpression': '#ecli',
            'KeyConditionExpression': '#ecli = :ecli',
        }
        if filters['Domains'] != ['']:
            q_params['FilterExpression'] = 'contains(#instance, :instance) AND #SourceDocDate BETWEEN :DateStart AND :DateEnd AND contains(#domains, :domain)'
            q_params['ExpressionAttributeNames'] = {'#ecli': 'ecli', '#instance': instance_name, '#SourceDocDate': 'SourceDocDate', '#domains': domains_name}
        else:
            q_params['FilterExpression'] = 'contains(#instance, :instance) AND #SourceDocDate BETWEEN :DateStart AND :DateEnd'
            q_params['ExpressionAttributeNames'] = {'#ecli': 'ecli', '#instance': instance_name, '#SourceDocDate': 'SourceDocDate'}
            
        node_eclis = execute_dynamodb_query_by_filters(filters, **q_params)
        return node_eclis, True


    # CASE 3: instances given
    elif filters['Instances'] != ['']:
        print('IN INSTANCES')
        q_params = {
            'IndexName': gsi_instance_name,
            'ProjectionExpression': '#ecli',
            'KeyConditionExpression': '#instance = :instance AND #SourceDocDate BETWEEN :DateStart AND :DateEnd'
        }
        if filters['Domains'] != ['']:
            q_params['FilterExpression'] = 'contains(#domains, :domain)'
            q_params['ExpressionAttributeNames'] = {'#ecli': 'ecli', '#instance': instance_name, '#SourceDocDate': 'SourceDocDate', '#domains': domains_name}
        else:
            q_params['ExpressionAttributeNames'] = {'#ecli': 'ecli', '#instance': instance_name, '#SourceDocDate': 'SourceDocDate'}
        
        node_eclis = execute_dynamodb_query_by_filters(filters, **q_params)
        return node_eclis, True


    # CASE 4: neither eclis, nor instances, nor domains given --> only query Elasticsearch by keywords 
    else:
        print('IN ELSE')
        return set(), False


def execute_dynamodb_query_by_filters(filters, **q_params):
    node_eclis = set()
    for ecli in filters['Eclis']:
        for instance in filters['Instances']:
            for domain in filters['Domains']:
                for source in filters['DataSources']:
                    for doc in filters['Doctypes']:
                        if len(node_eclis) >= 10000:
                            print('LIMIT REACHED: 10k CASES FETCHED')
                            return node_eclis
                        expression_attribute_values = {
                            ':instance': instance,
                            ':DateStart': f"{source}_{doc}_{filters['DateStart']}",
                            ':DateEnd': f"{source}_{doc}_{filters['DateEnd']}"
                        }
                        if domain != '':
                            expression_attribute_values[':domain'] = domain
                        if 'IndexName' not in q_params:
                            expression_attribute_values[':ecli'] = ecli
                        response = ddb_client.execute_query(ExpressionAttributeValues=expression_attribute_values, **q_params)
                        node_eclis = node_eclis.union({item['ecli'] for item in response['Items']})
    return node_eclis


def fetch_edges_data(eclis, degrees_sources, degrees_targets):
    """
    Queries source and target citations by doc_source_id from DynamoDB and returns corresponding edges.
    :param doc_source_eclis: set of doc_source_eclis  
    :param degrees_sources: int degree of source citations
    :param degrees_targets: int degree of target citations
    :return: list of edge dicts (containing edge_id, source_id, target_id, data)
    """
    new_node_eclis = set()
    edges = []
    target_keys = []
    source_keys = []

    for ecli in eclis:
        target_keys.append(get_key(ecli))
        source_keys.append(get_key(ecli))

    # c_sources:
    for _ in range(degrees_sources):
        next_targets = []
        items = ddb_client.execute_batch(target_keys, ['ecli', 'cites'])
        for item in items:
            if 'cites' in item:
                for citation in item['cites']:
                    next_targets.extend([get_key(citation)])
                    edges.extend([{
                        'id': f"{item['ecli']}_{citation}", 
                        'source': item['ecli'], 
                        'target': citation, 
                        #'data': item
                    }])
                    if item['ecli'] not in eclis:
                        new_node_eclis = new_node_eclis.union({item['ecli']})
                    if citation not in eclis:
                        new_node_eclis = new_node_eclis.union({citation})
        target_keys = next_targets

    # targets:
    for _ in range(degrees_targets):
        next_sources = []
        items = ddb_client.execute_batch(source_keys, ['ecli', 'cited_by'])
        for item in items:
            if 'cited_by' in item:
                for citation in item['cited_by']:
                    next_sources.extend([get_key(citation)])
                    edges.extend([{
                        'id': f"{citation}_{item['ecli']}", 
                        'source': citation, 
                        'target': item['ecli'], 
                        #'data': item
                    }])
                    if item['ecli'] not in eclis:
                        new_node_eclis = new_node_eclis.union({item['ecli']})
                    if citation not in eclis:
                        new_node_eclis = new_node_eclis.union({citation})
        source_keys = next_sources

    edges = list({v['id']:v for v in edges}.values())

    return edges, new_node_eclis
