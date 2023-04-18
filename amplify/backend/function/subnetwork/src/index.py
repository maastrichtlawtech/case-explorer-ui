import json
from pandas import DataFrame, concat

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

    node_eclis = set()
    edge_ids = set()
    for index, row in full.iterrows():
        if row['degree'] >= max_nodes:
            continue
        node_eclis_peak = node_eclis.union(set(ecli for ecli in row['index'] + row['source'] + row['target']))
        edge_ids_peak = edge_ids.union(set(edge_id for edge_id in row['id1'] + row['id2']))
        if len(node_eclis_peak) > max_nodes:
            break
        node_eclis = node_eclis_peak
        edge_ids = edge_ids_peak

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
    
    if TEST:
        return {
            'nodes': len(result_nodes), 
            'edges': len(result_edges)
        }

    return {
        'nodes': result_nodes, 
        'edges': result_edges
    }
