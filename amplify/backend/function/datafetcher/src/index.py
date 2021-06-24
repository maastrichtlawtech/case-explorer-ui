import os
from clients.dynamodb_client import DynamodbClient
from utils import format_node_data, build_projection_expression, get_key, get_user_authorization
from attributes import NODE_FULL, NODE_FULL_LI
from settings import TABLE_NAME, ELASTICSEARCH_ENDPOINT


def handler(event, context):
    authorized_user = get_user_authorization(event)

    ddb_client = DynamodbClient(table_name=os.getenv(f'API_CASEEXPLORERUI_{TABLE_NAME.upper()}TABLE_NAME'))
    
    if authorized_user:
        attributes = NODE_FULL_LI
    else:
        attributes = NODE_FULL

    projection_expression, expression_attribute_names = build_projection_expression(attributes)

    response = ddb_client.table.get_item(
        Key=get_key(event["arguments"]["Ecli"]),
        ProjectionExpression=projection_expression,
        ExpressionAttributeNames=expression_attribute_names
    )

    item = dict()
    if 'Item' in response:
        item = response['Item']
    
    return format_node_data(item)