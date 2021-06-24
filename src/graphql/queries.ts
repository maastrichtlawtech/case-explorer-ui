/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const queryNetworkByUserInput = /* GraphQL */ `
  query QueryNetworkByUserInput(
    $DataSources: [String]
    $Keywords: String
    $Articles: String
    $Eclis: String
    $DegreesSources: Int
    $DegreesTargets: Int
    $DateStart: AWSDate
    $DateEnd: AWSDate
    $Instances: [String]
    $Domains: [String]
    $Doctypes: [String]
  ) {
    queryNetworkByUserInput(
      DataSources: $DataSources
      Keywords: $Keywords
      Articles: $Articles
      Eclis: $Eclis
      DegreesSources: $DegreesSources
      DegreesTargets: $DegreesTargets
      DateStart: $DateStart
      DateEnd: $DateEnd
      Instances: $Instances
      Domains: $Domains
      Doctypes: $Doctypes
    ) {
      nodes {
        id
        data
      }
      edges {
        id
        source
        target
        data
      }
      statistics
      message
    }
  }
`;
export const fetchNodeData = /* GraphQL */ `
  query FetchNodeData($Ecli: String) {
    fetchNodeData(Ecli: $Ecli) {
      id
      data
    }
  }
`;
export const testAuth = /* GraphQL */ `
  query TestAuth($Ecli: String) {
    testAuth(Ecli: $Ecli) {
      id
      data
    }
  }
`;
export const getCaselawV6 = /* GraphQL */ `
  query GetCaselawV6($ecli: String!, $ItemType: String!) {
    getCaselawV6(ecli: $ecli, ItemType: $ItemType) {
      ItemType
      SourceDocDate
      ecli
      instance
      instance_li
      createdAt
      updatedAt
    }
  }
`;
export const listCaselawV6s = /* GraphQL */ `
  query ListCaselawV6s(
    $ecli: String
    $ItemType: ModelStringKeyConditionInput
    $filter: ModelCaselawV6FilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listCaselawV6s(
      ecli: $ecli
      ItemType: $ItemType
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        ItemType
        SourceDocDate
        ecli
        instance
        instance_li
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const queryByItemType = /* GraphQL */ `
  query QueryByItemType(
    $ItemType: String
    $SourceDocDate: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCaselawV6FilterInput
    $limit: Int
    $nextToken: String
  ) {
    queryByItemType(
      ItemType: $ItemType
      SourceDocDate: $SourceDocDate
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        ItemType
        SourceDocDate
        ecli
        instance
        instance_li
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const queryByInstance = /* GraphQL */ `
  query QueryByInstance(
    $instance: String
    $SourceDocDate: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCaselawV6FilterInput
    $limit: Int
    $nextToken: String
  ) {
    queryByInstance(
      instance: $instance
      SourceDocDate: $SourceDocDate
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        ItemType
        SourceDocDate
        ecli
        instance
        instance_li
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const queryByInstanceLi = /* GraphQL */ `
  query QueryByInstanceLi(
    $instance_li: String
    $SourceDocDate: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCaselawV6FilterInput
    $limit: Int
    $nextToken: String
  ) {
    queryByInstanceLi(
      instance_li: $instance_li
      SourceDocDate: $SourceDocDate
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        ItemType
        SourceDocDate
        ecli
        instance
        instance_li
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const searchCaselawV6s = /* GraphQL */ `
  query SearchCaselawV6s(
    $filter: SearchableCaselawV6FilterInput
    $sort: SearchableCaselawV6SortInput
    $limit: Int
    $nextToken: String
    $from: Int
  ) {
    searchCaselawV6s(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
      from: $from
    ) {
      items {
        ItemType
        SourceDocDate
        ecli
        instance
        instance_li
        createdAt
        updatedAt
      }
      nextToken
      total
    }
  }
`;
