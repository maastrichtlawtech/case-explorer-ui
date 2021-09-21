import warnings
from datetime import datetime, date

def is_authorized(event):
    authorized = False
    if "identity" in event and event["identity"]:
        user_id = event['identity']['claims']['username']
        if user_id.startswith('surfconext'):
            authorized = True
    return authorized


def format_node_data(item):
    """
    formats DynamoDB dict to node data type, handling replacements of Rechtspraak data with legal intelligence data
    
    :param item: dict map of attribute name strings to value objects
    :return: dict map of 'id' -> item id string and 'data' -> data dict
    """
    if item == {}:
        return {'id': None, 'data': None}
    atts = list(item.keys())
    for attribute in atts:
        # remove li attribute if correspondig rs attribute present, except for summary
        if attribute + '_li' in item:
            if attribute == 'summary':
                item.pop(attribute)
            else:
                item.pop(attribute + '_li')
        # convert set types to lists to make JSON serializable
        if attribute in item and type(item[attribute]) is set:
            item[attribute] = list(item[attribute])
        # remove '_li' suffix from attribute name if applicable
        if attribute in item and attribute.endswith('_li'):
            item[attribute[:-3]] = item[attribute]
            item.pop(attribute)
    return {'id': item['ecli'], 'data': item}


def get_key(ecli):
    return {'ecli': ecli, 'ItemType': 'DATA'}


def build_projection_expression(attributes):
    """
    converts list of attribute names to token substitutes to avoid conflicts with DynamoDB reserved words
    
    :param attributes: list of attribute string names
    :return: projection expression string, dict map of expression attribute tokens to attribute names
    """
    tokens = ['#' + attribute for attribute in attributes]
    projection_expression = ', '.join(tokens)
    expression_attribute_names = dict(zip(tokens, attributes))
    return projection_expression, expression_attribute_names


def verify_input_string_list(key, params):
    # checks string list input types for validity and returns default value if invalid
    if not key in params \
            or not params[key] \
            or not isinstance(params[key], list) \
            or not all(isinstance(elem, str) for elem in params[key]) \
            or len(params[key]) < 1:
        warnings.warn(f"Invalid input: argument '{key}' of type list of strings expected. Setting '{key}' to [''].")
        return [""]
    else:
        return params[key]


def verify_input_string(key, params):
    if not key in params \
            or not isinstance(params[key], str):
        warnings.warn(f"Invalid input: argument '{key}' of type string expected. Setting '{key}' to ''.")
        return ""
    else:
        return params[key].strip()


def verify_input_ecli_string(key, params):
    return verify_input_string(key, params).split(' ')


def verify_input_start_date(key, params):
    if not key in params \
            or not isinstance(params[key], str) \
            or not datetime.strptime(params[key], '%Y-%m-%d'):
        warnings.warn(f"Invalid input: argument '{key}' of type AWSDate ('YYYY-MM-DD') expected. Setting '{key}' to '1900-01-01'.")
        return '1900-01-01'
    else:
        return params[key]


def verify_input_end_date(key, params):
    if not key in params \
            or not isinstance(params[key], str) \
            or not datetime.strptime(params[key], '%Y-%m-%d') \
            or not date.fromisoformat(params['DateStart']) < date.fromisoformat(params[key]):
        warnings.warn(f"Invalid input: argument '{key}' of type AWSDate ('YYYY-MM-DD') expected "
                      f"and '{key}' must be after 'DateStart'. Setting '{key}' to '{date.today().strftime('%Y-%m-%d')}'.")
        return date.today().strftime('%Y-%m-%d')
    else:
        return params[key]


def verify_input_int(key, params):
    if not key in params \
            or not isinstance(params[key], int) \
            or not 1 <= params[key] <= 5:
        warnings.warn(f"Invalid input: argument '{key}' of type Int between 1 and 5 expected."
                      f"Setting '{key}' to 1.")
        return 1
    else:
        return params[key]

