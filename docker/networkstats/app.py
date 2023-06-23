#!/usr/bin/env python3
from time import perf_counter
import networkit as nk

class Timer:
    "Simple timer class for reporting the time taken by a block of code."

    def __init__(self, name):
        self.name = name
        self.start_time = None

    def __enter__(self):
        "Starts the timer upon entering a with-block."
        self.start_time = perf_counter()

    def __exit__(self, exc_type, exc_val, tb):
        "Ends the timer and reports time taken upon exiting a with-block."
        end_time = perf_counter()
        execution_time = end_time - self.start_time
        print(f'{self.name} took {execution_time:.8f}s to execute')

# timer decorator
def timer(fn):
    "Decorator for wrapping function calls with a Timer."
    def inner(*args, **kwargs):
        with Timer(fn.__name__):
            return fn(*args, **kwargs)

    return inner

# Wrapper class for NetworkIt graphs to keep track of node attributes
class Graph:
    """Thin wrapper class around a NetworkIt graph, forwards all missing
    methods to the wrapped NetworkIt graph."""

    @classmethod
    def from_lists(cls, nodes, edges):
        "Create graph with node labels from lists of nodes and edges."

        with Timer("Graph creation"):
            nk_graph = nk.graph.Graph(len(nodes), directed=True)
            ids = {}

            nodeIdxs = {}
            for i, val in enumerate(nodes):
                ids[i] = val['id']
                nodeIdxs[val['id']] = i

            for edge in edges:
                src = edge['source']
                target = edge['target']
                nk_graph.addEdge(nodeIdxs[src], nodeIdxs[target])

            return cls(nk_graph, ids)

    def __init__(self, nk_graph, ids):
        "Takes a NetworkIt graph and an indexable type holding the ids."
        self.nk_graph = nk_graph
        self.addNodeAttribute('ids', str)

        def set_id(n):
            self.ids[n] = ids[n]

        self.nk_graph.forNodes(set_id)

    def __getattr__(self, attr):
        "Forward any missing methods to the underlying NetworKit graph."
        return getattr(self.nk_graph, attr)

    def addNodeAttribute(self, name, type_):
        "Add a node attribute on the graph class."
        val = self.nk_graph.attachNodeAttribute(name, type_)
        setattr(self, name, val)
        return val

    def _addNodeCentralityMetric(self, name, nk_graph, centrality, *args,
            **kwargs):
        "Internal method for computing directed and undirected metrics."
        attr = self.addNodeAttribute(name, float)
        with Timer(f"Centrality: {name}"):
            algorithm = centrality(nk_graph, *args, **kwargs)
            algorithm.run()
            result = algorithm.scores()
            for i, val in enumerate(result):
                attr[i] = val

    def addNodeCentralityMetric(self, name, centrality, *args, **kwargs):
        "Compute a centrality metric and store the results as node attributes."
        return self._addNodeCentralityMetric(name, self.nk_graph, centrality,
                *args, **kwargs)

    def addNodeCentralityMetricUndirected(self, name, centrality, *args,
            **kwargs):
        """Compute a centrality metric on undirected version of the graph and
        store the results as node attributes."""
        undirected_graph = nk.graphtools.toUndirected(self.nk_graph)
        return self._addNodeCentralityMetric(name, undirected_graph,
                centrality, *args, **kwargs)

    def _addCommunities(self, name, nk_graph, algo, *args, **kwargs):
        "Internal method for computing directed and undirected communities."
        attr = self.addNodeAttribute(name, int)
        with Timer(f"Community: {name}"):
            algorithm = algo(nk_graph, *args, **kwargs)
            partitioning = nk.community.detectCommunities(nk_graph,
                    algo=algorithm)

            partitioning.compact()
            node_clusters = partitioning.getVector()

            def store_node(n):
                attr[n] = node_clusters[n]

            self.nk_graph.forNodes(store_node)
            return partitioning

    def addCommunities(self, name, algo, *args, **kwargs):
        "Compute and stores communities for each node."
        return self._addCommunities(name, self.nk_graph, algo, *args, **kwargs)

    def addCommunitiesUndirected(self, name, algo, *args, **kwargs):
        "Compute communities on undirected graph and store for each node."
        undirected_graph = nk.graphtools.toUndirected(self.nk_graph)
        return self._addCommunities(name, undirected_graph, algo, *args,
                **kwargs)

    def undirected(self):
        "Return a new Graph that is an undirected version of this one."
        undirectedGraph = nk.graphtools.toUndirected(self.nk_graph)
        return Graph(undirectedGraph, self.ids)

    def subGraphFromNodes(self, nodes):
        "Return a new subgraph that consists of the specified nodes."
        newGraph = nk.graphtools.subgraphFromNodes(self.nk_graph, nodes)
        return Graph(newGraph, self.ids)

    def subGraphFromPredicate(self, filterPredicate):
        """Return a new subgraph that consists of the nodes for which the
        predicate is True."""
        nodes = []
        def select_node(n):
            if filterPredicate(self.nk_graph, n):
                nodes.append(n)

        self.nk_graph.forNodes(select_node)
        return self.subGraphFromNodes(nodes)

# relative in-degree centrality
def derive_date(k):
    "Return the date of a node, if present else 1900-01-01."

    if 'date_decision' in k['data'] and k['data']['date_decision'] != '':
        return k['data']['date_decision']

    # Use year from the ECLI if date is missing
    node_id = k['id']
    id_components = node_id.split(':')
    if len(id_components) >= 4:
        year = id_components[3]
        return year + "-01-01"

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
def create_response(graph, representative_nodes):
    statistics = {}
    size = graph.numberOfNodes()
    def node_stats(i):
        node_id = graph.ids[i]
        degree = graph.degreeIn(i) + graph.degreeOut(i)
        community = graph.plm_community[i]
        statistics[node_id] = {
            'parent': representative_nodes[community],
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
            'community': community,
            'year': graph.year[i]
        }

    graph.forNodes(node_stats)
    return statistics


# main
# pylint: disable=unused-argument
@timer
def handler(event, context):
    nodes = event['arguments']['nodes']
    edges = event['arguments']['edges']

    if len(nodes) == 0 or len(edges) == 0:
        return {}

    graph = Graph.from_lists(nodes, edges)
    graph.addNodeAttribute('year', int)

    def add_decision_year(n):
        date = derive_date(nodes[n])
        year = date.split('-')[0]
        graph.year[n] = int(year)

    graph.forNodes(add_decision_year)

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

    stripped = graph.subGraphFromPredicate(lambda G, n: not G.isIsolated(n))
    partition = stripped.addCommunitiesUndirected("plm_community",
            nk.community.PLM)

    representative_nodes = {}
    newCommunity = max(partition.getSubsetIds()) + 1
    communities = graph.addNodeAttribute("plm_community", int)
    def set_community(n):
        if stripped.hasNode(n):
            communities[n] = stripped.plm_community[n]
        else:
            partition.addToSubset(newCommunity, n)
            communities[n] = newCommunity

        if communities[n] not in representative_nodes:
            representative_nodes[communities[n]] = n

    graph.forNodes(set_community)

    statistics = create_response(graph, representative_nodes)
    return statistics
