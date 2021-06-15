/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateCaselawV6Input = {
  ItemType: string,
  SourceDocDate?: string | null,
  ecli: string,
  instance?: string | null,
  instance_li?: string | null,
};

export type ModelCaselawV6ConditionInput = {
  SourceDocDate?: ModelStringInput | null,
  instance?: ModelStringInput | null,
  instance_li?: ModelStringInput | null,
  and?: Array< ModelCaselawV6ConditionInput | null > | null,
  or?: Array< ModelCaselawV6ConditionInput | null > | null,
  not?: ModelCaselawV6ConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type CaselawV6 = {
  __typename: "CaselawV6",
  ItemType: string,
  SourceDocDate?: string | null,
  ecli: string,
  instance?: string | null,
  instance_li?: string | null,
  createdAt: string,
  updatedAt: string,
};

export type UpdateCaselawV6Input = {
  ItemType: string,
  SourceDocDate?: string | null,
  ecli: string,
  instance?: string | null,
  instance_li?: string | null,
};

export type DeleteCaselawV6Input = {
  ecli: string,
  ItemType: string,
};

export type Network = {
  __typename: "Network",
  nodes?:  Array<Node | null > | null,
  edges?:  Array<Edge | null > | null,
  message?: string | null,
};

export type Node = {
  __typename: "Node",
  id?: string | null,
  data?: string | null,
  message?: string | null,
};

export type Edge = {
  __typename: "Edge",
  id?: string | null,
  source?: string | null,
  target?: string | null,
  data?: string | null,
};

export type ModelStringKeyConditionInput = {
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
};

export type ModelCaselawV6FilterInput = {
  ItemType?: ModelStringInput | null,
  SourceDocDate?: ModelStringInput | null,
  ecli?: ModelStringInput | null,
  instance?: ModelStringInput | null,
  instance_li?: ModelStringInput | null,
  and?: Array< ModelCaselawV6FilterInput | null > | null,
  or?: Array< ModelCaselawV6FilterInput | null > | null,
  not?: ModelCaselawV6FilterInput | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelCaselawV6Connection = {
  __typename: "ModelCaselawV6Connection",
  items?:  Array<CaselawV6 | null > | null,
  nextToken?: string | null,
};

export type SearchableCaselawV6FilterInput = {
  ItemType?: SearchableStringFilterInput | null,
  SourceDocDate?: SearchableStringFilterInput | null,
  ecli?: SearchableStringFilterInput | null,
  instance?: SearchableStringFilterInput | null,
  instance_li?: SearchableStringFilterInput | null,
  and?: Array< SearchableCaselawV6FilterInput | null > | null,
  or?: Array< SearchableCaselawV6FilterInput | null > | null,
  not?: SearchableCaselawV6FilterInput | null,
};

export type SearchableStringFilterInput = {
  ne?: string | null,
  gt?: string | null,
  lt?: string | null,
  gte?: string | null,
  lte?: string | null,
  eq?: string | null,
  match?: string | null,
  matchPhrase?: string | null,
  matchPhrasePrefix?: string | null,
  multiMatch?: string | null,
  exists?: boolean | null,
  wildcard?: string | null,
  regexp?: string | null,
  range?: Array< string | null > | null,
};

export type SearchableCaselawV6SortInput = {
  field?: SearchableCaselawV6SortableFields | null,
  direction?: SearchableSortDirection | null,
};

export enum SearchableCaselawV6SortableFields {
  ItemType = "ItemType",
  SourceDocDate = "SourceDocDate",
  ecli = "ecli",
  instance = "instance",
  instance_li = "instance_li",
}


export enum SearchableSortDirection {
  asc = "asc",
  desc = "desc",
}


export type SearchableCaselawV6Connection = {
  __typename: "SearchableCaselawV6Connection",
  items?:  Array<CaselawV6 | null > | null,
  nextToken?: string | null,
  total?: number | null,
};

export type CreateCaselawV6MutationVariables = {
  input: CreateCaselawV6Input,
  condition?: ModelCaselawV6ConditionInput | null,
};

export type CreateCaselawV6Mutation = {
  createCaselawV6?:  {
    __typename: "CaselawV6",
    ItemType: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateCaselawV6MutationVariables = {
  input: UpdateCaselawV6Input,
  condition?: ModelCaselawV6ConditionInput | null,
};

export type UpdateCaselawV6Mutation = {
  updateCaselawV6?:  {
    __typename: "CaselawV6",
    ItemType: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteCaselawV6MutationVariables = {
  input: DeleteCaselawV6Input,
  condition?: ModelCaselawV6ConditionInput | null,
};

export type DeleteCaselawV6Mutation = {
  deleteCaselawV6?:  {
    __typename: "CaselawV6",
    ItemType: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type QueryNetworkByUserInputQueryVariables = {
  DataSources?: Array< string | null > | null,
  Keywords?: string | null,
  Articles?: string | null,
  Eclis?: string | null,
  DegreesSources?: number | null,
  DegreesTargets?: number | null,
  DateStart?: string | null,
  DateEnd?: string | null,
  Instances?: Array< string | null > | null,
  Domains?: Array< string | null > | null,
  Doctypes?: Array< string | null > | null,
  LiPermission?: boolean | null,
};

export type QueryNetworkByUserInputQuery = {
  queryNetworkByUserInput?:  {
    __typename: "Network",
    nodes?:  Array< {
      __typename: "Node",
      id?: string | null,
      data?: string | null,
      message?: string | null,
    } | null > | null,
    edges?:  Array< {
      __typename: "Edge",
      id?: string | null,
      source?: string | null,
      target?: string | null,
      data?: string | null,
    } | null > | null,
    message?: string | null,
  } | null,
};

export type FetchNodeDataQueryVariables = {
  Ecli?: string | null,
};

export type FetchNodeDataQuery = {
  fetchNodeData?:  {
    __typename: "Node",
    id?: string | null,
    data?: string | null,
    message?: string | null,
  } | null,
};

export type TestAuthQueryVariables = {
  Ecli?: string | null,
};

export type TestAuthQuery = {
  testAuth?:  {
    __typename: "Node",
    id?: string | null,
    data?: string | null,
    message?: string | null,
  } | null,
};

export type GetCaselawV6QueryVariables = {
  ecli: string,
  ItemType: string,
};

export type GetCaselawV6Query = {
  getCaselawV6?:  {
    __typename: "CaselawV6",
    ItemType: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListCaselawV6sQueryVariables = {
  ecli?: string | null,
  ItemType?: ModelStringKeyConditionInput | null,
  filter?: ModelCaselawV6FilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListCaselawV6sQuery = {
  listCaselawV6s?:  {
    __typename: "ModelCaselawV6Connection",
    items?:  Array< {
      __typename: "CaselawV6",
      ItemType: string,
      SourceDocDate?: string | null,
      ecli: string,
      instance?: string | null,
      instance_li?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type QueryByItemTypeQueryVariables = {
  ItemType?: string | null,
  SourceDocDate?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelCaselawV6FilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type QueryByItemTypeQuery = {
  queryByItemType?:  {
    __typename: "ModelCaselawV6Connection",
    items?:  Array< {
      __typename: "CaselawV6",
      ItemType: string,
      SourceDocDate?: string | null,
      ecli: string,
      instance?: string | null,
      instance_li?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type QueryByInstanceQueryVariables = {
  instance?: string | null,
  SourceDocDate?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelCaselawV6FilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type QueryByInstanceQuery = {
  queryByInstance?:  {
    __typename: "ModelCaselawV6Connection",
    items?:  Array< {
      __typename: "CaselawV6",
      ItemType: string,
      SourceDocDate?: string | null,
      ecli: string,
      instance?: string | null,
      instance_li?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type QueryByInstanceLiQueryVariables = {
  instance_li?: string | null,
  SourceDocDate?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelCaselawV6FilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type QueryByInstanceLiQuery = {
  queryByInstanceLi?:  {
    __typename: "ModelCaselawV6Connection",
    items?:  Array< {
      __typename: "CaselawV6",
      ItemType: string,
      SourceDocDate?: string | null,
      ecli: string,
      instance?: string | null,
      instance_li?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type SearchCaselawV6sQueryVariables = {
  filter?: SearchableCaselawV6FilterInput | null,
  sort?: SearchableCaselawV6SortInput | null,
  limit?: number | null,
  nextToken?: string | null,
  from?: number | null,
};

export type SearchCaselawV6sQuery = {
  searchCaselawV6s?:  {
    __typename: "SearchableCaselawV6Connection",
    items?:  Array< {
      __typename: "CaselawV6",
      ItemType: string,
      SourceDocDate?: string | null,
      ecli: string,
      instance?: string | null,
      instance_li?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
    total?: number | null,
  } | null,
};

export type OnCreateCaselawV6Subscription = {
  onCreateCaselawV6?:  {
    __typename: "CaselawV6",
    ItemType: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateCaselawV6Subscription = {
  onUpdateCaselawV6?:  {
    __typename: "CaselawV6",
    ItemType: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteCaselawV6Subscription = {
  onDeleteCaselawV6?:  {
    __typename: "CaselawV6",
    ItemType: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};
