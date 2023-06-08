#!/usr/bin/env python3
from time import perf_counter
import networkit as nk

# timer decorator
def timer(fn):
    def inner(*args, **kwargs):
        start_time = perf_counter()
        to_execute = fn(*args, **kwargs)
        end_time = perf_counter()
        execution_time = end_time - start_time
        print(f'{fn.__name__} took {execution_time:.8f}s to execute')
        return to_execute

    return inner

# Wrapper class for NetworkIt graphs to keep track of node attributes
class Graph:
    @timer
    def __init__(self, nodes, edges):
        "Create graph with node labels from list of nodes and edges."
        self.nk_graph = nk.graph.Graph(len(nodes), directed=True)
        self.addNodeAttribute('ids', str)

        nodeIdxs = {}
        for i, val in enumerate(nodes):
            self.ids[i] = val['id']
            nodeIdxs[val['id']] = i

        for edge in edges:
            src = edge['source']
            target = edge['target']
            self.nk_graph.addEdge(nodeIdxs[src], nodeIdxs[target])

    def __getattr__(self, attr):
        "Forward any missing methods to the underlying NetworKit graph."
        return getattr(self.nk_graph, attr)

    def addNodeAttribute(self, name, type_):
        "Add a node attribute on the graph class."
        val = self.nk_graph.attachNodeAttribute(name, type_)
        setattr(self, name, val)
        return val

    def addNodeCentralityMetric(self, name, centrality, *args, **kwargs):
        attr = self.addNodeAttribute(name, float)
        algorithm = centrality(self.nk_graph, *args, **kwargs)
        algorithm.run()
        result = algorithm.scores()
        for i, val in enumerate(result):
            attr[i] = val

@timer
def get_communities_centrality(G):
    uG = nk.graphtools.toUndirected(G)
    return nk.community.detectCommunities(G, algo=nk.community.PLM(uG, True))

# relative in-degree centrality

def derive_date(k):
    "Return the date of a node, if present else 1900-01-01."

    if 'date_decision' in k['data'] and k['data']['date_decision'] != '':
        return k['data']['date_decision']

    return '1900-01-01'

def relative_network_size(nodes):
    """Compute the relative network size for every node.

    That is, the number of nodes in the network with a date smaller than the
    node's date. This let's easily compute the relative in-degree of each node.
    """

    sorted_nodes = sorted(nodes, key=derive_date, reverse=True)

    first_node = sorted_nodes[0]
    sorted_nodes = sorted_nodes[1:]
    current_size = 1
    current_date = derive_date(first_node)

    relative_sizes = { first_node['id'] : current_size }

    # If at node N the date increases, that means there are N-1 nodes before
    # that date. As we start from the second node (chronologically), this means
    # we should start the count at 1.
    for i, node in enumerate(sorted_nodes, start=1):
        node_date = derive_date(node)
        if node_date < current_date:
            current_size = i
            current_date = node_date

        relative_sizes[node['id']] = current_size

    return relative_sizes

@timer
def create_response(graph, clusters, communities, partition):
    statistics = {}
    size = graph.numberOfNodes()
    def node_stats(i):
        node_id = graph.ids[i]
        degree = graph.degreeIn(i) + graph.degreeOut(i)
        statistics[node_id] = {
            'parent': clusters[communities[i]],
            'degree': degree,
            'in-degree': graph.degreeIn(i),
            'out-degree': graph.degreeOut(i),
            'degree centrality': degree / (size - 1),
            'in-degree centrality': graph.in_degree_centralities[i],
            'out-degree centrality': graph.out_degree_centralities[i],
            'relative in-degree': graph.relative_in_degree[i],
            'pageRank': graph.page_ranks[i],
            'betweenness centrality': graph.betweenness_centralities[i],
            'closeness centrality': graph.closeness_centralities[i],
            'community': partition[i],
        }
        id_components = node_id.split(':')
        if len(id_components) >= 4:
            statistics[node_id]['year'] = int(id_components[3])

    graph.forNodes(node_stats)
    return statistics



# main
@timer
def handler(event, context):
    nodes = event['arguments']['nodes']
    edges = event['arguments']['edges']

    if len(nodes) == 0 or len(edges) == 0:
        return {}

    graph = Graph(nodes, edges)

    relative_sizes = relative_network_size(nodes)
    graph.addNodeAttribute('relative_in_degree', float)

    def compute_relative(n):
        nid = graph.ids[n]
        graph.relative_in_degree[n] = graph.degreeIn(n) / relative_sizes[nid]

    graph.forNodes(compute_relative)

    graph.addNodeCentralityMetric("in_degree_centralities",
            nk.centrality.DegreeCentrality, outDeg=False, normalized=True)

    graph.addNodeCentralityMetric("out_degree_centralities",
            nk.centrality.DegreeCentrality, normalized=True)

    graph.addNodeCentralityMetric("betweenness_centralities",
            nk.centrality.ApproxBetweenness)

    graph.addNodeCentralityMetric("closeness_centralities",
            nk.centrality.ApproxCloseness, 100, normalized=True)

    distSinks = nk.centrality.SinkHandling.DistributeSinks
    graph.addNodeCentralityMetric("page_ranks",
            nk.centrality.PageRank, distributeSinks=distSinks, normalized=True)

    # compute networkit centralities
    partition = get_communities_centrality(graph.nk_graph)
    communities = partition.getVector()
    clusters = {}
    def iternodes(x):
        if communities[x] not in clusters:
            clusters[communities[x]] = x

    graph.forNodes(iternodes)

    statistics = create_response(graph, clusters, communities, partition)
    return statistics
