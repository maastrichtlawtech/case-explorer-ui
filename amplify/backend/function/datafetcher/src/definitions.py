from enum import Enum

# SEARCH PARAMETERS:
DATA_SOURCES = 'DataSources'
KEYWORDS = 'Keywords'
ARTICLES = 'Articles'
ECLIS = 'Eclis'
DEGREES_SOURCES = 'DegreesSources'
DEGREES_TARGETS = 'DegreesTargets'
DATE_START = 'DateStart'
DATE_END = 'DateEnd'
INSTANCES = 'Instances'
DOMAINS = 'Domains'
DOCTYPES = 'Doctypes'


def add_li_attributes(authorized, attributes):
    if authorized:
        # attributes that are both in legal intelligence and rechtspraak data
        shared_attributes = [
            'date_decision',
            'domains',
            'instance',
            'jurisdiction_country',
            'summary',
            'source'
        ]
        result = attributes.copy()
        for att in shared_attributes:
            if att in attributes:
                result.append(att + '_li')
        return result
    return attributes


def get_id_list(authorized):
    return add_li_attributes(authorized, [
        'ecli'
    ])


def get_full_list(authorized):
    return add_li_attributes(authorized, [
        'ecli',
        'date_decision',
        'cites',
        'cited_by',
        'document_type',
        'domains',
        'instance',
        'source',
        'legal_provisions',
        'url_publication',
        'summary',
        'procedure_type',
        'predecessor_successor_cases',
        'ecli_decision',
        'ecli_opinion',
        'jurisdiction_country'
    ])

    
def get_networkstats_list(authorized):
    return add_li_attributes(authorized, [
        'ecli',
        'date_decision'
    ])


def get_queryhandler_list(authorized):
    return add_li_attributes(authorized, [
        'ecli',
        'date_decision',
        'cites',
        'cited_by'
    ])


def get_keywordsearch_list(authorized):
    return add_li_attributes(authorized, [
        'summary',
        # 'procedure_type',      ES field mapping needs to be changed to 'text' to be phrase searchable
        'full_text',
        'predecessor_successor_cases'
    ])


def get_articlesearch_list(authorized=False):
    return [
        'legal_provisions'
    ]


class AttributesList(Enum):
    ID = get_id_list                        # unique identifier attribute
    ALL = get_full_list                     # attributes to be displayed to the user when viewing a node
    NETWORKSTATS = get_networkstats_list    # attributes needed for network statistics computation
    QUERYHANDLER = get_queryhandler_list    # attributes needed for queryhandler functionality
    KEYWORDSEARCH = get_keywordsearch_list  # attributes to be searched for keywords by Elasticsearch
    ARTICLESEARCH = get_articlesearch_list  # attributes to be searched for legal provisions by Elasticsearch
