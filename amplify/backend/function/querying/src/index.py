import boto3
from boto3.dynamodb.conditions import Key, Attr

resource = boto3.resource('dynamodb')
table = resource.Table('CaselawV4-qpdyxd2cv5f25oyypekvcp23dy-dev')
page_limit=10

def handler(event, context):

    ### 1. RETRIEVE ALL ECLIS MATCHING TO SELECTED FILTERS

    if event["Eclis"] != [""] or event["Instances"] != [""]:
        
        projection_expression = '#DocSourceId'
        expression_attribute_names = {
            '#DocSourceId': 'DocSourceId',
            '#instance': 'instance',
            '#SourceDocDate': 'SourceDocDate',
            '#domains': 'domains',
            '#referenced_legislation_titles': 'referenced_legislation_titles' 
        }
        
        # CASE 1: eclis given
        if event["Eclis"] != [""]:
            index_name = ''
            key_condition_expression = '#ecli = :ecli AND #DocSourceId = :DocSourceId'
            expression_attribute_names['#ecli'] = 'ecli'
            filter_expression = '#instance = :instance AND \
                                #SourceDocDate BETWEEN :DateStart AND :DateEnd AND \
                                contains(#domains, :domain) AND \
                                contains(#referenced_legislation_titles, :article)'

        # CASE 2: instances given
        elif event["Instances"] != [""]:
            index_name = 'GSI-instance'
            key_condition_expression = '#instance = :instance AND #SourceDocDate BETWEEN :DateStart AND :DateEnd'
            filter_expression = 'contains(#domains, :domain) AND contains(#referenced_legislation_titles, :article)'

        decisions, opinions = query_by_instance(event, index_name, projection_expression, key_condition_expression, filter_expression, expression_attribute_names)

        # add li entries if permission given
        if event["LiPermission"] == True:
            index_name += '_li' if index_name == 'GSI-instance' else index_name
            expression_attribute_names['#instance'] += '_li'
            expression_attribute_names['#domains'] += '_li'
            expression_attribute_names['#referenced_legislation_titles'] += '_li'

            decisions_li, opinions_li = query_by_instance(event, index_name, projection_expression, key_condition_expression, filter_expression, expression_attribute_names)
            decisions = decisions.union(decisions_li)
            opinions = opinions.union(opinions_li)

        # filter by legislation citation:
        # @TODO decisions = query_by_l_citation(decisions, event["Articles"])

        nodes = query_by_ecli(decisions.union(opinions))
        edges = retrieve_edges(decisions.union(opinions), event["DegreesSources"], event["DegreesTargets"])


    # CASE 3: domains given:
    # elif event['Domains'] != [""]:
    #     nodes = query_by_DocSourceId('DOM', event['DataSources'], event['Domains'])

    #     if event["LiPermission"] == True:
    #         nodes = nodes.union(query_by_DocSourceId('DOM', event['DataSources'], event['Domains'], li_permission=True))
    
    #     #nodes = nodes.intersection(query_by_DocSourceId('L-CIT', event['DataSources'], event['Articles']))



    return {'nodes': list(nodes), 'edges': edges}


# use pagination to retrieve all results of a query
def full_query(kwargs):
    response = table.query(**kwargs)
    count = response['Count']
    items = response['Items']
    scanned_count = response['ScannedCount']
    pages = 1

    while 'LastEvaluatedKey' in response and pages != page_limit:
        response = table.query(**kwargs, ExclusiveStartKey=response['LastEvaluatedKey'])
        count += response['Count']
        items.extend(response['Items'])
        scanned_count += response['ScannedCount']
        pages += 1

    response['Count'] = count
    response['Items'] = items
    response['ScannedCount'] = scanned_count

    return response

def retrieve_edges(doc_source_ids, degrees_sources, degrees_targets):
    edges = []

    # c_sources:
    targets = [doc_source_id.split('_')[2] for doc_source_id in doc_source_ids]
    for _ in range(degrees_sources):
        next_targets = []
        for target in targets:
            response = full_query({
                'IndexName': 'GSI-DocSourceId',
                'KeyConditionExpression': '#DocSourceId = :DocSourceId AND #extracted_from = :extracted_from',
                'ExpressionAttributeNames': {'#DocSourceId': 'DocSourceId', '#extracted_from': 'extracted_from'},
                'ExpressionAttributeValues': {':DocSourceId': f'C-CIT_TEST_{target}', ':extracted_from': 'LIDO'}
            })
            next_targets.extend(item["ecli"] for item in response["Items"])
            edges.extend([{
                'id': f'{item["ecli"]}_{item["target_ecli"]}', 
                'source': item["ecli"], 
                'target': item["target_ecli"], 
                'data': item
            } for item in response["Items"]])
        targets = next_targets

    # targets:
    c_sources = [doc_source_id.split('_')[2] for doc_source_id in doc_source_ids]
    for _ in range(degrees_targets):
        next_c_sources = []
        for c_source in c_sources:
            response = full_query({
                'KeyConditionExpression': '#ecli = :ecli AND begins_with(#DocSourceId, :Doc)',
                'FilterExpression': '#extracted_from = :extracted_from',
                'ExpressionAttributeNames': {'#ecli': 'ecli', '#DocSourceId': 'DocSourceId', '#extracted_from': 'extracted_from'},
                'ExpressionAttributeValues': {':ecli': c_source, ':Doc': 'C-CIT', ':extracted_from': 'LIDO'},
            })
            next_c_sources.extend(item["target_ecli"] for item in response["Items"])
            edges.extend([{
                'id': f'{item["ecli"]}_{item["target_ecli"]}', 
                'source': item["ecli"], 
                'target': item["target_ecli"], 
                'data': item
            } for item in response["Items"]])
            c_sources = next_c_sources

    return edges


