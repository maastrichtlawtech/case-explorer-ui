from opensearchpy import OpenSearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
import os
import time


class OpenSearchClient:

    def __init__(self, endpoint, index, max_hits=1, page_limit=1, timeout=10):

        self.max_hits = max_hits        # max number of hits (matching items) per query (page)
        self.page_limit = page_limit    # max number of queries (pages)
        self.timeout = timeout          # request timeout in s
        self.index=index

        awsauth = AWS4Auth(
            os.getenv('AWS_ACCESS_KEY_ID'), 
            os.getenv('AWS_SECRET_ACCESS_KEY'), 
            os.getenv('AWS_REGION'), 
            'es', 
            session_token=os.getenv('AWS_SESSION_TOKEN'))

        self.es = OpenSearch(
            hosts = [{'host': endpoint, 'port': 443}],
            http_auth = awsauth,
            use_ssl = True,
            verify_certs = True,
            connection_class = RequestsHttpConnection,
            timeout = self.timeout
        )

    
    def execute(self, query, return_attributes):
        """
        retrieves given attributes for all items matching query

        :param query: query dict in Elasticsearch query DSL
        :param return_attributes: list of string attribute names to return
        :return: list of item dicts containing attribute data
        """
        total_hits = []
        limit_reached = False
        #pit_id = es.open_point_in_time(index='caselaw4', keep_alive= f'{timeout/60}m')
        start = time.time()
        result = self.es.search(
            index=[self.index],
            body={
                'size': self.max_hits,
                'query': query,
                #'pit': {'id': pit_id}
                #'sort': [{"_doc": "asc"}],
                '_source': return_attributes
            },
            request_timeout = self.timeout
        )
        hits = result['hits']['hits']
        total_hits.extend(hits)

        page_count = 1
        while len(hits) > 0:
            if page_count == self.page_limit or len(total_hits) >= self.max_hits:
                limit_reached = True
                print(f'OS: Request limit reached!')
                break
            #pit_id = result['pit_id']
            result = self.es.search(
                index=[self.index],
                body={
                    'from': page_count*self.max_hits,
                    'size': self.max_hits,
                    'query': query,
                    #'pit': {'id': pit_id},
                    #'sort': [{"_doc": "asc"}],
                    '_source': return_attributes,
                    #'search_after': hits[-1]['sort'],
                    #'track_total_hits': False
                },
                request_timeout = self.timeout
            )
            hits = result['hits']['hits']
            total_hits.extend(hits)
            page_count += 1
            #print(f'COUNTER: {counter}')
        
        #es.close_point_in_time(body={'id': pit_id})

        #print('Duration es search:', time.time() - start)
        print(f'OS: {len(total_hits)}/{self.max_hits} items fetched.')
        print(f'OS: {int(page_count)}/{self.page_limit} pages scanned.')
        print(f'OS: took {time.time()-start} s.')

        return total_hits, limit_reached