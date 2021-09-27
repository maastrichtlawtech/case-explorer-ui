from clients.elasticsearch_client import ElasticsearchClient
from definitions import TABLE_NAME, ELASTICSEARCH_ENDPOINT
import time

# set up Elasticsearch client
es_client = ElasticsearchClient(
    endpoint=ELASTICSEARCH_ENDPOINT,
    index=TABLE_NAME,
    timeout= 900,
)

mapping = {
    'ecli': {'type': 'keyword'},
    'SourceDocDate': {'type': 'keyword'},
    'ItemType': {'type': 'keyword'},
    'document_type': {'type': 'keyword'},
    'domain': {'type': 'keyword'},
    'domain_li': {'type': 'keyword'},
    'ecli_decision': {'type': 'keyword'},
    'ecli_opinion': {'type': 'keyword'},
    'instance': {'type': 'keyword'},
    'instance_li': {'type': 'keyword'},
    'jurisdiction_country': {'type': 'keyword'},
    'jurisdiction_country_li': {'type': 'keyword'},
    'language': {'type': 'keyword'},
    'procedure_type': {'type': 'keyword'},
    'source': {'type': 'keyword'},
    'source_li': {'type': 'keyword'}
}


def handler(event, context):
    # create new index with correct mapping
    # es_client.es.indices.create(
    #     index=TABLE_NAME.lower() + '_new', 
    #     body=
    #     {
    #         'mappings': {
    #             'doc': {
    #                 'properties': mapping
    #             }
    #         }          
    #     })

    # # reindex new index from old index
    # es_client.es.reindex(body={
    #     'source': {
    #         'index': TABLE_NAME.lower()
    #     },
    #     'dest': {
    #         'index': TABLE_NAME.lower() + '_new'
    #     }
    # }, timeout='15m', slices='auto', wait_for_completion=True)

    # time.sleep(1)
    # delete old index
    # es_client.es.indices.delete(index=TABLE_NAME.lower(), timeout='15m')

    # # recreate old index with correct mapping and reindex from new index
    # es_client.es.indices.create(
    #     index=TABLE_NAME.lower(), 
    #     body=
    #     {
    #         'mappings': {
    #             'doc': {
    #                 'properties': mapping
    #             }
    #         }          
    #     })
    
    # # reindex new index from old index
    # es_client.es.reindex(body={
    #     'source': {
    #         'index': TABLE_NAME.lower() + '_new'
    #     },
    #     'dest': {
    #         'index': TABLE_NAME.lower()
    #     }
    # }, timeout='15m', wait_for_completion=True)

    # time.sleep(1)
    # delete old index
    es_client.es.indices.delete(index=TABLE_NAME.lower() + '_new', timeout='15m')

    return {}