def handler(event, context):
    cog_id = ""
    pool_id = ""
    if hasattr(context, "identity"):
        cog_id = context.identity.cognito_identity_id
        pool_id = context.identity.cognito_identity_pool_id
    return {"id": "test", "data": {
        "event": event, 
        "cog_id": cog_id,
        "pool_id": pool_id
    }}