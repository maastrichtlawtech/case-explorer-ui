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



# networkit centralities
@timer
def get_outdegree_centrality(G):
    return nk.centrality.scores(
        G, algorithm=nk.centrality.DegreeCentrality, normalized=True)

@timer
def get_indegree_centrality(G):
    idg_centrality = nk.centrality.DegreeCentrality(
        G, outDeg=False, normalized=True)
    idg_centrality.run()
    return idg_centrality.scores()


@timer
def get_betweenness_centrality(G):
    return nk.centrality.scores(
        G, algorithm=nk.centrality.ApproxBetweenness, normalized=True)


@timer
def get_closeness_centrality(G):
    cls_centrality = nk.centrality.ApproxCloseness(G, 100, normalized=True)
    cls_centrality.run()
    return cls_centrality.scores()

@timer
def get_pagerank_centrality(G):
    pagerank = nk.centrality.PageRank(G,distributeSinks=nk.centrality.SinkHandling.DistributeSinks, normalized=True)
    pagerank.run()
    return pagerank.scores()


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

# this one includes the computation of the relative indegree centrality


@timer
def create_response(graph, clusters, communities, nodes, degrees, in_degrees, out_degrees, degree_centralities, in_degree_centralities,
                    out_degree_centralities, page_ranks, betweenness_centralities, closeness_centralities, partition):
    statistics = {}
    for i, node in enumerate(nodes):
        node_id = node['id']
        statistics[node_id] = {
            'parent': clusters[communities[i]],
            'degree': degrees[node_id],
            'in-degree': in_degrees[node_id],
            'out-degree': out_degrees[node_id],
            'degree centrality': degree_centralities[node_id],
            'in-degree centrality': in_degree_centralities[i],
            'out-degree centrality': out_degree_centralities[i],
            'relative in-degree': graph.relative_in_degree[i],
            'pageRank': page_ranks[i],
            'betweenness centrality': betweenness_centralities[i],
            'closeness centrality': closeness_centralities[i],
            'community': partition[i],
        }
        id_components = node['id'].split(':')
        if len(id_components) >= 4:
            statistics[node_id]['year'] = int(id_components[3])
    return statistics

# main


@timer
def handler(event, context):
    nodes = event['arguments']['nodes']
    edges = event['arguments']['edges']

    if len(nodes) == 0 or len(edges) == 0:
        return {}

    graph = Graph(nodes, edges)

    degrees = {}
    in_degrees = {}
    out_degrees = {}
    degree_centralities = {}

    size = graph.numberOfNodes()

    def compute_degrees(n, nid):
        in_degrees[nid] = graph.degreeIn(n)
        out_degrees[nid] = graph.degreeOut(n)
        degrees[nid] = in_degrees[nid] + out_degrees[nid]
        degree_centralities[nid] = degrees[nid]/(size - 1)

    relative_sizes = relative_network_size(nodes)
    graph.addNodeAttribute('relative_in_degree', float)

    def compute_relative(n, nid):
        graph.relative_in_degree[n] = graph.degreeIn(n) / relative_sizes[nid]

    def compute_node_stats(n):
        nid = graph.ids[n]
        compute_degrees(n, nid)
        compute_relative(n, nid)

    graph.forNodes(compute_node_stats)

    # compute networkit centralities
    partition = get_communities_centrality(graph.nk_graph)
    in_degree_centralities = get_indegree_centrality(graph.nk_graph)
    out_degree_centralities = get_outdegree_centrality(graph.nk_graph)
    betweenness_centralities = get_betweenness_centrality(graph.nk_graph)
    closeness_centralities = get_closeness_centrality(graph.nk_graph)
    page_ranks = get_pagerank_centrality(graph.nk_graph)

    communities = partition.getVector()

    clusters = {}

    def iternodes(x):
        if communities[x] not in clusters:
            clusters[communities[x]] = x

    graph.forNodes(iternodes)

    statistics = create_response(graph, clusters, communities, nodes, degrees, in_degrees, out_degrees, degree_centralities, in_degree_centralities,
                                 out_degree_centralities, page_ranks, betweenness_centralities, closeness_centralities, partition)
    return statistics
