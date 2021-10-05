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
from queryhelper import QueryHelper
from utils import get_key, format_node_data, verify_input_string_list, verify_eclis, verify_input_string, \
    verify_date_start, verify_date_end, verify_degrees, is_authorized, verify_data_sources, verify_doc_types
from definitions import *
from network_statistics import add_network_statistics


TEST = False                        # returns number of nodes instead of nodes

MAX_ITEMS = 1000                     # 500   (10)
MAX_PAGES = 100                     # 10    (5)

HARD_LIMIT = 10


# set up Elasticsearch client
es_client = ElasticsearchClient(
    endpoint=ELASTICSEARCH_ENDPOINT,
    index=TABLE_NAME.lower(),
    max_hits=MAX_ITEMS,             # max number of hits (matching items) per query (page)
    page_limit=10                    # max number of queries (pages)
    #timeout= 20                    # request timeout in s
)

# set up DynamoDB client
ddb_client = DynamodbClient(
    table_name=os.getenv(f'API_CASEEXPLORERUI_{TABLE_NAME.upper()}TABLE_NAME'),
    item_limit=MAX_ITEMS,           # max number of items to evaluate (not necessarily matches) per query (page)
    page_limit=MAX_PAGES            # max number of queries (pages)
)

def handler(event, context):
    """
    Main function that is executed when lambda function is triggered.
    :param event: dict containing event meta information and function arguments (here: search filters) under event.argments
    :param context: dict containing context information of triggered event
    :return: dict of nodes (id, data) and edges (edge_id, source_node_id, target_node_id, data)
    """
    start = time.time()


    # CHECK USER AUTHORIZATION
    authorized = is_authorized(event)
    if TEST:
        authorized = False        

    # CHECK INPUT VALIDITY
    search_params = event['arguments'].copy()
    search_params[ARTICLES] = verify_input_string(ARTICLES, search_params)
    search_params[DATA_SOURCES] = verify_data_sources(DATA_SOURCES, search_params)
    search_params[DATE_START] = verify_date_start(DATE_START, search_params)
    search_params[DATE_END] = verify_date_end(DATE_END, search_params)
    search_params[DEGREES_SOURCES] = verify_degrees(DEGREES_SOURCES, search_params)
    search_params[DEGREES_TARGETS] = verify_degrees(DEGREES_TARGETS, search_params)
    search_params[DOCTYPES] = verify_doc_types(DOCTYPES, search_params)
    search_params[DOMAINS] = verify_input_string_list(DOMAINS, search_params)
    search_params[ECLIS] = verify_eclis(ECLIS, search_params)
    search_params[INSTANCES] = verify_input_string_list(INSTANCES, search_params)
    search_params[KEYWORDS] = verify_input_string(KEYWORDS, search_params)

    query_helper = QueryHelper(search_params, authorized)

    # 1. QUERY NODES MATCHING SEARCH INPUT
    nodes, limit_reached = query_nodes(query_helper)

    # 2. FETCH EDGES AND NEW TARGET NODES
    edges, new_nodes, edges_limit_reached = fetch_edges(nodes[:HARD_LIMIT], query_helper)
    #if not TEST:
    nodes += new_nodes
    limit_reached = limit_reached or edges_limit_reached

    # format nodes
    nodes = [format_node_data(node) for node in nodes]

    # 3. COMPUTE NETWORK STATISTICS
    statistics, nodes = add_network_statistics(nodes, edges)

    message = 'Query limit reached! Only partial result displayed.' if limit_reached else ''
    
    print('Duration total:', time.time() - start)
    if TEST:
        print(f'nodes: {len(nodes)}\n edges: {len(edges)}\n statistics: {len(statistics)}\n message: {message}')
        return {'nodes': nodes[:10], 'edges': edges[:2], 'statistics': statistics[nodes[0]['id']], 'message': message}
    return {'nodes': nodes, 'edges': edges, 'statistics': statistics, 'message': message}
    



