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

HARD_LIMIT = 1000                  # 3000 -> *3 (+ sources + targets)

DDB_ITEM_LIMIT = 1000                     # 500   (10)
DDB_PAGE_LIMIT = 50                     # 10    (5)


# set up Elasticsearch client
es_client = ElasticsearchClient(
    endpoint=ELASTICSEARCH_ENDPOINT,
    index=TABLE_NAME.lower(),
    max_hits=HARD_LIMIT,             # max number of hits (matching items) per query (page)
    page_limit=10                    # max number of queries (pages)
    #timeout= 20                    # request timeout in s
)

# set up DynamoDB client
ddb_client = DynamodbClient(
    table_name=os.getenv(f'API_CASEEXPLORERUI_{TABLE_NAME.upper()}TABLE_NAME'),
    item_limit=DDB_ITEM_LIMIT,            # max number of items to scan per page (not necessarily matches)
    page_limit=DDB_PAGE_LIMIT,            # max number of pages to scan (1 page = 1 DDB query)
    max_hits=HARD_LIMIT                   # max number of matching items to return
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
        authorized = True        

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
    start_p = time.time()
    nodes, limit_reached = query_nodes(query_helper)
    print(f'NODES:\t took {time.time() - start_p} s.')

    # 2. FETCH EDGES AND NEW TARGET NODES
    start_p = time.time()
    edges, new_nodes, edges_limit_reached = fetch_edges(nodes[:HARD_LIMIT], query_helper)
    #if not TEST:
    nodes += new_nodes
    limit_reached = limit_reached or edges_limit_reached
    print(f'EDGES:\t took {time.time() - start_p} s.')

    # format nodes
    start_p = time.time()
    nodes = [format_node_data(node) for node in nodes]
    print(f'FORMAT:\t took {time.time() - start_p} s.')

    # 3. COMPUTE NETWORK STATISTICS
    start_p = time.time()
    statistics, nodes = add_network_statistics(nodes, edges)
    print(f'STATS:\t took {time.time() - start_p} s.')

    message = 'Query limit reached! Only partial result displayed.' if limit_reached else ''
    
    print('Duration total:\t', time.time() - start)
    if TEST:
        print(f'nodes: {len(nodes)}\nedges: {len(edges)}\nstatistics: {len(statistics)}\nmessage: {message}')
        #return {}
        return {'nodes': nodes[:1], 'edges': edges[:1], 'statistics': statistics[nodes[0]['id']], 'message': message}
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
            if len(nodes) >= HARD_LIMIT:
                print(f'Limit reached (@ query nodes): {len(nodes)} cases fetched.')
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
                            if len(nodes) >= HARD_LIMIT:
                                print(f'Limit reached (@ query nodes): {len(nodes)} cases fetched.')
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
                        if len(nodes) >= HARD_LIMIT:
                            print(f'Limit reached (@ query nodes): {len(nodes)} cases fetched.')
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
                    if len(node_keys) >= HARD_LIMIT: 
                        print(f'Limit reached (@ query nodes): {len(node_keys)} cases fetched.')
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

    # CASE 5: neither eclis, nor instances, nor domains given
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
    def fetch_sources(total_node_eclis):
        items = nodes
        new_node_keys = []
        edges = []
        for _ in range(helper.search_params[DEGREES_SOURCES]):
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
                        if source not in total_node_eclis:
                            total_node_eclis.append(source)
                            new_node_keys.append(get_key(source))
                        if len(total_node_eclis) >= 2*HARD_LIMIT:
                            print(f'Limit reached (@ source edges): {len(total_node_eclis)} cases fetched.')
                            return total_node_eclis, edges, new_node_keys, True
            items = ddb_client.execute_batch(target_keys, ['ecli', 'cited_by'])
        return total_node_eclis, edges, new_node_keys, False

    def fetch_targets(total_node_eclis):
        items = nodes
        new_node_keys = []
        edges = []
        for _ in range(helper.search_params[DEGREES_TARGETS]):
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
                        if target not in total_node_eclis:
                            total_node_eclis.append(target)
                            new_node_keys.append(get_key(target))
                        if len(total_node_eclis) >= 3*HARD_LIMIT:
                            print(f'Limit reached (@ target edges): {len(total_node_eclis)} cases fetched.')
                            return total_node_eclis, edges, new_node_keys, True
            items = ddb_client.execute_batch(source_keys, ['ecli', 'cites'])
        return total_node_eclis, edges, new_node_keys, False

    total_node_eclis = [node['ecli'] for node in nodes]
    total_node_eclis, edges_sources, new_node_keys_sources, sources_limit_reached = fetch_sources(total_node_eclis)
    print(f'Sources fetched ({len(edges_sources)}).')
    total_node_eclis, edges_targets, new_node_keys_targets, targets_limit_reached = fetch_targets(total_node_eclis)
    print(f'Targets fetched ({len(edges_targets)}).')
    new_nodes = ddb_client.execute_batch(new_node_keys_sources + new_node_keys_targets, helper.return_attributes)

    return edges_sources + edges_targets, new_nodes, sources_limit_reached or targets_limit_reached



