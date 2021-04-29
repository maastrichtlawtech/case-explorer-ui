import boto3
from boto3.dynamodb.conditions import Key, Attr
import time


class DynamodbClient:

    def __init__(self, table_name, page_limit=1):
        self.ddb = boto3.resource('dynamodb')
        self.table_name = table_name
        self.table = self.ddb.Table(self.table_name)
        self.page_limit=page_limit

    
    def execute_query(self, query_params):
        """
        use pagination to retrieve all results of a DynamoDB query
        """
        start = time.time()
        response = self.table.query(**query_params, Limit=100)
        count = response['Count']
        items = response['Items']
        scanned_count = response['ScannedCount']
        pages = 1

        while 'LastEvaluatedKey' in response:
            if pages == self.page_limit:
                print('DYNAMOBO REQUEST LIMIT REACHED!')
                break
            response = self.table.query(**query_params, ExclusiveStartKey=response['LastEvaluatedKey'], Limit=100)
            count += response['Count']
            items.extend(response['Items'])
            scanned_count += response['ScannedCount']
            pages += 1

        #print('Duration ddb query:', time.time()-start)
        #print('Pages scanned: ', pages)
        response['Count'] = count
        response['Items'] = items
        response['ScannedCount'] = scanned_count

        return response


    def execute_batch(self, keys_list, return_attributes):
        """
        :keys_list: list of dicts
        :return_attributes: list of strings
        :return list of dict items
        """
        start = time.time()

        # filter out duplicate entries
        keys_list = [dict(t) for t in {tuple(sorted(d.items())) for d in keys_list}]

        # substitute attribute names to avoid conflicts with DynamoDB reserved words
        tokens = ['#' + attribute for attribute in return_attributes]
        projection_expression = ', '.join(tokens)
        expression_attribute_names = dict(zip(tokens, return_attributes))

        batch = keys_list[:100]
        rest = keys_list[100:]

        items = []

        while batch != []:
            response = self.ddb.batch_get_item(
                RequestItems={
                    self.table_name: {
                        'Keys': batch,
                        'ProjectionExpression': projection_expression,
                        'ExpressionAttributeNames': expression_attribute_names
                    }
                }
            )
            items.extend(response['Responses'][self.table_name])
            if response['UnprocessedKeys']:
                print(response['UnprocessedKeys'])
                rest.extend(response['UnprocessedKeys'][self.table_name]['Keys'])
            batch = rest[:100]
            rest = rest[100:]

        #print('Duration ddb batch execution: ', time.time() - start)
        return items
