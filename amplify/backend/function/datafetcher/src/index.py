import os
from dynamodb_client import DynamodbClient
from queryhelper import build_ddb_projection_expression
from utils import format_node_data, get_key, is_authorized
from definitions import TABLE_NAME, get_full_attributes


def handler(event, context):
    ddb_client = DynamodbClient(table_name=os.getenv(f'API_CASEEXPLORERUI_{TABLE_NAME.upper()}TABLE_NAME'))

    authorized = is_authorized(event)
    return_attributes = get_full_attributes(authorized)
    projection_expression, expression_attribute_names = build_ddb_projection_expression(return_attributes)

    response = ddb_client.table.get_item(
        Key=get_key(event["arguments"]["node"]["id"]),
        ProjectionExpression=projection_expression,
        ExpressionAttributeNames=expression_attribute_names
    )

    item = dict()
    if 'Item' in response:
        item = response['Item']
    
    return format_node_data(item, return_attributes)