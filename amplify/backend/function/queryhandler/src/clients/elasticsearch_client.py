from elasticsearch import Elasticsearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
import os
import time


class ElasticsearchClient:

    def __init__(self, endpoint, max_hits, timeout, page_limit, index):

        self.max_hits = max_hits
        self.timeout = timeout
        self.page_limit = page_limit
        self.index=index

        awsauth = AWS4Auth(
            os.getenv('AWS_ACCESS_KEY_ID'), 
            os.getenv('AWS_SECRET_ACCESS_KEY'), 
            os.getenv('REGION'), 
            'es', 
            session_token=os.getenv('AWS_SESSION_TOKEN'))

        self.es = Elasticsearch(
            hosts = [{'host': endpoint, 'port': 443, 'use_ssl': True}],
            http_auth = awsauth,
            use_ssl = True,
            verify_certs = True,
            connection_class = RequestsHttpConnection,
            timeout = self.timeout
        )

    
    def execute(self, query, return_attributes):
        total_hits = []
        #pit_id = es.open_point_in_time(index='caselaw4', keep_alive= f'{timeout/60}m')
        start = time.time()
        result = self.es.search(
            index=[self.index],
            body={
                'size': self.max_hits,
                'query': query,
                #'pit': {'id': pit_id}
                'sort': [{"_doc": "asc"}],
                '_source': return_attributes
            },
            request_timeout = self.timeout
        )
        hits = result['hits']['hits']
        total_hits.extend(hits)

        counter = 1
        while len(hits) > 0:
            if counter == self.page_limit:
                print(f'ELASTICSEARCH LIMIT REACHED - RETRIEVED {len(total_hits)} HITS')
                break
            #pit_id = result['pit_id']
            result = self.es.search(
                body={
                    'size': self.max_hits,
                    'query': query,
                    #'pit': {'id': pit_id},
                    'sort': [{"_doc": "asc"}],
                    '_source': return_attributes,
                    'search_after': hits[-1]['sort'],
                    'track_total_hits': False
                },
                request_timeout = self.timeout
            )
            hits = result['hits']['hits']
            total_hits.extend(hits)
            counter += 1
            #print(f'COUNTER: {counter}')
        
        #es.close_point_in_time(body={'id': pit_id})

        #print('Duration es search:', time.time() - start)

        return total_hits