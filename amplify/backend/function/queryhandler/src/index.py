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

import warnings
from clients.elasticsearch_client import ElasticsearchClient
from clients.dynamodb_client import DynamodbClient
from attributes import NODE_ESSENTIAL, NODE_ESSENTIAL_LI, KEYWORD_SEARCH, KEYWORD_SEARCH_LI, ARTICLE_SEARCH
import os
import time

TESTING = False
if TESTING:
    data = 'TEST'
else:
    data ='RS'

# name of table to use as defined in GraphQL schema
TABLE = 'caselawv6'

# set up Elasticsearch client
es_client = ElasticsearchClient(
    endpoint='search-amplify-elasti-m9qgehjp2rek-snhvhkpprt2nayzynzb4ozkmkm.eu-central-1.es.amazonaws.com',
    max_hits=100,       # limit number of hits per page
    timeout= 180,       # limit query time
    page_limit=100,     # limit number of pages per query
    index=TABLE
)

# set up DynamoDB client
ddb_client = DynamodbClient(
    table_name=os.getenv(f'API_CASEEXPLORERUI_{TABLE.upper()}TABLE_NAME'),
    page_limit=50       # limit number of pages per query
)


def handler(event, context):
    """
    Main function that is executed when lambda function is triggered.
    :param event: dict containing event meta information and function arguments (here: search filters) under event.argments
    :param context: dict containing context information of triggered event
    :return: dict of nodes (id, data) and edges (edge_id, source_node_id, target_node_id, data)
    """
    start = time.time()
    search_params = event['arguments'].copy()
    attributes = NODE_ESSENTIAL

    ''' 1. CHECK AUTHORIZATION '''
    

    ''' 2. CHECK INPUT VALIDITY '''
    # checks input types for validity and returns default value if invalid
    search_params["DataSources"] = verify_input_string_list(search_params, "DataSources")
    search_params["Keywords"] = verify_input_string(search_params, "Keywords")
    search_params["Articles"] = verify_input_string(search_params, "Articles")
    search_params["Eclis"] = verify_input_string(search_params, "Eclis")
    search_params["DegreesSources"] = verify_input_int(search_params, "DegreesSources")
    search_params["DegreesTargets"] = verify_input_int(search_params, "DegreesTargets")
    search_params["DateStart"] = verify_input_string(search_params, "DateStart")
    search_params["DateEnd"] = verify_input_string(search_params, "DateEnd")
    search_params["Instances"] = verify_input_string_list(search_params, "Instances")
    search_params["Domains"] = verify_input_string_list(search_params, "Domains")
    search_params["Doctypes"] = verify_input_string_list(search_params, "Doctypes")
    # converts string of eclis into list of eclis
    search_params["Eclis"] = search_params["Eclis"].split(' ')

    ''' 3. SELECT CASES MATCHING SEARCH INPUT '''
    ''' a. select cases matching filters '''
    node_eclis, searched_dynamodb = query(search_params)

    # add li entries if permission given
    if search_params['LiPermission'] == True:
        attributes = NODE_ESSENTIAL_LI
        node_eclis_li, _ = query(search_params, li_permission=True)
        node_eclis = node_eclis.union(node_eclis_li)

    ''' b. filter selected cases by keyword match '''
    if (search_params['Keywords'] != '' or search_params['Articles'] != '') and not (node_eclis == set() and searched_dynamodb):
        print('in ES')
        es_query = build_query_elasticsearch(search_params['Keywords'], search_params['Articles'], node_eclis, search_params['LiPermission'])
        result = es_client.execute(es_query, ['ecli'])
        node_eclis = {item['_source']['ecli'] for item in result}

    ''' 4. FETCH NODES AND EDGES DATA OF SELECTED CASES '''
    nodes = batch_get(node_eclis, attributes)
    edges, new_node_eclis = fetch_edges_data(node_eclis, search_params['DegreesSources'], search_params['DegreesTargets'])
    nodes.extend(batch_get(new_node_eclis, attributes))
    
    ''' 5. FORMAT OUTPUT '''
    
    print('Duration total:', time.time()-start)
    return {'nodes': len(nodes), 'edges': len(edges)}


