import networkx as nx
from networkx.readwrite import json_graph
import warnings
# taken from (+ more stats available at): 
# https://github.com/caselawanalytics/CaseLawAnalytics/blob/master/caselawnet/network_analysis.py


def get_network(nodes, edges):
    graph = json_graph.node_link_graph({'nodes': nodes, 'links': edges}, directed=True, multigraph=False)
    return graph


def add_network_statistics(nodes, edges):
    if len(nodes) == 0:
        return nodes
    graph = get_network(nodes, edges)
    degree = nx.degree(graph)
    in_degree = None
    if max(dict(degree).values()) > 0:
        in_degree = graph.in_degree()
        
    # for relative in-degree we sort on date
    derive_date = lambda k: k['data']['date_decision'] if 'date_decision' in k['data'] and k['data']['date_decision'] != '' else '1900-01-01' # @ TODO: which default date?
    nodes.sort(key=derive_date, reverse=True)
    stats = dict()
    for i, node in enumerate(nodes):
        node_id = node['id']
        if in_degree:
            stats[node_id] = {'rel_in_degree': in_degree[node_id] / float(max(i, 1))}
    return stats