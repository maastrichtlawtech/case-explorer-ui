from os import getenv
from dynamodb_client import DynamodbClient
from queryhelper import build_ddb_projection_expression
from utils import format_node_data, get_key, is_authorized
from definitions import AttributesList


ddb_client = DynamodbClient(table_name=getenv(f'API_CASEEXPLORERUI_{getenv("DDB_TABLE_NAME").upper()}TABLE_NAME'))

def handler(event, context):
    authorized = is_authorized(event)

    if 'attributesToFetch' in event['arguments'] and event['arguments']['attributesToFetch']:
        return_attributes = AttributesList.__dict__[event['arguments']['attributesToFetch']](authorized)
    else:
        return_attributes = AttributesList.ALL(authorized)

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