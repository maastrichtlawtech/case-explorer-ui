from networkx import Graph, degree, degree_centrality, in_degree_centrality, out_degree_centrality, \
    betweenness_centrality, closeness_centrality, hits, pagerank, NetworkXError
from networkx.readwrite import json_graph
from warnings import warn
from community import best_partition
from time import time
# taken from and modified: 
# https://github.com/caselawanalytics/CaseLawAnalytics/blob/master/caselawnet/network_analysis.py

TEST = False

def handler(event, context):
    start = time()

    #@TODO: remove after testing
    if TEST:
        from json import load
        with open('edges.json') as f:
            edges = load(f)
        with open('nodes.json') as f:
            nodes = load(f)
    else:
        network = event['arguments'].copy()
        nodes = network['nodes']
        edges = network['edges']

    start_p = time()
    statistics = dict()
    if len(nodes) == 0:
        return statistics
    start_p = time()
    graph = get_network(nodes, edges)
    print(f'get network: took {time()-start_p} s.')
    start_p = time()
    partition = best_partition(Graph(graph))
    print(f'get partition: took {time()-start_p} s.')
    start_p = time()
    degrees = degree(graph)
    print(f'get degree: took {time()-start_p} s.')
    if max(dict(degrees).values()) > 0:
        start_p = time()
        hubs, authorities = get_hits(graph)
        print(f'get hubs & authorities: took {time()-start_p} s.')
        start_p = time()
        in_degrees = graph.in_degree()
        print(f'get in degree: took {time()-start_p} s.')
        start_p = time()
        out_degrees = graph.out_degree()
        print(f'get out degree: took {time()-start_p} s.')
        start_p = time()
        degree_centralities = degree_centrality(graph)
        print(f'get degree centrality: took {time()-start_p} s.')
        start_p = time()
        in_degree_centralities = in_degree_centrality(graph)
        print(f'get in degree centrality: took {time()-start_p} s.')
        start_p = time()
        out_degree_centralities = out_degree_centrality(graph)
        print(f'get out degree centrality: took {time()-start_p} s.')
        start_p = time()
        if len(nodes) < 2500:
            betweenness_centralities = betweenness_centrality(graph)
        else:
            betweenness_centralities = betweenness_centrality(graph, k=2500)
        print(f'get betweenness centrality: took {time()-start_p} s.')
        start_p = time()
        closeness_centralities = closeness_centrality(graph)
        print(f'get closeness centrality: took {time()-start_p} s.')
        start_p = time()
        page_ranks = get_pagerank(graph)
        print(f'get page rank: took {time()-start_p} s.')

        start_p = time()
        # for relative in-degree we sort on date
        derive_date = lambda k: k['data']['date_decision'] if 'date_decision' in k['data'] and k['data']['date_decision'] != '' else '1900-01-01' # @ TODO: which default date?
        nodes.sort(key=derive_date, reverse=True)
        for i, node in enumerate(nodes):
            node_id = node['id']
            statistics[node_id] = {
                'degree': degrees[node_id],
                'in-degree': in_degrees[node_id],
                'out-degree': out_degrees[node_id],
                'degree centrality': degree_centralities[node_id],
                'in-degree centrality': in_degree_centralities[node_id],
                'out-degree centrality': out_degree_centralities[node_id],
                'relative in-degree': in_degrees[node_id] / float(max(i, 1)),
                'pageRank': page_ranks[node_id],
                'authorities': authorities[node_id],
                'hubs': hubs[node_id],
                'betweenness centrality': betweenness_centralities[node_id],
                'closeness centrality': closeness_centralities[node_id],
                'community': partition[node_id]
            }
            if 'date_decision' in node['data']:
                statistics[node_id]['year'] = node['data']['date_decision'][:4]
        print(f'STATS: add to nodes took: {time() - start_p} s.')
    print(f'STATS: compute network took: {time() - start} s.')
    
    if TEST:
        return len(statistics)
    
    return statistics

def get_network(nodes, edges):
    graph = json_graph.node_link_graph({'nodes': nodes, 'links': edges}, directed=True, multigraph=False)
    return graph

def get_hits(graph, max_iter=10000):
    try:
        hubs, authorities = hits(graph, max_iter=max_iter)
        return hubs, authorities
    except NetworkXError:
        # It is possible that the HITS algorithm doesn't converge
        warn('HITS algorithm did not converge!',
                      Warning)
        h = dict.fromkeys(graph, 1.0 / graph.number_of_nodes())
        hubs, authorities = h, h
        return hubs, authorities

def get_pagerank(graph, max_iter=10000):
    try:
        g_pagerank = pagerank(graph, max_iter=max_iter)
        return g_pagerank
    except NetworkXError:
        # It is possible that the pagerank algorithm doesn't converge
        warn('PageRank algorithm did not converge!',
                      Warning)
        p = dict.fromkeys(graph, 1.0 / graph.number_of_nodes())
        return p
