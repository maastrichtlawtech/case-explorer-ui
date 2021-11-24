from os import getenv
from dynamodb_client import DynamodbClient
from utils import format_node_data, get_key, is_authorized
from definitions import get_full_attributes, get_networkstatistics_attributes


ddb_client = DynamodbClient(table_name=getenv(f'API_CASEEXPLORERUI_{getenv("DDB_TABLE_NAME").upper()}TABLE_NAME'))

attributes = {
    "ALL": get_full_attributes,
    "NETWORKSTATS": get_networkstatistics_attributes
}

def handler(event, context):
    authorized = is_authorized(event)
    if event['arguments']['attributesToFetch']:
        get_attributes = attributes.get(event['arguments']['attributesToFetch'])
    else:
        get_attributes = attributes.get("ALL")

    input_attributes = get_attributes(authorized=False)
    return_attributes = get_attributes(authorized=authorized)

    print(event)

    nodes = []
    missing_node_keys = []
    for node in event["arguments"]["nodes"]:
        append = False
        for att in input_attributes:
            if 'data' not in node or not node['data'] or (att != 'ecli' and att not in node['data']):
                append = True
        if append:
            missing_node_keys.append(get_key(node['id']))
        else:
            nodes.append(node)
    
    response = ddb_client.execute_batch(missing_node_keys, return_attributes)
    missing_nodes = [format_node_data(node, return_attributes) for node in response]
    nodes.extend(missing_nodes)
    
    return nodes