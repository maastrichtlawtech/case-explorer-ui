from boto3 import resource
from time import time
from queryhelper import build_ddb_projection_expression


class DynamodbClient:

    def __init__(self, table_name, item_limit=100, page_limit=1, max_hits=100):
        self.ddb = resource('dynamodb')
        self.table_name = table_name
        self.table = self.ddb.Table(self.table_name)
        self.item_limit=item_limit      # max number of items to evaluate per query (page)
        self.page_limit=page_limit      # max number of queries (pages)
        self.max_hits=max_hits          # max number of matches to return

    
    def execute_query(self, **query_params):
        """
        retrieves all items matching query parameters from DynamoDB
    
        :param query_params: dict of DynamoDB query parameters
        :return: dict containing response meta data and list of items matching query, flag whether item limit was reached
        """
        start = time()
        response = self.table.query(**query_params, Limit=self.item_limit)
        count = response['Count']
        items = response['Items']
        scanned_count = response['ScannedCount']
        limit_reached = False

        # use pagination to retrieve full list of results
        while 'LastEvaluatedKey' in response:
            if count >= self.max_hits or scanned_count >= self.page_limit*self.item_limit:
                limit_reached = True
                print(f'DDB: Request limit reached!')
                break
            response = self.table.query(**query_params, ExclusiveStartKey=response['LastEvaluatedKey'], Limit=self.item_limit)
            count += response['Count']
            items.extend(response['Items'])
            scanned_count += response['ScannedCount']

        print(f'DDB: {count}/{self.max_hits} items fetched.')
        print(f'DDB: {int(scanned_count/self.item_limit)}/{self.page_limit} pages scanned.')
        print(f'DDB: took {time()-start} s.')
        print("Just adding this print statement to check how amplify push works")
        response['Count'] = count
        response['Items'] = items
        response['ScannedCount'] = scanned_count

        return response, limit_reached


    def execute_batch(self, keys_list, return_attributes):
        """
        retrieves given attributes for given list of item keys from DynamoDB
    
        :param keys_list: list of dicts containing DynamoDB key value pairs
        :param return_attributes: list of string attribute names to return
        :return: list of dict items
        """
        start = time()

        # filter out duplicate entries
        keys_list = [dict(t) for t in {tuple(sorted(d.items())) for d in keys_list}]

        # substitute attribute names to avoid conflicts with DynamoDB reserved words
        projection_expression, expression_attribute_names = build_ddb_projection_expression(return_attributes)

        # disect requests into batches of 100 to avoid limit errors
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
                #print(response['UnprocessedKeys'])
                rest.extend(response['UnprocessedKeys'][self.table_name]['Keys'])
            batch = rest[:100]
            rest = rest[100:]

        #print('Duration ddb batch execution: ', time() - start)
        return items