def query_by_instance(event, index_name, projection_expression, key_condition_expression, filter_expression, expression_attribute_names):
    decisions = []
    opinions = []
    for ecli in event["Eclis"]:
        for instance in event["Instances"]:
            for domain in event["Domains"]:
                for article in event["Articles"]:
                    for source in event['DataSources']:
                        for doc in event["Doctypes"]:
                            expression_attribute_values = {
                                ':instance': instance,
                                ':domain': domain,
                                ':article': article,
                                ':DateStart': f'{source}_{doc}_{event["DateStart"]}',
                                ':DateEnd': f'{source}_{doc}_{event["DateEnd"]}'
                            }
                            params = {
                                'ProjectionExpression': projection_expression,
                                'KeyConditionExpression': key_condition_expression,
                                'FilterExpression': filter_expression,
                                'ExpressionAttributeNames': expression_attribute_names,
                                'ExpressionAttributeValues': expression_attribute_values
                            }
                            if index_name == '':
                                expression_attribute_values[':ecli'] = ecli
                                expression_attribute_values[':DocSourceId'] = f'{doc}_{source}_{ecli}'
                            else:
                                params['IndexName'] = index_name
                            response = full_query(params)
                            if doc == 'DEC':
                                decisions.extend([item["DocSourceId"] for item in response["Items"]])
                            elif doc == 'OPI':
                                print("OPI")
                                print(response)
                                opinions.extend([item["DocSourceId"] for item in response["Items"]])
    return set(decisions), set(opinions)


def query_by_DocSourceId(doc, sources, doc_ids, li_permission=False):
    nodes = []
    for source in sources:
        for doc_id in doc_ids:
            params = {
                'IndexName': 'GSI-DocSourceId',
                'ProjectionExpression': '#DocSourceId',
                'KeyConditionExpression': '#DocSourceId = :DocSourceId',
                'ExpressionAttributeNames': {'#DocSourceId': 'DocSourceId'},
                'ExpressionAttributeValues': {':DocSourceId': f'{doc}_{source}_{doc_id}'}
            }
            if not li_permission:
                params['KeyConditionExpression'] += ' AND #extracted_from = :extracted_from'
                params['ExpressionAttributeNames']['#extracted_from'] = 'extracted_from'
                params['ExpressionAttributeValues'][':extracted_from'] = 'RS'
            response = full_query(params)
            nodes.extend([item["DocSourceId"] for item in response["Items"]])
    return set(nodes)

def query_by_l_citation(doc_source_eclis, articles):
    nodes = []
    for doc_source_ecli in doc_source_eclis:
        _, source, ecli = doc_source_ecli.split('_')
    for article in articles:
            params = {
                'ProjectionExpression': '#ecli',
                'KeyConditionExpression': '#ecli = :ecli AND #DocSourceId = :DocSourceId',
                'ExpressionAttributeNames': {'#ecli': 'ecli', '#DocSourceId': 'DocSourceId'},
                'ExpressionAttributeValues': {':ecli': ecli, ':DocSourceId': f'L-CIT_{source}_{article}'}
            }
            response = full_query(params)
            nodes.extend([item["ecli"] for item in response["Items"]])
    return set(nodes)

def query_by_ecli(doc_source_eclis):
    nodes = []
    for doc_source_ecli in doc_source_eclis:
        doc, source, ecli = doc_source_ecli.split('_')
        params = {
            'KeyConditionExpression': '#ecli = :ecli AND #DocSourceId = :DocSourceId',
            'ExpressionAttributeNames': {'#ecli': 'ecli', '#DocSourceId': 'DocSourceId'},
            'ExpressionAttributeValues': {':ecli': ecli, ':DocSourceId': f'{doc}_{source}_{ecli}'}
        }
        response = full_query(params)
        nodes.extend([{'id': item["ecli"], 'data': item} for item in response["Items"]])
    return nodes

