import os
from clients.dynamodb_client import DynamodbClient
from queryhelper import build_ddb_projection_expression
from utils import format_node_data, get_key, is_authorized
from definitions import TABLE_NAME, NODE_FULL, NODE_FULL_LI


def handler(event, context):
    authorized = is_authorized(event)

    ddb_client = DynamodbClient(table_name=os.getenv(f'API_CASEEXPLORERUI_{TABLE_NAME.upper()}TABLE_NAME'))
    
    if authorized:
        return_attributes = NODE_FULL_LI
    else:
        return_attributes = NODE_FULL

    projection_expression, expression_attribute_names = build_ddb_projection_expression(return_attributes)

    response = ddb_client.table.get_item(
        Key=get_key(event["arguments"]["node"]["id"]),
        ProjectionExpression=projection_expression,
        ExpressionAttributeNames=expression_attribute_names
    )

    item = dict()
    if 'Item' in response:
        item = response['Item']
    
    return format_node_data(item)