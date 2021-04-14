import boto3
from boto3.dynamodb.conditions import Key, Attr
import time


class DynamodbClient:

    def __init__(self, table_name, page_limit):
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

        while 'LastEvaluatedKey' in response and pages < self.page_limit:
            response = self.table.query(**query_params, ExclusiveStartKey=response['LastEvaluatedKey'], Limit=100)
            count += response['Count']
            items.extend(response['Items'])
            scanned_count += response['ScannedCount']
            pages += 1

        print('Duration ddb query:', time.time()-start)
        print('Pages scanned: ', pages)
        response['Count'] = count
        response['Items'] = items
        response['ScannedCount'] = scanned_count

        return response


    def execute_batch(self, keys_list, return_attributes):
        """

        :return list of dict items
        """
        start = time.time()

        # filter out duplicate entries
        keys_list = [dict(t) for t in {tuple(sorted(d.items())) for d in keys_list}]

        batch = keys_list[:100]
        rest = keys_list[100:]

        items = []

        while batch != []:
            response = self.ddb.batch_get_item(
                RequestItems={
                    self.table_name: {
                        'Keys': batch,
                        'ProjectionExpression': return_attributes
                    }
                }
            )
            items.extend(response['Responses'][self.table_name])
            if response['UnprocessedKeys']:
                print(response['UnprocessedKeys'])
                rest.extend(response['UnprocessedKeys'][self.table_name]['Keys'])
            batch = rest[:100]
            rest = rest[100:]

        print('Duration ddb batch execution: ', time.time() - start)
        return items
