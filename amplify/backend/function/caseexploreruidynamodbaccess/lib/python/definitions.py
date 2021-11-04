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


# ATTRIBUTES:
# attributes that are both in legal intelligence and rechtspraak data
shared_attributes = [
    'date_decision',
    'domains',
    'instance',
    'jurisdiction_country',
    'summary',
    'source'
]

# attributes needed for network statistics computation
node_attributes_networkstatistics = [
    'ecli',
    'date_decision'
]

# attributes needed for queryhandler functionality
# (to compute edges, prepare network statistics computation)
node_attributes_queryhandler = node_attributes_networkstatistics + [
    'cites',
    'cited_by'
]

# attributes to be displayed to the user when viewing a node
node_attributes_full = node_attributes_queryhandler + [
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
]

# attributes to be searched for keywords by Elasticsearch
node_attributes_keyword_search = [
    'summary',
    'procedure_type',
    'full_text',
    'predecessor_successor_cases'
]

# attributes to be searched for legal provisions by Elasticsearch
node_attributes_article_search = [
    'legal_provisions'
]

def _add_li_attributes(attributes):
    result = attributes.copy()
    for att in shared_attributes:
        if att in attributes:
            result.append(att + '_li')
    return result

def get_networkstatistics_attributes(authorized=True):
    if authorized:
        return _add_li_attributes(node_attributes_networkstatistics)
    return node_attributes_networkstatistics

def get_queryhandler_attributes(authorized=True):
    if authorized:
        return _add_li_attributes(node_attributes_queryhandler)
    return node_attributes_queryhandler

def get_full_attributes(authorized=True):
    if authorized:
        return _add_li_attributes(node_attributes_full)
    return node_attributes_full

def get_keyword_search_attributes(authorized=True):
    if authorized:
        return _add_li_attributes(node_attributes_keyword_search)
    return node_attributes_keyword_search

def get_article_search_attributes():
    return node_attributes_article_search