def query_nodes(helper):
    """
    Handles querying of data to match all given input filters and keywords:
    - Queries DynamoDB by selecting the most suitable index for the given input filters and looping through all filters.
    - Queries Elasticsearch to match selected cases to keywords.
    :param s_params: dictionary of search filters
    :param authorized: boolean flag whether or not user authorized to access Legal Intelligence data
    :return: set of DocSourceIds of cases matching search input, 
             boolean flag whether or not DynamoDB was searched, 
             boolean flag whether or not node limit was reached
    """
    projection_expression, expression_attribute_names = helper.get_ddb_projection_expression()

    def query_ddb_by_eclis():
        def filter_nodes_by_domains(nodes):
            if helper.search_params[DOMAINS]:
                nodes_clean = []
                for node in nodes:
                    if 'domains' in node and len(node['domains'].intersection(helper.search_params[DOMAINS])) != 0 or \
                        'domains_li' in node and len(node['domains_li'].intersection(helper.search_params[DOMAINS])) != 0:
                        nodes_clean.append(node)
                return nodes_clean
            return nodes
        nodes = []
        limit_reached = False
        filter_expression = helper.get_ddb_filter_expression_sourcedocdate() & helper.get_ddb_filter_expression_citation()
        if helper.search_params[INSTANCES]:
            filter_expression = filter_expression \
                & helper.get_ddb_filter_expression_instances()
            
        for ecli in helper.search_params[ECLIS]:  
            response, ddb_limit_reached = ddb_client.execute_query(
                ProjectionExpression=projection_expression,
                KeyConditionExpression=helper.get_ddb_key_expression_ecli(ecli),
                FilterExpression=filter_expression,
                ExpressionAttributeNames=expression_attribute_names
            )
            limit_reached = limit_reached or ddb_limit_reached
            nodes.extend(response['Items'])
            #if ddb_limit_reached or len(nodes) >= MAX_ITEMS:
            if len(nodes) >= MAX_ITEMS:
                print(f'LIMIT REACHED: {len(nodes)} CASES FETCHED')
                return filter_nodes_by_domains(nodes), True
        return filter_nodes_by_domains(nodes), limit_reached

    def query_ddb_by_instances(li_mode=False):
        nodes = []
        index_name = 'GSI-instance'
        key_name = 'instance'
        limit_reached = False
        if li_mode:
            index_name += '_li'
            key_name += '_li'
        filter_expression = helper.get_ddb_filter_expression_citation()
        if helper.search_params[DOMAINS]:
            for domain in helper.search_params[DOMAINS]:
                for instance in helper.search_params[INSTANCES]:
                    for source in helper.search_params[DATA_SOURCES]:
                        for doc in helper.search_params[DOCTYPES]:
                            response, ddb_limit_reached = ddb_client.execute_query(
                                IndexName=index_name,
                                ProjectionExpression=projection_expression,
                                KeyConditionExpression=helper.get_ddb_key_expression_instance(key_name, instance, source, doc),
                                ExpressionAttributeNames=expression_attribute_names,
                                FilterExpression=filter_expression & helper.get_ddb_filter_expression_domain(domain)
                            )
                            limit_reached = limit_reached or ddb_limit_reached
                            nodes.extend(response['Items'])
                            #if ddb_limit_reached or len(nodes) >= MAX_ITEMS:
                            if len(nodes) >= MAX_ITEMS:
                                print(f'LIMIT REACHED: {len(nodes)} CASES FETCHED')
                                return nodes, True
        else:
            for instance in helper.search_params[INSTANCES]:
                for source in helper.search_params[DATA_SOURCES]:
                    for doc in helper.search_params[DOCTYPES]:
                        response, ddb_limit_reached = ddb_client.execute_query(
                            IndexName=index_name,
                            ProjectionExpression=projection_expression,
                            KeyConditionExpression=helper.get_ddb_key_expression_instance(key_name, instance, source, doc),
                            FilterExpression=filter_expression,
                            ExpressionAttributeNames=expression_attribute_names
                        )
                        nodes.extend(response['Items'])
                        limit_reached = limit_reached or ddb_limit_reached
                        #if ddb_limit_reached or len(nodes) >= MAX_ITEMS:
                        if len(nodes) >= MAX_ITEMS:
                            print(f'LIMIT REACHED: {len(nodes)} CASES FETCHED')
                            return nodes, True
        return nodes, limit_reached

    def query_ddb_by_domains(mode=''):
        limit_reached = False
        node_keys = []
        key_prefix = 'DOM_LI' if mode == 'li' else 'DOM'
        for domain in helper.search_params[DOMAINS]:
            for source in helper.search_params[DATA_SOURCES]:
                for doc in helper.search_params[DOCTYPES]:
                    response, ddb_limit_reached = ddb_client.execute_query(
                        IndexName='GSI-ItemType',
                        ProjectionExpression='#ecli',
                        KeyConditionExpression=helper.get_ddb_key_expression_domain(key_prefix, domain, source, doc),
                        ExpressionAttributeNames={'#ecli': 'ecli'},
                    )
                    limit_reached = limit_reached or ddb_limit_reached
                    node_keys.extend([get_key(item['ecli']) for item in response['Items']])
                    #if ddb_limit_reached or len(node_keys) >= MAX_ITEMS:
                    if len(node_keys) >= MAX_ITEMS: 
                        print(f'LIMIT REACHED: {len(node_keys)} CASES FETCHED')
                        nodes = ddb_client.execute_batch(node_keys, helper.return_attributes)
                        return nodes, True
        nodes = ddb_client.execute_batch(node_keys, helper.return_attributes)
        return nodes, limit_reached



    # CASE 1: keywords and/or articles given --> search elasticsearch:
    if helper.search_params[KEYWORDS] or helper.search_params[ARTICLES]:
        print('in ES')
        es_query = helper.get_elasticsearch_query()
        result, limit_reached = es_client.execute(es_query, helper.return_attributes)
        nodes = []
        for item in result:
            response, ddb_limit_reached = ddb_client.execute_query(
                ProjectionExpression=projection_expression,
                KeyConditionExpression=helper.get_ddb_key_expression_ecli(item['_source']['ecli']),
                FilterExpression=helper.get_ddb_filter_expression_citation(),
                ExpressionAttributeNames=expression_attribute_names
            )
            nodes.extend(response['Items'])
            if len(nodes) >= HARD_LIMIT:
                break
        #nodes = [item['_source'] for item in result]
        return nodes[:HARD_LIMIT], limit_reached


    # CASE 2: no keywords, but eclis given
    elif helper.search_params[ECLIS]:
        print('IN ECLIS')
        nodes, limit_reached = query_ddb_by_eclis()
        return nodes[:HARD_LIMIT], limit_reached


    # CASE 3: no keywords or eclis, but instances given
    elif helper.search_params[INSTANCES]:
        print('IN INSTANCES')
        nodes, limit_reached = query_ddb_by_instances()
        if helper.authorized and not limit_reached:
            nodes_li, limit_reached = query_ddb_by_instances(li_mode=True)
            for node in nodes_li:
                if not node in nodes:
                    nodes.append(node)
        return nodes[:HARD_LIMIT], limit_reached


    # CASE 4: no keywords, eclis or instances, but domains given
    elif helper.search_params[DOMAINS]:
        print('IN DOMAINS')
        nodes, limit_reached = query_ddb_by_domains()
        if helper.authorized and not limit_reached:
            nodes_li, limit_reached = query_ddb_by_domains(mode='li')
            for node in nodes_li:
                if not node in nodes:
                    nodes.append(node)
        return nodes[:HARD_LIMIT], limit_reached

    # CASE 5: neither eclis, nor instances, nor domains given --> only query Elasticsearch by keywords 
    else:
        print('IN ELSE')
        return [], False


