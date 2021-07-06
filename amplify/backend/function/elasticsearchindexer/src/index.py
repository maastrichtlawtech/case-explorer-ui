from clients.elasticsearch_client import ElasticsearchClient
from settings import TABLE_NAME, ELASTICSEARCH_ENDPOINT
import time

# set up Elasticsearch client
es_client = ElasticsearchClient(
    endpoint=ELASTICSEARCH_ENDPOINT,
    index=TABLE_NAME,
    timeout= 900,
)


def handler(event, context):
    # create new index with correct mapping
    es_client.es.indices.create(
        index=TABLE_NAME + '_new', 
        body=
        {
            'mappings': {
                'doc': {
                    'properties': {
                        'ecli': {'type': 'keyword'},
                        'SourceDocDate': {'type': 'keyword'}
                    }
                }
            }          
        })

    # reindex new index from old index
    es_client.es.reindex(body={
        'source': {
            'index': TABLE_NAME
        },
        'dest': {
            'index': TABLE_NAME + '_new'
        }
    }, timeout='15m', slices='auto', wait_for_completion=True)

    time.sleep(1)
    # delete old index
    #es_client.es.indices.delete(index=TABLE_NAME, timeout='15m')

    # # recreate old index with correct mapping and reindex from new index
    # es_client.es.indices.create(
    #     index=TABLE_NAME, 
    #     body=
    #     {
    #         'mappings': {
    #             'doc': {
    #                 'properties': {
    #                     'ecli': {'type': 'keyword'}
    #                 }
    #             }
    #         }          
    #     })
    
    # # reindex new index from old index
    # es_client.es.reindex(body={
    #     'source': {
    #         'index': TABLE_NAME + '_new'
    #     },
    #     'dest': {
    #         'index': TABLE_NAME
    #     }
    # }, timeout='15m', wait_for_completion=True)

    # time.sleep(1)
    # # delete old index
    # es_client.es.indices.delete(index=TABLE_NAME + '_new', timeout='15m')

    return {}