def build_query_elasticsearch(keywords, articles, eclis, li_permission):
    """
    Builds Elasticsearch query to filter by doc_source_eclis if provided and match keywords and articles.
    :param keywords: string of keywords in simple query string syntax*
    :param articles: string of legal provisions in simple query string syntax*
    :param doc_source_eclis: list of doc_source_eclis
    :param li_permission: boolean flag whether or not permission to access Legal Intelligence data is given
    :return: dict of Elasticsearch query in Query DSL
    * simple query string syntax: https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-simple-query-string-query.html
    """
    filters = []
    if list(eclis) != []:
        filters.append({'terms': {'ecli': list(eclis)}})
    if keywords != '': 
        fields = KEYWORD_SEARCH
        if li_permission:
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


def query(s_params, li_permission=False):
    """
    Handles querying of data to match all given input filters and keywords:
    - Queries DynamoDB by selecting the most suitable index for the given input filters and looping through all filters.
    - Queries Elasticsearch to match selected cases to keywords.
    :param s_params: dictionary of search filters
    :param li_permission: boolean flag whether or not permission to access Legal Intelligence data is given
    :return: set of DocSourceIds of cases matching search input
    """
    eclis = s_params['Eclis']

    # CASE 1: neither eclis, nor instances given --> fetch by domain:
    if s_params['Eclis'] == [''] and s_params['Instances'] == [''] and s_params['Domains'] != ['']:
        print('IN DOMAINS')
        node_eclis = set()
        for source in s_params['DataSources']:
            for doc in s_params['Doctypes']:
                for domain in s_params['Domains']:
                    dom = 'DOM_LI' if li_permission else 'DOM'
                    q_params = {
                        'IndexName': 'GSI-ItemType',
                        'ProjectionExpression': '#ecli',
                        'KeyConditionExpression': '#ItemType = :ItemType AND #SourceDocDate BETWEEN :DateStart AND :DateEnd',
                        'ExpressionAttributeNames': {'#ItemType': 'ItemType', '#ecli': 'ecli', '#SourceDocDate': 'SourceDocDate'},
                        'ExpressionAttributeValues': {
                            ':ItemType': f"{dom}_{domain}",
                            ':DateStart': f"{source}_{doc}_{s_params['DateStart']}",
                            ':DateEnd': f"{source}_{doc}_{s_params['DateEnd']}"
                        }
                    }
                    response = ddb_client.execute_query(q_params)
                    node_eclis = node_eclis.union({item['ecli'] for item in response['Items']})
        return node_eclis, True

    projection_expression = '#ecli'
    expression_attribute_names = {
        '#ecli': 'ecli',
        '#instance': 'instance',
        '#SourceDocDate': 'SourceDocDate',
        '#domains': 'domains'
    }
    if s_params['Domains'] == ['']:
        expression_attribute_names.pop('#domains')
    
    # CASE 2: eclis given
    if eclis != ['']:
        print('IN ECLIS')
        index_name = ''
        key_condition_expression = '#ecli = :ecli'
        filter_expression = 'contains(#instance, :instance) AND \
                            #SourceDocDate BETWEEN :DateStart AND :DateEnd'
        if s_params['Domains'] != ['']:
            filter_expression += ' AND contains(#domains, :domain)'

    # CASE 3: instances given
    elif s_params['Instances'] != ['']:
        print('IN INSTANCES')
        index_name = 'GSI-instance'
        key_condition_expression = '#instance = :instance AND #SourceDocDate BETWEEN :DateStart AND :DateEnd'
        filter_expression = 'contains(#domains, :domain)' if s_params['Domains'] != [''] else ''

    # CASE 4: neither eclis, nor instances, nor domains given --> only query Elasticsearch by keywords 
    else:
        print('IN ELSE')
        return set(), False

    # search li data if permission given
    if li_permission:
        index_name += '_li' if index_name == 'GSI-instance' else index_name
        expression_attribute_names['#instance'] += '_li'
        if s_params['Domains'] != ['']:
            expression_attribute_names['#domains'] += '_li'

    # query for all combinations of input filters
    node_eclis = set()
    for ecli in eclis:
        for instance in s_params['Instances']:
            for domain in s_params['Domains']:
                for source in s_params['DataSources']:
                    for doc in s_params['Doctypes']:
                        if len(node_eclis) >= 10000:
                            print('LIMIT REACHED: 10k CASES FETCHED')
                            return node_eclis, True
                        expression_attribute_values = {
                            ':instance': instance,
                            ':domain': domain,
                            ':DateStart': f"{source}_{doc}_{s_params['DateStart']}",
                            ':DateEnd': f"{source}_{doc}_{s_params['DateEnd']}"
                        }
                        if domain == '':
                            expression_attribute_values.pop(':domain')
                        q_params = {
                            'ProjectionExpression': projection_expression,
                            'KeyConditionExpression': key_condition_expression,
                            'FilterExpression': filter_expression,
                            'ExpressionAttributeNames': expression_attribute_names,
                            'ExpressionAttributeValues': expression_attribute_values
                        }
                        if filter_expression == '':
                            q_params.pop('FilterExpression')
                        if index_name == '':
                            expression_attribute_values[':ecli'] = ecli
                        else:
                            q_params['IndexName'] = index_name
                        response = ddb_client.execute_query(q_params)
                        node_eclis = node_eclis.union({item['ecli'] for item in response['Items']})
    return node_eclis, True


