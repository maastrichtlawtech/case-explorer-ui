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

# return the network and node id information
@timer
def get_networks(nodes, edges):
    nkG = nk.graph.Graph(len(nodes), directed=True)
    ids = nkG.attachNodeAttribute('id', str)

    nodeIdxs = {}
    for i, val in enumerate(nodes):
        ids[i] = val['id']
        nodeIdxs[val['id']] = i

    for edge in edges:
        src = edge['source']
        target = edge['target']
        nkG.addEdge(nodeIdxs[src], nodeIdxs[target])

    return nkG, ids

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

# other computations


@timer
def sort_by_date(nodes):
    def derive_date(k):
        if 'date_decision' in k['data'] and k['data']['date_decision'] != '':
            return k['data']['date_decision']
        return '1900-01-01'
    nodes.sort(key=derive_date, reverse=True)

# this one includes the computation of the relative indegree centrality


@timer
def create_response(clusters, communities, nodes, degrees, in_degrees, out_degrees, degree_centralities, in_degree_centralities,
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
            'relative in-degree': in_degrees[node_id] / float(max(i, 1)),
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

    nkG, ids = get_networks(nodes, edges)

    # compute networx centralities
    degrees = {}
    in_degrees = {}
    out_degrees = {}
    degree_centralities = {}

    size = nkG.numberOfNodes()

    def computeDegrees(G, x):
        nid = ids[x]
        in_degrees[nid] = G.degreeIn(x)
        out_degrees[nid] = G.degreeOut(x)
        degrees[nid] = in_degrees[nid] + out_degrees[nid]
        degree_centralities[nid] = degrees[nid]/(size -1)

    nkG.forNodes(lambda x: computeDegrees(nkG, x))

    # compute networkit centralities
    partition = get_communities_centrality(nkG)
    in_degree_centralities = get_indegree_centrality(nkG)
    out_degree_centralities = get_outdegree_centrality(nkG)
    betweenness_centralities = get_betweenness_centrality(nkG)
    closeness_centralities = get_closeness_centrality(nkG)
    page_ranks = get_pagerank_centrality(nkG)

    communities = partition.getVector()

    clusters = {}

    def iternodes(x):
        if communities[x] not in clusters:
            clusters[communities[x]] = x

    nkG.forNodes(iternodes)

    # for relative in-degree we sort on date
    sort_by_date(nodes)

    statistics = create_response(clusters, communities, nodes, degrees, in_degrees, out_degrees, degree_centralities, in_degree_centralities,
                                 out_degree_centralities, page_ranks, betweenness_centralities, closeness_centralities, partition)
    return statistics
