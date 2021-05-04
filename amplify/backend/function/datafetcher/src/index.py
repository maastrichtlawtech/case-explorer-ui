import os
from clients.dynamodb_client import DynamodbClient
from utils import format_node_data, build_projection_expression
from attributes import NODE_FULL, NODE_FULL_LI
from settings import TABLE_NAME, ELASTICSEARCH_ENDPOINT

def handler(event, context):
    ddb_client = DynamodbClient(table_name=os.getenv(f'API_CASEEXPLORERUI_{TABLE_NAME.upper()}TABLE_NAME'))
    
    if event["arguments"]["LiPermission"]:
        attributes = NODE_FULL_LI
    else:
        attributes = NODE_FULL

    projection_expression, expression_attribute_names = build_projection_expression(attributes)

    response = ddb_client.table.get_item(
        Key={
            "ecli": event["arguments"]["Ecli"],
            "ItemType": "DATA"
        },
        ProjectionExpression=projection_expression,
        ExpressionAttributeNames=expression_attribute_names
    )

    item = dict()
    if 'Item' in response:
        item = response['Item']
    
    return format_node_data(item)