import networkx as nx
from networkx.readwrite import json_graph
import warnings
import community
import time
import json
from utils import get_key, format_node_data
from clients.dynamodb_client import DynamodbClient
from definitions import TABLE_NAME, get_networkstatistics_attributes
import os
# taken from and modified: 
# https://github.com/caselawanalytics/CaseLawAnalytics/blob/master/caselawnet/network_analysis.py

TEST = False

def handler(event, context):
    start = time.time()

    #@TODO: remove after testing
    if TEST:
        with open('edges.json') as f:
            edges = json.load(f)
        with open('nodes.json') as f:
            old_nodes = json.load(f)
        with open('subNodes.json') as f:
            sub_nodes = json.load(f)
    else:
        network = event['arguments'].copy()
        old_nodes = network['nodes']
        edges = network['edges']
        sub_nodes = network['subNodes']

    # fetch missing meta data
    start_p = time.time()
    missing_node_keys = []
    nodes = []
    for node in old_nodes:
        if 'date_decision' not in node['data']:
            missing_node_keys.append(get_key(node['id']))
        else:
            nodes.append(node)
    print(f'get missing node keys: took {time.time()-start_p} s.')
    start_p = time.time()
    ddb_client = DynamodbClient(table_name=os.getenv(f'API_CASEEXPLORERUI_{TABLE_NAME.upper()}TABLE_NAME'))
    return_attributes = get_networkstatistics_attributes()
    missing_nodes = ddb_client.execute_batch(missing_node_keys, return_attributes)
    print(f'fetch missing nodes: took {time.time()-start_p} s.')
    start_p = time.time()
    missing_nodes = [format_node_data(node, return_attributes) for node in missing_nodes]
    nodes.extend(missing_nodes)
    print(f'format missing nodes: took {time.time()-start_p} s.')
    start_p = time.time()

    statistics = dict()
    if len(nodes) == 0:
        return statistics  #, nodes
    start_p = time.time()
    graph = get_network(nodes, edges)
    print(f'get network: took {time.time()-start_p} s.')
    start_p = time.time()
    partition = community.best_partition(nx.Graph(graph))
    print(f'get partition: took {time.time()-start_p} s.')
    start_p = time.time()
    degree = nx.degree(graph)
    print(f'get degree: took {time.time()-start_p} s.')
    if max(dict(degree).values()) > 0:
        start_p = time.time()
        hubs, authorities = get_hits(graph)
        print(f'get hubs & authorities: took {time.time()-start_p} s.')
        start_p = time.time()
        in_degree = graph.in_degree()
        print(f'get in degree: took {time.time()-start_p} s.')
        start_p = time.time()
        out_degree = graph.out_degree()
        print(f'get out degree: took {time.time()-start_p} s.')
        start_p = time.time()
        degree_centrality = nx.degree_centrality(graph)
        print(f'get degree centrality: took {time.time()-start_p} s.')
        start_p = time.time()
        in_degree_centrality = nx.in_degree_centrality(graph)
        print(f'get in degree centrality: took {time.time()-start_p} s.')
        start_p = time.time()
        out_degree_centrality = nx.out_degree_centrality(graph)
        print(f'get out degree centrality: took {time.time()-start_p} s.')
        start_p = time.time()
        if len(nodes) < 2500:
            betweenness_centrality = nx.betweenness_centrality(graph)
        else:
            betweenness_centrality = nx.betweenness_centrality(graph, k=2500)
        print(f'get betweenness centrality: took {time.time()-start_p} s.')
        start_p = time.time()
        closeness_centrality = nx.closeness_centrality(graph)
        print(f'get closeness centrality: took {time.time()-start_p} s.')
        start_p = time.time()
        page_rank = get_pagerank(graph)
        print(f'get page rank: took {time.time()-start_p} s.')
        network_stats = {
            'degree': degree,
            'in_degree': in_degree,
            'out_degree': out_degree,
            'degree_centrality': degree_centrality,
            'in_degree_centrality': in_degree_centrality,
            'out_degree_centrality': out_degree_centrality,
            'betweenness_centrality': betweenness_centrality,
            'closeness_centrality': closeness_centrality,
            'page_rank': page_rank,
            'hubs': hubs,
            'authorities': authorities
        }
        """
        @TODO: after testing
        network_stats = {
            'degree': degree,
            'in_degree': graph.in_degree(),
            'out_degree': graph.out_degree(),
            'degree_centrality': nx.degree_centrality(graph),
            'in_degree_centrality': nx.in_degree_centrality(graph),
            'out_degree_centrality': nx.out_degree_centrality(graph),
            'betweenness_centrality': nx.betweenness_centrality(graph),
            'closeness_centrality': nx.closeness_centrality(graph),
            'page_rank': get_pagerank(graph),
            'hubs': hubs,
            'authorities': authorities
        }
        """
        print(f'get other stats: took {time.time()-start_p} s.')
    else:
        network_stats = {}
    print(f'STATS: compute network took: {time.time() - start} s.')
    start = time.time()
    # for relative in-degree we sort on date
    derive_date = lambda k: k['data']['date_decision'] if 'date_decision' in k['data'] and k['data']['date_decision'] != '' else '1900-01-01' # @ TODO: which default date?
    nodes.sort(key=derive_date, reverse=True)
    for i, node in enumerate(nodes):
        node_id = node['id']
        statistics[node_id] = {'community': str(partition[node_id])}
        for var in network_stats.keys():
            statistics[node_id][var] = network_stats[var][node_id]
        if 'in_degree' in network_stats:
            statistics[node_id]['rel_in_degree'] = network_stats['in_degree'][node_id] / float(max(i, 1))
        if 'date_decision' in node['data']:
            statistics[node_id]['year'] = node['data']['date_decision'][:4]
    print(f'STATS: add to nodes took: {time.time() - start} s.')

    start_p = time.time()
    sub_statistics = dict()
    for node in sub_nodes:
        node_id = node['id']
        if node_id in statistics:
            sub_statistics[node_id] = statistics[node_id]
            # add year, authorities, hubs, community to node meta data:
            for stat in ['year', 'authorities', 'hubs', 'community']:
                if stat in statistics[node_id]:
                    node['data'][stat] = statistics[node_id][stat]
    print(f'select sub stats and nodes: took {time.time()-start_p} s.')
    
    if TEST:
        return len(sub_statistics), len(sub_nodes)
    
    return sub_statistics  #, sub_nodes

def get_network(nodes, edges):
    graph = json_graph.node_link_graph({'nodes': nodes, 'links': edges}, directed=True, multigraph=False)
    return graph

def get_hits(graph, max_iter=10000):
    try:
        hubs, authorities = nx.hits(graph, max_iter=max_iter)
        return hubs, authorities
    except nx.NetworkXError:
        # It is possible that the HITS algorithm doesn't converge
        warnings.warn('HITS algorithm did not converge!',
                      Warning)
        h = dict.fromkeys(graph, 1.0 / graph.number_of_nodes())
        hubs, authorities = h, h
        return hubs, authorities

def get_pagerank(graph, max_iter=10000):
    try:
        pagerank = nx.pagerank(graph, max_iter=max_iter)
        return pagerank
    except nx.NetworkXError:
        # It is possible that the pagerank algorithm doesn't converge
        warnings.warn('PageRank algorithm did not converge!',
                      Warning)
        p = dict.fromkeys(graph, 1.0 / graph.number_of_nodes())
        return p
