# RESOURCES:
TABLE_NAME = 'Caselaw'
ELASTICSEARCH_ENDPOINT = 'search-amplify-elasti-1vcvtg2fe653t-fnjqu2kttzllzxgcj4jlptgb3y.eu-central-1.es.amazonaws.com'


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
# attributes essential to the perfect graph app functionality 
# (to compute edges, network statistics and apply local filters)
NODE_ESSENTIAL = [
    'date_decision',
    'document_type',
    'domains',
    'ecli',
    'instance',
    'jurisdiction_country',
    'legal_provisions',
    'source',
    'cites',
    'cited_by'
]

NODE_ESSENTIAL_LI = NODE_ESSENTIAL + [
    'date_decision_li',
    'domains_li',
    'instance_li',
    'jurisdiction_country_li',
    #'source_li'
]

# attributes to be displayed to the user when viewing a node
NODE_FULL = NODE_ESSENTIAL + [
    'url_publication',
    'summary',
    'procedure_type',
    'predecessor_successor_cases',
    'ecli_decision',
    'ecli_opinion'
]

NODE_FULL_LI = NODE_FULL + [
    'date_decision_li',
    'domains_li',
    'instance_li',
    'jurisdiction_country_li',
    'summary_li',
    'source_li'
]

# attributes to be searched for keywords by Elasticsearch
KEYWORD_SEARCH = [
    'summary',
    'procedure_type',
    'full_text',
    'predecessor_successor_cases'
]

KEYWORD_SEARCH_LI = KEYWORD_SEARCH + [
    'summary_li',
]

# attributes to be searched for legal provisions by Elasticsearch
ARTICLE_SEARCH = [
    'legal_provisions'
]

def get_essential_attributes(authorized):
    if authorized:
        return NODE_ESSENTIAL_LI
    return NODE_ESSENTIAL

def get_full_attributes(authorized):
    if authorized:
        return NODE_FULL_LI
    return NODE_FULL