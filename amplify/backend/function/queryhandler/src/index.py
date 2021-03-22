import boto3
from boto3.dynamodb.conditions import Key, Attr
from elasticsearch import Elasticsearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth

host = 'https://search-amplify-elasti-m9qgehjp2rek-snhvhkpprt2nayzynzb4ozkmkm.eu-central-1.es.amazonaws.com'
region = 'eu-central-1'

service = 'es'
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)

es = Elasticsearch(
    hosts = [{'host': host, 'port': 443}],
    http_auth = awsauth,
    use_ssl = True,
    verify_certs = True,
    connection_class = RequestsHttpConnection
)

resource = boto3.resource('dynamodb')
table = resource.Table('CaselawV4-hmq6fy5a6fcg7isx5lar3yewdy-dev')
page_limit=10

def handler(event, context):

    search_params = event.copy()

    ### 0. CHECK IF PARAMS FOR KEYWORD SEARCH GIVEN
    #if search_params["Keywords"] != [""] or search_params["Articles"] != [""]:

    #    for keyword in search_params["Keywords"]:
    #        for article in search_params["Articles"]:

    ### 1. RETRIEVE ALL ECLIS MATCHING TO SELECTED FILTERS

    decisions, opinions = query(search_params)

    # add li entries if permission given
    if search_params["LiPermission"] == True:
        decisions_li, opinions_li = query(search_params, li_permission=True)
        decisions = decisions.union(decisions_li)
        opinions = opinions.union(opinions_li)

    nodes = fetch_nodes_data(decisions.union(opinions))
    edges = fetch_edges_data(decisions.union(opinions), search_params["DegreesSources"], search_params["DegreesTargets"])

    return {'nodes': list(nodes), 'edges': edges}




def query(s_params, li_permission=False):
    decisions = []
    opinions = []
    
    if s_params["Eclis"] == [""] and s_params["Instances"] == [""]:
        eclis = []
        for source in s_params['DataSources']:
            for domain in s_params['Domains']:
                q_params = {
                    'IndexName': 'GSI-DocSourceId',
                    'ProjectionExpression': '#ecli',
                    'KeyConditionExpression': '#DocSourceId = :DocSourceId',
                    'ExpressionAttributeNames': {'#DocSourceId': 'DocSourceId', '#ecli': 'ecli'},
                    'ExpressionAttributeValues': {':DocSourceId': f'DOM_{source}_{domain}'}
                }
                if not li_permission:
                    q_params['KeyConditionExpression'] += ' AND #extracted_from = :extracted_from'
                    q_params['ExpressionAttributeNames']['#extracted_from'] = 'extracted_from'
                    q_params['ExpressionAttributeValues'][':extracted_from'] = 'TEST'
                response = full_query(q_params)
                eclis.extend([item["ecli"] for item in response["Items"]])
        s_params["Eclis"] = eclis

    projection_expression = '#DocSourceId'
    expression_attribute_names = {
        '#DocSourceId': 'DocSourceId',
        '#instance': 'instance',
        '#SourceDocDate': 'SourceDocDate',
        '#domains': 'domains'
    }
    
    # CASE 1: eclis given
    if s_params["Eclis"] != [""]:
        index_name = ''
        key_condition_expression = '#ecli = :ecli AND #DocSourceId = :DocSourceId'
        expression_attribute_names['#ecli'] = 'ecli'
        filter_expression = 'contains(#instance, :instance) AND \
                            #SourceDocDate BETWEEN :DateStart AND :DateEnd AND \
                            contains(#domains, :domain)'

    # CASE 2: instances given
    elif s_params["Instances"] != [""]:
        index_name = 'GSI-instance'
        key_condition_expression = '#instance = :instance AND #SourceDocDate BETWEEN :DateStart AND :DateEnd'
        filter_expression = 'contains(#domains, :domain)'

    if li_permission:
        index_name += '_li' if index_name == 'GSI-instance' else index_name
        expression_attribute_names['#instance'] += '_li'
        expression_attribute_names['#domains'] += '_li'

    for ecli in s_params["Eclis"]:
        for instance in s_params["Instances"]:
            for domain in s_params["Domains"]:
                for source in s_params['DataSources']:
                    for doc in s_params["Doctypes"]:
                        expression_attribute_values = {
                            ':instance': instance,
                            ':domain': domain,
                            ':DateStart': f'{source}_{doc}_{s_params["DateStart"]}',
                            ':DateEnd': f'{source}_{doc}_{s_params["DateEnd"]}'
                        }
                        q_params = {
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
                            q_params['IndexName'] = index_name
                        response = full_query(q_params)
                        if doc == 'DEC':
                            decisions.extend([item["DocSourceId"] for item in response["Items"]])
                        elif doc == 'OPI':
                            opinions.extend([item["DocSourceId"] for item in response["Items"]])
    return set(decisions), set(opinions)


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


def fetch_nodes_data(doc_source_eclis):
    nodes = []
    for doc_source_ecli in doc_source_eclis:
        doc, source, ecli = doc_source_ecli.split('_')
        q_params = {
            'KeyConditionExpression': '#ecli = :ecli AND #DocSourceId = :DocSourceId',
            'ExpressionAttributeNames': {'#ecli': 'ecli', '#DocSourceId': 'DocSourceId'},
            'ExpressionAttributeValues': {':ecli': ecli, ':DocSourceId': f'{doc}_{source}_{ecli}'}
        }
        response = full_query(q_params)
        nodes.extend([{'id': item["ecli"], 'data': item} for item in response["Items"]])
    return nodes


def fetch_edges_data(doc_source_ids, degrees_sources, degrees_targets):
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