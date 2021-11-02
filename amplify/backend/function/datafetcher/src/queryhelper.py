from boto3.dynamodb.conditions import Attr, Key
from definitions import DATA_SOURCES, KEYWORDS, ARTICLES, ECLIS, DATE_START, DATE_END, INSTANCES, DOMAINS, DOCTYPES, \
    get_queryhandler_attributes, get_keyword_search_attributes, get_article_search_attributes


def build_ddb_projection_expression(return_attributes):
    """
    converts list of attribute names to token substitutes to avoid conflicts with DynamoDB reserved words

    :param attributes: list of attribute string names
    :return: projection expression string, dict map of expression attribute tokens to attribute names
    """
    tokens = ['#' + attribute for attribute in return_attributes]
    projection_expression = ', '.join(tokens)
    expression_attribute_names = dict(zip(tokens, return_attributes))
    return projection_expression, expression_attribute_names

def get_doctype_names(doctype_codes):
    doctypes = []
    for doctype in doctype_codes:
        if doctype == 'DEC':
            doctypes.append('Uitspraak')
        elif doctype == 'OPI':
            doctypes.append('Conclusie')
    return doctypes

def get_datasource_names(datasource_codes):
    datasources = []
    for datasource in datasource_codes:
        if datasource == 'RS':
            datasources.append('Rechtspraak')
    return datasources

class QueryHelper:

    def __init__(self, search_params, authorized):
        self.search_params = search_params
        self.authorized = authorized
        self.article_search_attributes = get_article_search_attributes()
        self.return_attributes = get_queryhandler_attributes(self.authorized)
        self.keyword_search_attributes = get_keyword_search_attributes(self.authorized)

    def get_ddb_projection_expression(self):
        return build_ddb_projection_expression(self.return_attributes)

    def get_ddb_filter_expression_sourcedocdate(self):
        return Attr('source').is_in(get_datasource_names(self.search_params[DATA_SOURCES])) \
               & Attr('document_type').is_in(get_doctype_names(self.search_params[DOCTYPES])) \
               & Attr('date_decision').between(self.search_params[DATE_START], self.search_params[DATE_END])

    def get_ddb_filter_expression_citation(self):
        return Attr('cites').exists() | Attr('cited_by').exists()

    def get_ddb_filter_expression_instances(self):
        if self.authorized:
            return (Attr('instance').exists() & Attr('instance').is_in(self.search_params[INSTANCES])) \
                | (Attr('instance_li').exists() & Attr('instance_li').is_in(self.search_params[INSTANCES])) \
                | (Attr('instance').not_exists() & Attr('instance_li').not_exists())
        else:
            return (Attr('instance').exists() & Attr('instance').is_in(self.search_params[INSTANCES])) \
                | Attr('instance').not_exists()

    def get_ddb_filter_expression_domain(self, domain):
        if self.authorized:
            return (Attr('domains').exists() & Attr('domains').contains(domain)) \
                | (Attr('domains_li').exists() & Attr('domains_li').contains(domain)) #\
                #| (Attr('domains').not_exists() & Attr('domains_li').not_exists())
        else:
            return (Attr('domains').exists() & Attr('domains').contains(domain)) #\
                #| Attr('domains').not_exists()

    def get_ddb_key_expression_ecli(self, ecli):
        return Key('ecli').eq(ecli) & Key('ItemType').eq('DATA')

    def get_ddb_key_expression_instance(self, key_name, instance, source, doc):
        return Key(key_name).eq(instance) \
            & Key('SourceDocDate').between(f'{source}_{doc}_{self.search_params[DATE_START]}', \
                f'{source}_{doc}_{self.search_params[DATE_END]}')

    def get_ddb_key_expression_domain(self, key_prefix, domain, source, doc):
        return Key('ItemType').eq(f'{key_prefix}_{domain}') \
            & Key('SourceDocDate').between(f'{source}_{doc}_{self.search_params[DATE_START]}', \
                f'{source}_{doc}_{self.search_params[DATE_END]}')

    def get_elasticsearch_query(self):
        """
        Builds Elasticsearch query to filter by doc_source_eclis if provided and match keywords and articles.
        :param keywords: string of keywords in simple query string syntax*
        :param articles: string of legal provisions in simple query string syntax*
        :param eclis: list of eclis
        :param authorized: boolean flag whether or not permission to access Legal Intelligence data is given
        :return: dict of Elasticsearch query in Query DSL
        * simple query string syntax: https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-simple-query-string-query.html
        """
        expressions = []
        filter = []
        should_instance = []
        #should_citation = []
        should_domain = []

        # FILTER: results must match all clauses
        filter.append({'terms': {'source': get_datasource_names(self.search_params[DATA_SOURCES])}})
        filter.append({'terms': {'document_type': get_doctype_names(self.search_params[DOCTYPES])}})
        filter.append({
            'range': {
                'date_decision': {
                    'gte': self.search_params[DATE_START],
                    'lte': self.search_params[DATE_END]
                }}})
        if self.search_params[ECLIS]:
            filter.append({'terms': {'ecli': self.search_params[ECLIS]}})
        if self.search_params[KEYWORDS]: 
            filter.append({
                'simple_query_string': {
                    'query': self.search_params[KEYWORDS],
                    'fields': self.keyword_search_attributes,
                    'analyzer': 'standard'
                },
            })
        if self.search_params[ARTICLES]: 
            filter.append({
                'simple_query_string': {
                    'query': self.search_params[ARTICLES],
                    'fields': self.article_search_attributes
                },
            })

        expressions.append({'bool': {'filter': filter}})

        # SHOULD: results must match at least one of the given clauses
        #should_citation.append({'exists': {'field': 'cites'}})
        #should_citation.append({'exists': {'field': 'cited_by'}})
        # @TODO: uncomment once indexing has finished
        # expressions.append({'bool': {'should': shoulds_citation}})

        if self.search_params[INSTANCES]:
            should_instance.append({'terms': {'instance': self.search_params[INSTANCES]}})
            if self.authorized:
                should_instance.append({'terms': {'instance_li': self.search_params[INSTANCES]}})
            expressions.append({'bool': {'should': should_instance}})

        if self.search_params[DOMAINS]:
            should_domain.append({'terms': {'domains': self.search_params[DOMAINS]}})
            if self.authorized:
                should_domain.append({'terms': {'domains_li': self.search_params[DOMAINS]}})
            expressions.append({'bool': {'should': should_domain}})

        return {'bool': {'filter': expressions}}            


    