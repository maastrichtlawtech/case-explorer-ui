import warnings
from datetime import datetime, date

def is_authorized(event):
    authorized = False
    if "identity" in event and event["identity"]:
        user_id = event['identity']['claims']['username']
        if user_id.startswith('surfconext'):
            authorized = True
    return authorized


def format_node_data(item, mode='full'):
    """
    formats DynamoDB dict to node data type, handling replacements of Rechtspraak data with legal intelligence data
    
    :param item: dict map of attribute name strings to value objects
    :return: dict map of 'id' -> item id string and 'data' -> data dict
    """
    if item == {}:
        return {'id': None, 'data': None}
    if mode == 'id':
        return {'id': item['ecli'], 'data': {}}
    if mode == 'essential':
        data = {}
        if 'date_decision' in item:
            data['date_decision'] = item['date_decision']
        return {'id': item['ecli'], 'data': data}
    if mode == 'full':
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
        for attribute in atts:
            # remove '_li' suffix from attribute name if applicable
            if attribute in item and attribute.endswith('_li'):
                if attribute[:-3] in item:
                    print('warning: overwriting existing RS attribute with LI attribute')
                item[attribute[:-3]] = item[attribute]
                item.pop(attribute)
        return {'id': item['ecli'], 'data': item}
    else:
        warnings.warn('Invalid formatting mode. Please choose one of: ["id", "essential", "full"].')


def get_key(ecli):
    return {'ecli': ecli, 'ItemType': 'DATA'}


def verify_input_string_list(key, params, warn=True):
    # checks string list input types for validity and returns default value if invalid
    if not key in params or not params[key] or params[key] == []:
        return None
    if not params[key] \
        or not isinstance(params[key], list) \
        or not all(isinstance(elem, str) for elem in params[key]):
        if warn:
            warnings.warn(f"Invalid input: argument '{key}' of type list of strings expected. Setting '{key}' to None.")
        return None
    return params[key]


def verify_input_string(key, params, warn=True):
    if not key in params or not params[key] or params[key] == '':
        return None
    if not isinstance(params[key], str):
        if warn:
            warnings.warn(f"Invalid input: argument '{key}' of type string expected. Setting '{key}' to None.")
        return None
    return params[key].strip()


def verify_data_sources(key, params):
    params[key] = verify_input_string_list(key, params, warn=False)
    # add datasources if  needed
    available_datasources = {'RS'}
    if not params[key] or set(params[key]).intersection(available_datasources) == {}:
        warnings.warn(f"Invalid input: argument '{key}' must be list subset of {available_datasources}. Setting '{key}' to ['RS'].")
        return ['RS']
    return params[key]


def verify_doc_types(key, params):
    params[key] = verify_input_string_list(key, params, warn=False)
    available_doctypes = {'DEC', 'OPI'}
    if not params[key] or set(params[key]).intersection(available_doctypes) == {}:
        warnings.warn(f"Invalid input: argument '{key}' must be list subset of {available_doctypes}. Setting '{key}' to ['DEC'].")
        return ['DEC']
    return params[key]


def verify_eclis(key, params):
    params[key] = verify_input_string(key, params)
    if not params[key]:
        return None
    return params[key].split(' ')


def verify_date_start(key, params):
    if not key in params \
            or not isinstance(params[key], str) \
            or not datetime.strptime(params[key], '%Y-%m-%d'):
        warnings.warn(f"Invalid input: argument '{key}' of type AWSDate ('YYYY-MM-DD') expected. Setting '{key}' to '1900-01-01'.")
        return '1900-01-01'
    return params[key]


def verify_date_end(key, params):
    if not key in params \
            or not isinstance(params[key], str) \
            or not datetime.strptime(params[key], '%Y-%m-%d') \
            or not date.fromisoformat(params['DateStart']) < date.fromisoformat(params[key]):
        warnings.warn(f"Invalid input: argument '{key}' of type AWSDate ('YYYY-MM-DD') expected "
                      f"and '{key}' must be after 'DateStart'. Setting '{key}' to '{date.today().strftime('%Y-%m-%d')}'.")
        return date.today().strftime('%Y-%m-%d')
    return params[key]


def verify_degrees(key, params):
    if not key in params \
            or not isinstance(params[key], int) \
            or not 0 <= params[key] <= 5:
        warnings.warn(f"Invalid input: argument '{key}' of type Int between 0 and 5 expected."
                      f"Setting '{key}' to 0.")
        return 0
    return params[key]
