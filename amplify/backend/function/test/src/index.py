import os
from clients.dynamodb_client import DynamodbClient
from queryhelper import build_ddb_projection_expression
from utils import format_node_data, get_key, is_authorized
from definitions import TABLE_NAME, NODE_FULL, NODE_FULL_LI


def handler2(event, context):
    ddb_client = DynamodbClient(table_name=os.getenv(f'API_CASEEXPLORERUI_{TABLE_NAME.upper()}TABLE_NAME'))
    
    authorized = is_authorized(event)

    if authorized:
        return_attributes = NODE_FULL_LI
        message = ''
    else:
        return_attributes = NODE_FULL
        message = 'test warning: user not authorized'

    projection_expression, expression_attribute_names = build_ddb_projection_expression(return_attributes)

    response = ddb_client.table.get_item(
        Key=get_key(event["arguments"]["Ecli"]),
        ProjectionExpression=projection_expression,
        ExpressionAttributeNames=expression_attribute_names
    )

    item = dict()
    if 'Item' in response:
        item = response['Item']
    
    user_pool_id = os.getenv('AUTH_CASEEXPLORERUI50CF907150CF9071_USERPOOLID')
    cog_id = ""
    pool_id = ""
    if hasattr(context, "identity"):
        cog_id = context.identity.cognito_identity_id
        pool_id = context.identity.cognito_identity_pool_id
    
    user_id = ''
    if "identity" in event:
        user_id = event['identity']['claims']['username']
    

    return {
        "id": "test", 
        "data": {
            "node_ecli": format_node_data(item)['id'],
            "node_data": format_node_data(item)['data'],
            "pool_id": user_pool_id,
            "event": event,
            "user_id": user_id
        }
    }

def handler(event, context):
    ddb_client = DynamodbClient(table_name=os.getenv(f'API_CASEEXPLORERUI_{TABLE_NAME.upper()}TABLE_NAME'))
    authorized_user = is_authorized(event)
    return {
        "id": "test", 
        "data": {
            "ddb_client": str(ddb_client),
            "event": event,
            "authorized": authorized_user
        }
    }