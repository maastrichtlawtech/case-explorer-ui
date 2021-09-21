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
from utils import get_key, format_node_data, verify_input_string_list, verify_input_ecli_string, verify_input_string, verify_input_start_date, verify_input_end_date, verify_input_int, is_authorized
from attributes import NODE_ESSENTIAL, NODE_ESSENTIAL_LI, KEYWORD_SEARCH, KEYWORD_SEARCH_LI, ARTICLE_SEARCH
from settings import TABLE_NAME, ELASTICSEARCH_ENDPOINT
from network_statistics import add_network_statistics


TEST = False                        # returns number of nodes instead of nodes

MAX_ITEMS_PER_PAGE = 10             # 500   (10)
MAX_PAGES = 5                       # 10    (5)
MAX_ITEMS = MAX_ITEMS_PER_PAGE * MAX_PAGES


# set up Elasticsearch client
es_client = ElasticsearchClient(
    endpoint=ELASTICSEARCH_ENDPOINT,
    index=TABLE_NAME.lower(),
    max_hits=MAX_ITEMS_PER_PAGE,    # max number of hits (matching items) per query (page)
    page_limit=MAX_PAGES            # max number of queries (pages)
    #timeout= 20                    # request timeout in s
)

# set up DynamoDB client
ddb_client = DynamodbClient(
    table_name=os.getenv(f'API_CASEEXPLORERUI_{TABLE_NAME.upper()}TABLE_NAME'),
    item_limit=MAX_ITEMS_PER_PAGE,  # max number of items to evaluate (not necessarily matches) per query (page)
    page_limit=MAX_PAGES            # max number of queries (pages)
)

LIMIT_REACHED = False


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
    global LIMIT_REACHED


    # 1. CHECK USER AUTHORIZATION
    authorized_user = is_authorized(event)
    if TEST:
        authorized_user = False
    

    # 2. CHECK INPUT VALIDITY
    search_params["Articles"] = verify_input_string("Articles", search_params)
    search_params["DataSources"] = verify_input_string_list("DataSources", search_params)
    search_params["DateStart"] = verify_input_start_date("DateStart", search_params)
    search_params["DateEnd"] = verify_input_end_date("DateEnd", search_params)
    search_params["DegreesSources"] = verify_input_int("DegreesSources", search_params)
    search_params["DegreesTargets"] = verify_input_int("DegreesTargets", search_params)
    search_params["Doctypes"] = verify_input_string_list("Doctypes", search_params)
    search_params["Domains"] = verify_input_string_list("Domains", search_params)
    search_params["Eclis"] = verify_input_ecli_string("Eclis", search_params)
    search_params["Instances"] = verify_input_string_list("Instances", search_params)
    search_params["Keywords"] = verify_input_string("Keywords", search_params)


    # 3. SELECT CASES MATCHING SEARCH INPUT
    # a. select cases matching filters
    node_eclis, searched_dynamodb = query_node_eclis(search_params)

    # add li entries if permission given
    if authorized_user:
        attributes = NODE_ESSENTIAL_LI
        node_eclis_li, _ = query_node_eclis(search_params, authorized=True)
        node_eclis = node_eclis.union(node_eclis_li)

    # b. filter selected cases by keyword match if keywords given and filters did not return no matches
    # @TODO filter by doc_source_date!
    if (search_params['Keywords'] != '' or search_params['Articles'] != '') and not (node_eclis == set() and searched_dynamodb):
        print('in ES')
        es_query = build_elasticsearch_query(search_params['Keywords'], search_params['Articles'], node_eclis, authorized_user)
        result, es_limit_reached = es_client.execute(es_query, ['ecli'])
        LIMIT_REACHED = LIMIT_REACHED or es_limit_reached
        node_eclis = {item['_source']['ecli'] for item in result}


    # 4. FETCH NODES AND EDGES DATA OF SELECTED CASES

    # fetch edges
    if TEST:
        edges = []
    else:
        edges, new_node_eclis = fetch_edges_data(node_eclis, search_params['DegreesSources'], search_params['DegreesTargets'])
    
    # fetch nodes data
    keys_list = []
    if TEST:
        for node_ecli in node_eclis:
            keys_list.append(get_key(node_ecli))
    else:
        for node_ecli in node_eclis.union(new_node_eclis):
            keys_list.append(get_key(node_ecli))
    items = ddb_client.execute_batch(keys_list, attributes)

    # 5. FORMAT NODES
    nodes = []
    for item in items:
        nodes.append(format_node_data(item))

    print('Duration total:', time.time()-start)

    if LIMIT_REACHED:
        message = 'Network too large to fetch! Only partial result displayed.'
    else:
        message = ''
    
    if TEST:  # @TODO remove
        return {'nodes': len(nodes), 'edges': len(edges), 'statistics': len(add_network_statistics(nodes, edges)), 'message': message}

    return {'nodes': nodes, 'edges': edges, 'statistics': add_network_statistics(nodes, edges), 'message': message}


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
                    'analyzer': 'standard'
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


def query_node_eclis(filters, authorized=False):
    """
    Handles querying of data to match all given input filters and keywords:
    - Queries DynamoDB by selecting the most suitable index for the given input filters and looping through all filters.
    - Queries Elasticsearch to match selected cases to keywords.
    :param s_params: dictionary of search filters
    :param authorized: boolean flag whether or not permission to access Legal Intelligence data is given
    :return: set of DocSourceIds of cases matching search input
    """
    global LIMIT_REACHED

    def execute_dynamodb_queries_per_filter(**q_params):
        global LIMIT_REACHED
        node_eclis = set()
        for ecli in filters['Eclis']:
            for instance in filters['Instances']:
                for domain in filters['Domains']:
                    for source in filters['DataSources']:
                        for doc in filters['Doctypes']:
                            if len(node_eclis) >= MAX_ITEMS:
                                LIMIT_REACHED = True
                                print(f'LIMIT REACHED: {len(node_eclis)} CASES FETCHED')
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
                            response, ddb_limit_reached = ddb_client.execute_query(ExpressionAttributeValues=expression_attribute_values, **q_params)
                            LIMIT_REACHED = LIMIT_REACHED or ddb_limit_reached
                            node_eclis = node_eclis.union({item['ecli'] for item in response['Items']})
        return node_eclis

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
                    response, ddb_limit_reached = ddb_client.execute_query(
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
                    LIMIT_REACHED = LIMIT_REACHED or ddb_limit_reached
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
            
        node_eclis = execute_dynamodb_queries_per_filter(**q_params)
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
        
        node_eclis = execute_dynamodb_queries_per_filter(**q_params)
        return node_eclis, True


    # CASE 4: neither eclis, nor instances, nor domains given --> only query Elasticsearch by keywords 
    else:
        print('IN ELSE')
        return set(), False


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
    global LIMIT_REACHED

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
                    if len(edges) >= MAX_ITEMS:
                        return list({v['id']:v for v in edges}.values()), new_node_eclis
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
                    if len(edges) >= 2*MAX_ITEMS:
                        return list({v['id']:v for v in edges}.values()), new_node_eclis
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

    return list({v['id']:v for v in edges}.values()), new_node_eclis
