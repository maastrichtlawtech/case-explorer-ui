import time
import json
import networkit as nk
from collections import defaultdict

TEST = False

def handler(event, context):
    if TEST:
        from json import load
        with open('edges.json') as f:
            edges = load(f)
        with open('nodes.json') as f:
            nodes = load(f)
    else:
        nodes = event['arguments']['nodes']
        edges = event['arguments']['edges']

    if 'maxNodes' in event['arguments'] and \
        event['arguments']['maxNodes']:
        # and event['arguments']['maxNodes'] < len(nodes):
        max_nodes = event['arguments']['maxNodes']
    else:
        return {
            'nodes': nodes,
            'edges': edges
        }

    if len(edges) == 0:
        result_nodes = [{'id': node['id'], 'data': {'isResult': node['data']['isResult']}} for node in nodes[:max_nodes]]
        return {
            'nodes': result_nodes, 
            'edges': edges
        }

    start = time.time()
    df = DataFrame(edges)
    sources = df.groupby('source').agg(list)
    targets = df.groupby('target').agg(list)
    full = concat([sources, targets], axis=1)
    full.columns = ['id1', 'target', 'id2', 'source']
    full.reset_index(level=0, inplace=True)
    full['index'] = full['index'].apply(lambda x: [x])
    full = full.fillna("").applymap(list)
    full['degree'] = (full.source + full.target).apply(len)
    full.sort_values(by='degree', ascending=False, inplace=True)
    end = time.time()

    print("Pandas time:", end - start)

    start = time.time()
    node_eclis = set()
    edge_ids = set()
    for index, row in full.iterrows():
        if row['degree'] >= max_nodes:
            continue
        bar = set(ecli for ecli in row['index'] + row['source'] + row['target'])
        baz = set(edge_id for edge_id in row['id1'] + row['id2'])
        node_eclis_peak = node_eclis.union(bar)
        edge_ids_peak = edge_ids.union(baz)
        if len(node_eclis_peak) > max_nodes:
            break
        node_eclis = node_eclis_peak
        edge_ids = edge_ids_peak
    end = time.time()
    print("?? time:", end - start)

    start = time.time()
    result_nodes = []
    for node in nodes:
        if node['id'] in node_eclis:
            if 'isResult' in node['data'] and node['data']['isResult']:
                result_nodes.append({
                    'id': node['id'],
                    'data': {
                        'isResult': node['data']['isResult']
                    }
                })
            else:
                result_nodes.append({
                    'id': node['id']
                })
    result_edges = [{'id': edge_id, 'source': edge_id.split('_')[0], 'target': edge_id.split('_')[1]} for edge_id in edge_ids]
    end = time.time()
    print("filter time:", end - start)
    
    class Agg:
        def __init__(self):
            self.nbrs = set()
            self.count = 0

    start = time.time()
    foo = defaultdict(Agg)
    for node in nodes:
        foo[node['id']]

    for edge in edges:
        src = edge['source']
        target = edge['target']
        foo[src].nbrs.add(target)
        foo[src].count += 1
        foo[target].count += 1

    end = time.time()
    print("set time:", end - start)
    start = time.time()
    my_nodes = set()
    ordered = sorted(foo.items(), key=lambda v: v[1].count, reverse=True)
    for node, agg in ordered:
        if len(my_nodes) + len(agg.nbrs) + 1 > max_nodes:
            break
        my_nodes.union(agg.nbrs)
        my_nodes.add(node)

    my_final_nodes = []
    my_final_edges = set()
    for node in nodes:
        if node['id'] in my_nodes:
            if 'isResult' in node['data'] and node['data']['isResult']:
                my_final_nodes.append({
                    'id': node['id'],
                    'data': {
                        'isResult': node['data']['isResult']
                    }
                })
            else:
                my_final_nodes.append({
                    'id': node['id']
                })

            for node2 in foo[node['id']].nbrs:
                my_final_edges.add((node['id'], node2))

    end = time.time()
    print("set filter time:", end - start)

    print("check:", result_nodes == my_final_nodes)
    print("size result:", len(result_nodes))
    print("size result2:", len(my_final_nodes))
    quux = set(node['id'] for node in my_final_nodes)
    xyzzy = set(node['id'] for node in result_nodes)
    wrong = quux.difference(xyzzy)
    print("wrong count:", len(wrong))
    print("wrong nodes:", wrong)
    print("missing nodes:", xyzzy.difference(quux))
    foo = set((k['source'], k['target']) for k in result_edges)
    print("check2:",  foo == my_final_edges)
    print("wrong edges:", my_final_edges.difference(foo))
    print("missing edges:", foo.difference(my_final_edges))

    if TEST:
        return {
            'nodes': len(result_nodes), 
            'edges': len(result_edges)
        }

    return {
        'nodes': result_nodes, 
        'edges': result_edges
    }
