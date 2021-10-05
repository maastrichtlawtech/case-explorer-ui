/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateCaselawInput = {
  ItemType: string,
  SourceDocDate?: string | null,
  ecli: string,
  instance?: string | null,
  instance_li?: string | null,
};

export type ModelCaselawConditionInput = {
  SourceDocDate?: ModelStringInput | null,
  instance?: ModelStringInput | null,
  instance_li?: ModelStringInput | null,
  and?: Array< ModelCaselawConditionInput | null > | null,
  or?: Array< ModelCaselawConditionInput | null > | null,
  not?: ModelCaselawConditionInput | null,
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

export type Caselaw = {
  __typename: "Caselaw",
  ItemType: string,
  SourceDocDate?: string | null,
  ecli: string,
  instance?: string | null,
  instance_li?: string | null,
  createdAt: string,
  updatedAt: string,
};

export type UpdateCaselawInput = {
  ItemType: string,
  SourceDocDate?: string | null,
  ecli: string,
  instance?: string | null,
  instance_li?: string | null,
};

export type DeleteCaselawInput = {
  ecli: string,
  ItemType: string,
};

export type Network = {
  __typename: "Network",
  nodes?:  Array<Node | null > | null,
  edges?:  Array<Edge | null > | null,
  statistics?: string | null,
  message?: string | null,
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

export type ModelCaselawFilterInput = {
  ItemType?: ModelStringInput | null,
  SourceDocDate?: ModelStringInput | null,
  ecli?: ModelStringInput | null,
  instance?: ModelStringInput | null,
  instance_li?: ModelStringInput | null,
  and?: Array< ModelCaselawFilterInput | null > | null,
  or?: Array< ModelCaselawFilterInput | null > | null,
  not?: ModelCaselawFilterInput | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelCaselawConnection = {
  __typename: "ModelCaselawConnection",
  items?:  Array<Caselaw | null > | null,
  nextToken?: string | null,
};

export type CreateCaselawMutationVariables = {
  input: CreateCaselawInput,
  condition?: ModelCaselawConditionInput | null,
};

export type CreateCaselawMutation = {
  createCaselaw?:  {
    __typename: "Caselaw",
    ItemType: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateCaselawMutationVariables = {
  input: UpdateCaselawInput,
  condition?: ModelCaselawConditionInput | null,
};

export type UpdateCaselawMutation = {
  updateCaselaw?:  {
    __typename: "Caselaw",
    ItemType: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteCaselawMutationVariables = {
  input: DeleteCaselawInput,
  condition?: ModelCaselawConditionInput | null,
};

export type DeleteCaselawMutation = {
  deleteCaselaw?:  {
    __typename: "Caselaw",
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
};

export type QueryNetworkByUserInputQuery = {
  queryNetworkByUserInput?:  {
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
    statistics?: string | null,
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
  } | null,
};

export type GetCaselawQueryVariables = {
  ecli: string,
  ItemType: string,
};

export type GetCaselawQuery = {
  getCaselaw?:  {
    __typename: "Caselaw",
    ItemType: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListCaselawsQueryVariables = {
  ecli?: string | null,
  ItemType?: ModelStringKeyConditionInput | null,
  filter?: ModelCaselawFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListCaselawsQuery = {
  listCaselaws?:  {
    __typename: "ModelCaselawConnection",
    items?:  Array< {
      __typename: "Caselaw",
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
  filter?: ModelCaselawFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type QueryByItemTypeQuery = {
  queryByItemType?:  {
    __typename: "ModelCaselawConnection",
    items?:  Array< {
      __typename: "Caselaw",
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
  filter?: ModelCaselawFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type QueryByInstanceQuery = {
  queryByInstance?:  {
    __typename: "ModelCaselawConnection",
    items?:  Array< {
      __typename: "Caselaw",
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
  filter?: ModelCaselawFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type QueryByInstanceLiQuery = {
  queryByInstanceLi?:  {
    __typename: "ModelCaselawConnection",
    items?:  Array< {
      __typename: "Caselaw",
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

export type OnCreateCaselawSubscription = {
  onCreateCaselaw?:  {
    __typename: "Caselaw",
    ItemType: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateCaselawSubscription = {
  onUpdateCaselaw?:  {
    __typename: "Caselaw",
    ItemType: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteCaselawSubscription = {
  onDeleteCaselaw?:  {
    __typename: "Caselaw",
    ItemType: string,
    SourceDocDate?: string | null,
    ecli: string,
    instance?: string | null,
    instance_li?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};
