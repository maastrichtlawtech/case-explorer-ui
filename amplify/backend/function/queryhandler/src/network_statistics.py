import networkx as nx
from networkx.readwrite import json_graph
import warnings
import community
# slightly modified taken from: 
# https://github.com/caselawanalytics/CaseLawAnalytics/blob/master/caselawnet/network_analysis.py


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

def add_network_statistics(nodes, edges):
    if len(nodes) == 0:
        return nodes
    graph = get_network(nodes, edges)
    partition = community.best_partition(nx.Graph(graph))
    degree = nx.degree(graph)
    if max(dict(degree).values()) > 0:
        hubs, authorities = get_hits(graph)
        statistics = {
            'degree': degree,
            'indegree': graph.in_degree(),
            'outdegree': graph.out_degree(),
            
            #'betweenness': ,
            #'closeness': ,

            'degree_centrality': nx.degree_centrality(graph),
            'in_degree_centrality': nx.in_degree_centrality(graph),
            'out_degree_centrality': nx.out_degree_centrality(graph),
            'betweenness_centrality': nx.betweenness_centrality(graph),
            'closeness_centrality': nx.closeness_centrality(graph),
            'pageRank': get_pagerank(graph),
            'hubs': hubs,
            'authorities': authorities
        }
    else:
        statistics = {}
        
    # for relative in-degree we sort on date
    derive_date = lambda k: k['data']['date_decision'] if 'date_decision' in k['data'] and k['data']['date_decision'] != '' else '1900-01-01' # @ TODO: which default date?
    nodes.sort(key=derive_date, reverse=True)
    result = dict()
    for i, node in enumerate(nodes):
        node_id = node['id']
        result[node_id] = {
            'community': str(partition[node_id])
        }
        for var in statistics.keys():
            result[node_id][var] = statistics[var][node_id]
        if 'in_degree' in statistics:
            result[node_id]['rel_in_degree'] = statistics['in_degree'][node_id] / float(max(i, 1))
        if 'date_decision' in node['data']:
            result[node_id]['year'] = node['data']['date_decision'][:4]
    
    return result