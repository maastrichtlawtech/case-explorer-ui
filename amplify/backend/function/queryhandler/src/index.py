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
from warnings import resetwarnings
# @TODO: remove imported local modules to make function dependent on lambda layers (not suitable for testing)
from opensearch_client import OpenSearchClient
from dynamodb_client import DynamodbClient
from queryhelper import QueryHelper
from utils import get_key, format_node_data, verify_input_string_list, verify_eclis, verify_input_string, \
    verify_date_start, verify_date_end, verify_degrees, is_authorized, verify_data_sources, verify_doc_types
from definitions import TABLE_NAME, OPENSEARCH_ENDPOINT, OPENSEARCH_INDEX_NAME, ARTICLES, DATA_SOURCES, DATE_START, DATE_END, \
    DEGREES_SOURCES, DEGREES_TARGETS, DOCTYPES, DOMAINS, ECLIS, INSTANCES, KEYWORDS, get_networkstatistics_attributes
import pandas as pd
import json


TEST = False                        # returns number of nodes instead of nodes
HARD_LIMIT = 5000                  
SUBNET_LIMIT = 700


# set up DynamoDB client
ddb_client = DynamodbClient(
    table_name=os.getenv(f'API_CASEEXPLORERUI_{TABLE_NAME.upper()}TABLE_NAME'),
    item_limit=1000,            # max number of items to scan per page (not necessarily matches)
    page_limit=50,            # max number of pages to scan (1 page = 1 DDB query)
    max_hits=HARD_LIMIT                   # max number of matching items to return
)

# set up Elasticsearch client
es_client = OpenSearchClient(
    endpoint=OPENSEARCH_ENDPOINT,
    index=OPENSEARCH_INDEX_NAME,
    max_hits=1000,             # max number of hits (matching items) per query (page)
    page_limit=HARD_LIMIT/1000,                    # max number of queries (pages)
    #timeout= 5                    # request timeout in s
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
    all_nodes, limit_reached = query_nodes(query_helper)
    print(f'NODES:\t took {time.time() - start_p} s.')

    # 2. FETCH EDGES AND NEW TARGET NODES
    start_p = time.time()
    all_edges, new_nodes, edges_limit_reached = fetch_edges(all_nodes[:HARD_LIMIT], query_helper)
    all_nodes = [format_node_data(node, get_networkstatistics_attributes(authorized)) for node in all_nodes]
    #if not TEST:
    all_nodes += new_nodes
    limit_reached = limit_reached or edges_limit_reached
    print(f'EDGES:\t took {time.time() - start_p} s.')

    # 3. GENERATE SUBNETWORK
    start_p = time.time()
    nodes, edges = get_subnet(all_nodes, all_edges)
    print(f'SUBNET:\t took {time.time() - start_p} s.')

    # @TODO: remove after testing
    if TEST:
        with open('edges.json', 'w') as f:
            json.dump(all_edges, f)
        with open('nodes.json', 'w') as f:
            json.dump(all_nodes, f)
        with open('subNodes.json', 'w') as f:
            json.dump(nodes, f)

    message = 'Query limit reached! Only partial result displayed.' if limit_reached else ''
    
    print('Duration total:\t', time.time() - start)
    if TEST:
        print(f'allNodes: {len(all_nodes)}\nallEdges: {len(all_edges)}\nnodes: {len(nodes)}\nedges: {len(edges)}\nmessage: {message}')
        til = 10
        return {
            'allNodes': all_nodes[:til], 
            'allEdges': all_edges[:til], 
            'nodes': nodes[:til], 
            'edges': edges[:til],
            'message': message
        }
    return {
        'allNodes': all_nodes, 
        'allEdges': all_edges, 
        'nodes': nodes, 
        'edges': edges,
        'message': message
    }
    

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
        filter_expression = helper.get_ddb_filter_expression_sourcedocdate() #& helper.get_ddb_filter_expression_citation()
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
        #filter_expression = helper.get_ddb_filter_expression_citation()
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
                                FilterExpression = helper.get_ddb_filter_expression_domain(domain)
                                #FilterExpression=filter_expression & helper.get_ddb_filter_expression_domain(domain)
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
                            #FilterExpression=filter_expression,
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
        nodes = [item['_source'] for item in result]
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
    def fetch_sources():
        items = nodes
        new_node_eclis = set()
        edges = []
        for degree in range(helper.search_params[DEGREES_SOURCES]):
            if degree != 0:
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
                        new_node_eclis.add(source)
        return edges, new_node_eclis, False

    def fetch_targets():
        items = nodes
        new_node_eclis = set()
        edges = []
        for degree in range(helper.search_params[DEGREES_TARGETS]):
            if degree != 0:
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
                        new_node_eclis.add(target)
        return edges, new_node_eclis, False

    old_node_eclis = {node['ecli'] for node in nodes}
    edges_sources, new_node_eclis_sources, sources_limit_reached = fetch_sources()
    print(f'Sources fetched ({len(edges_sources)}).')
    edges_targets, new_node_eclis_targets, targets_limit_reached = fetch_targets()
    print(f'Targets fetched ({len(edges_targets)}).')
    new_node_eclis = new_node_eclis_sources.union(new_node_eclis_targets).difference(old_node_eclis)
    new_nodes = [{'id': ecli, 'data': {}} for ecli in new_node_eclis]

    return edges_sources + edges_targets, new_nodes, sources_limit_reached or targets_limit_reached


def get_subnet(nodes, edges):
    if len(edges) == 0:
        return [{'id': node['id'], 'data': {}} for node in nodes[:SUBNET_LIMIT]], edges

    df = pd.DataFrame(edges)
    sources = df.groupby('source').agg(list)
    targets = df.groupby('target').agg(list)
    full = pd.concat([sources, targets], axis=1)
    full.columns = ['id1', 'target', 'id2', 'source']
    full.reset_index(level=0, inplace=True)
    full['index'] = full['index'].apply(lambda x: [x])
    full = full.fillna("").applymap(list)
    full['degree'] = (full.source + full.target).apply(len)
    full.sort_values(by='degree', ascending=False, inplace=True)

    node_eclis = set()
    edge_ids = set()
    for index, row in full.iterrows():
        if row['degree'] >= SUBNET_LIMIT:
            continue
        node_eclis_peak = node_eclis.union(set(ecli for ecli in row['index'] + row['source'] + row['target']))
        edge_ids_peak = edge_ids.union(set(edge_id for edge_id in row['id1'] + row['id2']))
        if len(node_eclis_peak) > SUBNET_LIMIT:
            break
        node_eclis = node_eclis_peak
        edge_ids = edge_ids_peak

    result_nodes = [{'id': ecli, 'data': {}} for ecli in node_eclis]
    result_edges = [{'id': edge_id, 'source': edge_id.split('_')[0], 'target': edge_id.split('_')[1]} for edge_id in edge_ids]

    
    return result_nodes, result_edges

