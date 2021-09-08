from urllib import request
from datetime import datetime
#import simplejson
import json
import urllib

# legacy class
class GraphqlClient:

    def __init__(self, endpoint, headers):
        self.endpoint = endpoint
        self.headers = headers

    @staticmethod
    def serialization_helper(o):
        if isinstance(o, datetime):
            return o.strftime('%Y-%m-%dT%H:%M:%S.000Z')

    def execute(self, query, operation_name, variables={}):
        data = json.dumps({
            "query": query,
            "variables": variables,
            "operationName": operation_name
        },
            default=self.serialization_helper,
            #ignore_nan=True
        )
        r = request.Request(
            headers=self.headers,
            url=self.endpoint,
            method='POST',
            data=data.encode('utf8')
        )
        response = request.urlopen(r)#.read()
        return json.load(response)##decode('utf8')