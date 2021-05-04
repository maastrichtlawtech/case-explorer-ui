import os
from clients.dynamodb_client import DynamodbClient
from utils import fetch_nodes_data
from attributes import NODE_FULL, NODE_FULL_LI
from settings import TABLE_NAME, ELASTICSEARCH_ENDPOINT

def handler(event, context):
    ddb_client = DynamodbClient(table_name=os.getenv(f'API_CASEEXPLORERUI_{TABLE_NAME.upper()}TABLE_NAME'))
    
    if event["arguments"]["LiPermission"]:
        attributes = NODE_FULL_LI
    else:
        attributes = NODE_FULL

    nodes = fetch_nodes_data(ddb_client, [event["arguments"]["Ecli"]], attributes)
    
    if nodes == []:
        return []

    return nodes[0]