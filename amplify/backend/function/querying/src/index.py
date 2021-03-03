from GraphqlClient import GraphqlClient
import os
from os.path import join, dirname
from dotenv import load_dotenv

load_dotenv(join(dirname(dirname(dirname(dirname(dirname(dirname(__file__)))))), '.env'))

API_ENDPOINT = os.environ.get('GRAPHQL_API_URL')
API_KEY = os.environ.get('GRAPHQL_API_KEY')

def handler(event, context):
    gq_client = GraphqlClient(
        endpoint=API_ENDPOINT,
        headers={'x-api-key': API_KEY}
    )

    query, query_name = generate_query_by_instance(instance=event["Instances"], source=event["DataSources"], 
                                                        doc=event["Doctypes"], date_start=event["DateStart"], date_end=event["DateEnd"],
                                                        domain=event["Domains"], l_reference=event["Articles"], next_token="")

    result = gq_client.execute(
        query=query, 
        operation_name='MyQuery'
    )

    return result


def generate_query_by_instance(instance, source, doc, date_start, date_end,
                                domain="", l_reference="", next_token=""):
    query = f"""
    query MyQuery {{
        queryByInstance(
        instance: "{instance}",
        filter: {{
          domains: {{contains: "{domain}"}}
        }}) {{
        nextToken
        items {{
            ecli
        }}
      }}
    }}
      
    """
    return query, "queryByInstance"
