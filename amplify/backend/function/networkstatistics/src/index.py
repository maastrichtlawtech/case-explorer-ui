import networkit as nk
import networkx as nx
import graph_tools as gt

# timer decorator


def timer(fn):
    from time import perf_counter

    def inner(*args, **kwargs):
        start_time = perf_counter()
        to_execute = fn(*args, **kwargs)
        end_time = perf_counter()
        execution_time = end_time - start_time
        print('{0} took {1:.8f}s to execute'.format(
            fn.__name__, execution_time))
        return to_execute

    return inner

# return the same network in 3 different formats (networkx, networkit and graph_tools)


@timer
def get_networks(nodes, edges):
    nxG = nx.readwrite.json_graph.node_link_graph(
        {'nodes': nodes, 'links': edges}, directed=True, multigraph=False)
    nkG = nk.nxadapter.nk2nx(nxG)
    gtG = ()
    return nxG, nkG, gtG

# networkit centralities


@timer
def get_outdegree_centrality(G):
    return nk.centrality.ranking(
        G, algorithm=nk.centrality.DegreeCentrality, normalized=True)


@timer
def get_indegree_centrality(G):
    idg_centrality = nk.centrality.DegreeCentrality(
        G, outDeg=False, normalized=True)
    idg_centrality.run()
    return idg_centrality.ranking()


@timer
def get_betweenness_centrality(G):
    return nk.centrality.ranking(
        G, algorithm=nk.centrality.ApproxBetweenness, normalized=True)


@timer
def get_closeness_centrality(G):
    return nk.centrality.ranking(
        G, algorithm=nk.centrality.ApproxCloseness, normalized=True)


@timer
def get_pagerank_centrality(G):
    return nk.centrality.ranking(
        G, algorithm=nk.centrality.PageRank, normalized=True)


@timer
def get_communities_centrality(G):
    uG = nk.graphtools.toUndirected(G)
    return nk.community.detectCommunities(G, algo=nk.community.PLM(uG, True))

# networkx centralities and other info


@timer
def get_degree_centrality(G):
    return nx.degree_centrality(G)


@timer
def get_degree(G):
    return nx.degree(G)


@timer
def get_indegree(G):
    return G.in_degree()


@timer
def get_outdegree(G):
    return G.out_degree()

# graph-tools centralities


@timer
def get_hits_centrality(G):
    return [0], [0]

# other computations


@timer
def sort_by_date(nodes):
    def derive_date(
        k): return k['data']['date_decision'] if 'date_decision' in k['data'] and k['data']['date_decision'] != '' else '1900-01-01'
    nodes.sort(key=derive_date, reverse=True)

# this one includes the computation of the relative indegree centrality


@timer
def create_response(nodes, degrees, in_degrees, out_degrees, degree_centralities, in_degree_centralities,
                    out_degree_centralities, page_ranks, authorities, hubs, betweenness_centralities, closeness_centralities, partition):
    statistics = dict()
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
            'community': partition[node_id],
            'year': int(node['id'].split(':')[3])
        }
    return statistics

# main


@timer
def handler(event, context):

    network = event['arguments'].copy()
    nodes = network['nodes']
    edges = network['edges']

    if len(nodes) == 0 or len(edges) == 0:
        return dict()

    nxG, nkG, gtG = get_networks(nodes, edges)

    # compute networx centralities
    degrees = get_degree(nxG)
    in_degrees = get_indegree(nxG)
    out_degrees = get_outdegree(nxG)
    degree_centralities = get_degree_centrality(nxG)

    # compute networkit centralities
    partition = get_communities_centrality(nkG)
    in_degree_centralities = get_indegree_centrality(nkG)
    out_degree_centralities = get_outdegree_centrality(nkG)
    betweenness_centralities = get_betweenness_centrality(nkG)
    closeness_centralities = get_closeness_centrality(nkG)
    page_ranks = get_pagerank_centrality(nkG)

    # compute graph-tools centralities
    hubs, authorities = get_hits_centrality(gtG)

    # for relative in-degree we sort on date
    sort_by_date(nodes)

    statistics = create_response(nodes, degrees, in_degrees, out_degrees, degree_centralities, in_degree_centralities,
                                 out_degree_centralities, page_ranks, authorities, hubs, betweenness_centralities, closeness_centralities, partition)
    return statistics
