# attributes essential to the perfect graph app functionality 
# (to compute network statistics and apply local filters)
NODE_ESSENTIAL = [
    'date_decision',
    'document_type',
    'domains',
    'ecli',
    'instance',
    'jurisdiction_country',
    'url_publication', #
    'summary', #
    'procedure_type', #
    'predecessor_successor_cases', #
    'ecli_decision', #
    'ecli_opinion', #
    'legal_provisions',
    'cited_by', #
    'cites', #
    'source'
]

NODE_ESSENTIAL_LI = NODE_ESSENTIAL + [
    'date_decision_li',
    'domains_li',
    'instance_li',
    'jurisdiction_country_li',
    'summary_li', #
    'source_li'
]

# attributes to be displayed to the user when viewing a node
NODE_FULL = NODE_ESSENTIAL + [
    'url_publication',
    'summary',
    'procedure_type',
    'predecessor_successor_cases',
    'ecli_decision',
    'ecli_opinion',
    'cited_by',
    'cites'
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

# attributes to be searched for legal provision by Elasticsearch
ARTICLE_SEARCH = [
    'legal_provisions'
]