def batch_get(eclis, return_attributes):
    """
    Selects cases by ecli from DynamoDB and returns specified meta data.
    :param eclis: set of eclis
    :param return_attributes: list of attributes to return
    :return: list of node dicts (containing id, data)
    """
    keys_list = []
    for ecli in eclis:
        keys_list.append({'ecli': ecli, 'ItemType': 'DATA'})

    items = ddb_client.execute_batch(keys_list, return_attributes)

    nodes = []
    for item in items:
        data = format_node(item)
        nodes.extend([{'id': item['ecli'], 'data': data}])
    return nodes


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
        target_keys.append({'ecli': ecli, 'ItemType': 'DATA'})
        source_keys.append({'ecli': ecli, 'ItemType': 'DATA'})

    # c_sources:
    for _ in range(degrees_sources):
        next_targets = []
        items = ddb_client.execute_batch(target_keys, ['ecli', 'cites'])
        for item in items:
            if 'cites' in item:
                for citation in item['cites']:
                    next_targets.extend([{'ecli': citation, 'ItemType': 'DATA'}])
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
                    next_sources.extend([{'ecli': citation, 'ItemType': 'DATA'}])
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

    return edges, new_node_eclis


def format_node(item):
    atts = list(item.keys())
    for attribute in atts:
        # remove li attribute if correspondig rs attribute present
        if attribute in NODE_ESSENTIAL and attribute + '_li' in item:
            item.pop(attribute + '_li')
        # convert set types to lists to make JSON serializable
        if attribute in item and type(item[attribute]) is set:
            item[attribute] = list(item[attribute])
        # remove '_li' suffix from attribute name if applicable
        if attribute in item and attribute.endswith('_li'):
            item[attribute[:-3]] = item[attribute]
            item.pop(attribute)
    return item



def verify_input_string(s_params, key):
    val = s_params.get(key)
    if val is None or not isinstance(val, str):
        warnings.warn(f"Invalid input: argument '{key}' of type string expected. Setting '{key}' to ''.")
        return ""
    else:
        return val


def verify_input_string_list(s_params, key):
    val = s_params.get(key)
    if val is None or not isinstance(val, list) or not all(isinstance(elem, str) for elem in val) or len(val) < 1:
        warnings.warn(f"Invalid input: argument '{key}' of type list of strings expected. Setting '{key}' to [''].")
        return [""]
    else:
        return val


def verify_input_int(s_params, key):
    val = s_params.get(key)
    if val is None or not isinstance(val, int) or val < 0:
        warnings.warn(f"Invalid input: argument '{key}' of type int >= 0 expected. Setting '{key}' to 0.")
        return 0
    else:
        return val
