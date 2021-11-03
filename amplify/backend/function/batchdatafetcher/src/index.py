import os
from dynamodb_client import DynamodbClient
from utils import format_node_data, get_key, is_authorized
from definitions import TABLE_NAME, get_networkstatistics_attributes


def handler(event, context):
    ddb_client = DynamodbClient(table_name=os.getenv(f'API_CASEEXPLORERUI_{TABLE_NAME.upper()}TABLE_NAME'))

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