def fetch_edges(nodes, helper):
    """
    Queries source and target citations by doc_source_id from DynamoDB and returns corresponding edges.
    :param doc_source_eclis: set of doc_source_eclis  
    :param degrees_sources: int degree of source citations
    :param degrees_targets: int degree of target citations
    :return: list of edge dicts (containing edge_id, source_id, target_id, data), 
             set of new node eclis, 
             flag whether or not query limit was reached
    """
    #node_eclis = [node['ecli'] for node in nodes]
    node_eclis = []
    new_node_keys = []
    edges = []
    source_keys = []
    target_keys = []

    for node in nodes:
        node_eclis.append(node['ecli'])
        source_keys.append(get_key(node['ecli']))
        target_keys.append(get_key(node['ecli']))

    # @TODO items = nodes

    # c_sources:
    for _ in range(helper.search_params[DEGREES_SOURCES]):
        items = ddb_client.execute_batch(target_keys, ['ecli', 'cited_by'])
        target_keys = []
        for item in items:
            target = item['ecli']
            if 'cited_by' in item:
                for source in item['cited_by']:
                    target_keys.append(get_key(source))
                    edges.append({
                        'id': f"{source}_{target}", 
                        'source': source, 
                        'target': target
                    })
                    if source not in node_eclis:
                        node_eclis.append(source)
                        new_node_keys.append(get_key(source))
                    if len(edges) >= MAX_ITEMS:
                        new_nodes = ddb_client.execute_batch(new_node_keys, helper.return_attributes)
                        return edges, new_nodes, True
        # @TODO items = ddb_client.execute_batch(target_keys, ['ecli', 'cited_by'])

    # @TODO items = nodes

    # targets:
    for _ in range(helper.search_params[DEGREES_TARGETS]):
        items = ddb_client.execute_batch(source_keys, ['ecli', 'cites'])
        source_keys = []
        for item in items:
            source = item['ecli']
            if 'cites' in item:
                for target in item['cites']:
                    source_keys.append(get_key(target))
                    edges.append({
                        'id': f"{source}_{target}", 
                        'source': source, 
                        'target': target
                    })
                    if target not in node_eclis:
                        node_eclis.append(target)
                        new_node_keys.append(get_key(target))
                    if len(edges) >= 2*MAX_ITEMS:
                        new_nodes = ddb_client.execute_batch(new_node_keys, helper.return_attributes)
                        return edges, new_nodes, True
        # @TODO items = ddb_client.execute_batch(source_keys, ['ecli', 'cites'])

    new_nodes = ddb_client.execute_batch(new_node_keys, helper.return_attributes)
    return edges, new_nodes, False



