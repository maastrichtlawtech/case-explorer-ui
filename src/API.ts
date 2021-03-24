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

export type QueryByDocSourceIdQueryVariables = {
  DocSourceId?: string | null,
  extracted_from?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelCaselawV4FilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type QueryByDocSourceIdQuery = {
  queryByDocSourceId?:  {
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

export type QueryByInstanceQueryVariables = {
  instance?: string | null,
  SourceDocDate?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelCaselawV4FilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type QueryByInstanceQuery = {
  queryByInstance?:  {
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

export type QueryByInstanceLiQueryVariables = {
  instance_li?: string | null,
  SourceDocDate?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelCaselawV4FilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type QueryByInstanceLiQuery = {
  queryByInstanceLi?:  {
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
