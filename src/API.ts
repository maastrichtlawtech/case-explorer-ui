/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateCaselawV4Input = {
  DocSourceId: string,
  SourceDocDate?: string | null,
  ecli: string,
  instance?: string | null,
  instance_li?: string | null,
  extracted_from?: string | null,
};

export type ModelCaselawV4ConditionInput = {
  SourceDocDate?: ModelStringInput | null,
  instance?: ModelStringInput | null,
  instance_li?: ModelStringInput | null,
  extracted_from?: ModelStringInput | null,
  and?: Array< ModelCaselawV4ConditionInput | null > | null,
  or?: Array< ModelCaselawV4ConditionInput | null > | null,
  not?: ModelCaselawV4ConditionInput | null,
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

export type CaselawV4 = {
  __typename: "CaselawV4",
  DocSourceId?: string,
  SourceDocDate?: string | null,
  ecli?: string,
  instance?: string | null,
  instance_li?: string | null,
  extracted_from?: string | null,
  createdAt?: string,
  updatedAt?: string,
};

export type UpdateCaselawV4Input = {
  DocSourceId: string,
  SourceDocDate?: string | null,
  ecli: string,
  instance?: string | null,
  instance_li?: string | null,
  extracted_from?: string | null,
};

export type DeleteCaselawV4Input = {
  ecli: string,
  DocSourceId: string,
};

export type CreateCaselawV5Input = {
  DocId: string,
  DocSourceId?: string | null,
  SourceDocDate?: string | null,
  ecli: string,
  instance?: string | null,
  instance_li?: string | null,
};

export type ModelCaselawV5ConditionInput = {
  DocSourceId?: ModelStringInput | null,
  SourceDocDate?: ModelStringInput | null,
  instance?: ModelStringInput | null,
  instance_li?: ModelStringInput | null,
  and?: Array< ModelCaselawV5ConditionInput | null > | null,
  or?: Array< ModelCaselawV5ConditionInput | null > | null,
  not?: ModelCaselawV5ConditionInput | null,
};

export type CaselawV5 = {
  __typename: "CaselawV5",
  DocId?: string,
  DocSourceId?: string | null,
  SourceDocDate?: string | null,
  ecli?: string,
  instance?: string | null,
  instance_li?: string | null,
  createdAt?: string,
  updatedAt?: string,
};

export type UpdateCaselawV5Input = {
  DocId: string,
  DocSourceId?: string | null,
  SourceDocDate?: string | null,
  ecli: string,
  instance?: string | null,
  instance_li?: string | null,
};

export type DeleteCaselawV5Input = {
  ecli: string,
  DocId: string,
};

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

export type CaselawV6 = {
  __typename: "CaselawV6",
  ItemType?: string,
  SourceDocDate?: string | null,
  ecli?: string,
  instance?: string | null,
  instance_li?: string | null,
  createdAt?: string,
  updatedAt?: string,
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
};

export type Node = {
  __typename: "Node",
  id?: string | null,
  data?: string | null,
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

export type ModelCaselawV4FilterInput = {
  DocSourceId?: ModelStringInput | null,
  SourceDocDate?: ModelStringInput | null,
  ecli?: ModelStringInput | null,
  instance?: ModelStringInput | null,
  instance_li?: ModelStringInput | null,
  extracted_from?: ModelStringInput | null,
  and?: Array< ModelCaselawV4FilterInput | null > | null,
  or?: Array< ModelCaselawV4FilterInput | null > | null,
  not?: ModelCaselawV4FilterInput | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelCaselawV4Connection = {
  __typename: "ModelCaselawV4Connection",
  items?:  Array<CaselawV4 | null > | null,
  nextToken?: string | null,
};

export type ModelCaselawV5FilterInput = {
  DocId?: ModelStringInput | null,
  DocSourceId?: ModelStringInput | null,
  SourceDocDate?: ModelStringInput | null,
  ecli?: ModelStringInput | null,
  instance?: ModelStringInput | null,
  instance_li?: ModelStringInput | null,
  and?: Array< ModelCaselawV5FilterInput | null > | null,
  or?: Array< ModelCaselawV5FilterInput | null > | null,
  not?: ModelCaselawV5FilterInput | null,
};

export type ModelCaselawV5Connection = {
  __typename: "ModelCaselawV5Connection",
  items?:  Array<CaselawV5 | null > | null,
  nextToken?: string | null,
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

export type ModelCaselawV6Connection = {
  __typename: "ModelCaselawV6Connection",
  items?:  Array<CaselawV6 | null > | null,
  nextToken?: string | null,
};

export type SearchableCaselawV4FilterInput = {
  DocSourceId?: SearchableStringFilterInput | null,
  SourceDocDate?: SearchableStringFilterInput | null,
  ecli?: SearchableStringFilterInput | null,
  instance?: SearchableStringFilterInput | null,
  instance_li?: SearchableStringFilterInput | null,
  extracted_from?: SearchableStringFilterInput | null,
  and?: Array< SearchableCaselawV4FilterInput | null > | null,
  or?: Array< SearchableCaselawV4FilterInput | null > | null,
  not?: SearchableCaselawV4FilterInput | null,
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

export type SearchableCaselawV4SortInput = {
  field?: SearchableCaselawV4SortableFields | null,
  direction?: SearchableSortDirection | null,
};

export enum SearchableCaselawV4SortableFields {
  DocSourceId = "DocSourceId",
  SourceDocDate = "SourceDocDate",
  ecli = "ecli",
  instance = "instance",
  instance_li = "instance_li",
  extracted_from = "extracted_from",
}


export enum SearchableSortDirection {
  asc = "asc",
  desc = "desc",
}


export type SearchableCaselawV4Connection = {
  __typename: "SearchableCaselawV4Connection",
  items?:  Array<CaselawV4 | null > | null,
  nextToken?: string | null,
  total?: number | null,
};

export type SearchableCaselawV5FilterInput = {
  DocId?: SearchableStringFilterInput | null,
  DocSourceId?: SearchableStringFilterInput | null,
  SourceDocDate?: SearchableStringFilterInput | null,
  ecli?: SearchableStringFilterInput | null,
  instance?: SearchableStringFilterInput | null,
  instance_li?: SearchableStringFilterInput | null,
  and?: Array< SearchableCaselawV5FilterInput | null > | null,
  or?: Array< SearchableCaselawV5FilterInput | null > | null,
  not?: SearchableCaselawV5FilterInput | null,
};

export type SearchableCaselawV5SortInput = {
  field?: SearchableCaselawV5SortableFields | null,
  direction?: SearchableSortDirection | null,
};

export enum SearchableCaselawV5SortableFields {
  DocId = "DocId",
  DocSourceId = "DocSourceId",
  SourceDocDate = "SourceDocDate",
  ecli = "ecli",
  instance = "instance",
  instance_li = "instance_li",
}


export type SearchableCaselawV5Connection = {
  __typename: "SearchableCaselawV5Connection",
  items?:  Array<CaselawV5 | null > | null,
  nextToken?: string | null,
  total?: number | null,
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


export type SearchableCaselawV6Connection = {
  __typename: "SearchableCaselawV6Connection",
  items?:  Array<CaselawV6 | null > | null,
  nextToken?: string | null,
  total?: number | null,
};

export type CreateCaselawV4MutationVariables = {
  input?: CreateCaselawV4Input,
  condition?: ModelCaselawV4ConditionInput | null,
};

export type CreateCaselawV4Mutation = {
  createCaselawV4?:  {
    __typename: "CaselawV4",
    DocSourceId: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    extracted_from?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateCaselawV4MutationVariables = {
  input?: UpdateCaselawV4Input,
  condition?: ModelCaselawV4ConditionInput | null,
};

export type UpdateCaselawV4Mutation = {
  updateCaselawV4?:  {
    __typename: "CaselawV4",
    DocSourceId: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    extracted_from?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteCaselawV4MutationVariables = {
  input?: DeleteCaselawV4Input,
  condition?: ModelCaselawV4ConditionInput | null,
};

export type DeleteCaselawV4Mutation = {
  deleteCaselawV4?:  {
    __typename: "CaselawV4",
    DocSourceId: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    extracted_from?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateCaselawV5MutationVariables = {
  input?: CreateCaselawV5Input,
  condition?: ModelCaselawV5ConditionInput | null,
};

export type CreateCaselawV5Mutation = {
  createCaselawV5?:  {
    __typename: "CaselawV5",
    DocId: string,
    DocSourceId?: string | null,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateCaselawV5MutationVariables = {
  input?: UpdateCaselawV5Input,
  condition?: ModelCaselawV5ConditionInput | null,
};

export type UpdateCaselawV5Mutation = {
  updateCaselawV5?:  {
    __typename: "CaselawV5",
    DocId: string,
    DocSourceId?: string | null,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteCaselawV5MutationVariables = {
  input?: DeleteCaselawV5Input,
  condition?: ModelCaselawV5ConditionInput | null,
};

export type DeleteCaselawV5Mutation = {
  deleteCaselawV5?:  {
    __typename: "CaselawV5",
    DocId: string,
    DocSourceId?: string | null,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateCaselawV6MutationVariables = {
  input?: CreateCaselawV6Input,
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
  input?: UpdateCaselawV6Input,
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
  input?: DeleteCaselawV6Input,
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

export type GiveMeAllTheDataQueryVariables = {
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

export type GiveMeAllTheDataQuery = {
  giveMeAllTheData?:  {
    __typename: "Network",
    nodes?:  Array< {
      __typename: "Node",
      id?: string | null,
      data?: string | null,
    } | null > | null,
    edges?:  Array< {
      __typename: "Edge",
      id?: string | null,
      source?: string | null,
      target?: string | null,
      data?: string | null,
    } | null > | null,
  } | null,
};

export type GetCaselawV4QueryVariables = {
  ecli?: string,
  DocSourceId?: string,
};

export type GetCaselawV4Query = {
  getCaselawV4?:  {
    __typename: "CaselawV4",
    DocSourceId: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    extracted_from?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListCaselawV4sQueryVariables = {
  ecli?: string | null,
  DocSourceId?: ModelStringKeyConditionInput | null,
  filter?: ModelCaselawV4FilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListCaselawV4sQuery = {
  listCaselawV4s?:  {
    __typename: "ModelCaselawV4Connection",
    items?:  Array< {
      __typename: "CaselawV4",
      DocSourceId: string,
      SourceDocDate?: string | null,
      ecli: string,
      instance?: string | null,
      instance_li?: string | null,
      extracted_from?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetCaselawV5QueryVariables = {
  ecli?: string,
  DocId?: string,
};

export type GetCaselawV5Query = {
  getCaselawV5?:  {
    __typename: "CaselawV5",
    DocId: string,
    DocSourceId?: string | null,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListCaselawV5sQueryVariables = {
  ecli?: string | null,
  DocId?: ModelStringKeyConditionInput | null,
  filter?: ModelCaselawV5FilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListCaselawV5sQuery = {
  listCaselawV5s?:  {
    __typename: "ModelCaselawV5Connection",
    items?:  Array< {
      __typename: "CaselawV5",
      DocId: string,
      DocSourceId?: string | null,
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

export type GetCaselawV6QueryVariables = {
  ecli?: string,
  ItemType?: string,
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

export type ByDocSourceIdQueryVariables = {
  DocSourceId?: string | null,
  extracted_from?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelCaselawV4FilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ByDocSourceIdQuery = {
  ByDocSourceId?:  {
    __typename: "ModelCaselawV4Connection",
    items?:  Array< {
      __typename: "CaselawV4",
      DocSourceId: string,
      SourceDocDate?: string | null,
      ecli: string,
      instance?: string | null,
      instance_li?: string | null,
      extracted_from?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type ByInstanceQueryVariables = {
  instance?: string | null,
  SourceDocDate?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelCaselawV4FilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ByInstanceQuery = {
  ByInstance?:  {
    __typename: "ModelCaselawV4Connection",
    items?:  Array< {
      __typename: "CaselawV4",
      DocSourceId: string,
      SourceDocDate?: string | null,
      ecli: string,
      instance?: string | null,
      instance_li?: string | null,
      extracted_from?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type ByInstanceLiQueryVariables = {
  instance_li?: string | null,
  SourceDocDate?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelCaselawV4FilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ByInstanceLiQuery = {
  ByInstanceLi?:  {
    __typename: "ModelCaselawV4Connection",
    items?:  Array< {
      __typename: "CaselawV4",
      DocSourceId: string,
      SourceDocDate?: string | null,
      ecli: string,
      instance?: string | null,
      instance_li?: string | null,
      extracted_from?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type QueryDocSourceIdQueryVariables = {
  DocSourceId?: string | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelCaselawV5FilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type QueryDocSourceIdQuery = {
  queryDocSourceId?:  {
    __typename: "ModelCaselawV5Connection",
    items?:  Array< {
      __typename: "CaselawV5",
      DocId: string,
      DocSourceId?: string | null,
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

export type QueryDocIdQueryVariables = {
  DocId?: string | null,
  SourceDocDate?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelCaselawV5FilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type QueryDocIdQuery = {
  queryDocId?:  {
    __typename: "ModelCaselawV5Connection",
    items?:  Array< {
      __typename: "CaselawV5",
      DocId: string,
      DocSourceId?: string | null,
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

export type QueryInstanceQueryVariables = {
  instance?: string | null,
  SourceDocDate?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelCaselawV5FilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type QueryInstanceQuery = {
  queryInstance?:  {
    __typename: "ModelCaselawV5Connection",
    items?:  Array< {
      __typename: "CaselawV5",
      DocId: string,
      DocSourceId?: string | null,
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

export type QueryInstanceLiQueryVariables = {
  instance_li?: string | null,
  SourceDocDate?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelCaselawV5FilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type QueryInstanceLiQuery = {
  queryInstanceLi?:  {
    __typename: "ModelCaselawV5Connection",
    items?:  Array< {
      __typename: "CaselawV5",
      DocId: string,
      DocSourceId?: string | null,
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

export type SearchCaselawV4sQueryVariables = {
  filter?: SearchableCaselawV4FilterInput | null,
  sort?: SearchableCaselawV4SortInput | null,
  limit?: number | null,
  nextToken?: string | null,
  from?: number | null,
};

export type SearchCaselawV4sQuery = {
  searchCaselawV4s?:  {
    __typename: "SearchableCaselawV4Connection",
    items?:  Array< {
      __typename: "CaselawV4",
      DocSourceId: string,
      SourceDocDate?: string | null,
      ecli: string,
      instance?: string | null,
      instance_li?: string | null,
      extracted_from?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
    total?: number | null,
  } | null,
};

export type SearchCaselawV5sQueryVariables = {
  filter?: SearchableCaselawV5FilterInput | null,
  sort?: SearchableCaselawV5SortInput | null,
  limit?: number | null,
  nextToken?: string | null,
  from?: number | null,
};

export type SearchCaselawV5sQuery = {
  searchCaselawV5s?:  {
    __typename: "SearchableCaselawV5Connection",
    items?:  Array< {
      __typename: "CaselawV5",
      DocId: string,
      DocSourceId?: string | null,
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

export type OnCreateCaselawV4Subscription = {
  onCreateCaselawV4?:  {
    __typename: "CaselawV4",
    DocSourceId: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    extracted_from?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateCaselawV4Subscription = {
  onUpdateCaselawV4?:  {
    __typename: "CaselawV4",
    DocSourceId: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    extracted_from?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteCaselawV4Subscription = {
  onDeleteCaselawV4?:  {
    __typename: "CaselawV4",
    DocSourceId: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    extracted_from?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateCaselawV5Subscription = {
  onCreateCaselawV5?:  {
    __typename: "CaselawV5",
    DocId: string,
    DocSourceId?: string | null,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateCaselawV5Subscription = {
  onUpdateCaselawV5?:  {
    __typename: "CaselawV5",
    DocId: string,
    DocSourceId?: string | null,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteCaselawV5Subscription = {
  onDeleteCaselawV5?:  {
    __typename: "CaselawV5",
    DocId: string,
    DocSourceId?: string | null,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
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
