from os import getenv
from dynamodb_client import DynamodbClient
from utils import format_node_data, get_key, is_authorized
from definitions import get_networkstatistics_attributes


ddb_client = DynamodbClient(table_name=getenv(f'API_CASEEXPLORERUI_{getenv("DDB_TABLE_NAME").upper()}TABLE_NAME'))

def handler(event, context):
    authorized = is_authorized(event)
    input_attributes = get_networkstatistics_attributes(False)
    return_attributes = get_networkstatistics_attributes(authorized)

    nodes = []
    missing_node_keys = []
    for node in event["arguments"]["nodes"]:
        append = False
        for att in input_attributes:
            if att != 'ecli' and att not in node['data']:
                append = True
        if append:
            missing_node_keys.append(get_key(node['id']))
        else:
            nodes.append(node)
    
    response = ddb_client.execute_batch(missing_node_keys, return_attributes)
    missing_nodes = [format_node_data(node, return_attributes) for node in response]
    nodes.extend(missing_nodes)
    
    return nodes