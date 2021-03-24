/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const giveMeAllTheData = /* GraphQL */ `
  query GiveMeAllTheData(
    $DataSources: [String]
    $Keywords: String
    $Articles: String
    $Eclis: String
    $DegreesSources: Int
    $DegreesTargets: Int
    $DateStart: String
    $DateEnd: String
    $Instances: [String]
    $Domains: [String]
    $Doctypes: [String]
    $LiPermission: Boolean
  ) {
    giveMeAllTheData(
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
      LiPermission: $LiPermission
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
    }
  }
`;
export const getCaselawV4 = /* GraphQL */ `
  query GetCaselawV4($ecli: String!, $DocSourceId: String!) {
    getCaselawV4(ecli: $ecli, DocSourceId: $DocSourceId) {
      DocSourceId
      SourceDocDate
      ecli
      instance
      instance_li
      extracted_from
      createdAt
      updatedAt
    }
  }
`;
export const listCaselawV4s = /* GraphQL */ `
  query ListCaselawV4s(
    $ecli: String
    $DocSourceId: ModelStringKeyConditionInput
    $filter: ModelCaselawV4FilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listCaselawV4s(
      ecli: $ecli
      DocSourceId: $DocSourceId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        DocSourceId
        SourceDocDate
        ecli
        instance
        instance_li
        extracted_from
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const queryByDocSourceId = /* GraphQL */ `
  query QueryByDocSourceId(
    $DocSourceId: String
    $extracted_from: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCaselawV4FilterInput
    $limit: Int
    $nextToken: String
  ) {
    queryByDocSourceId(
      DocSourceId: $DocSourceId
      extracted_from: $extracted_from
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        DocSourceId
        SourceDocDate
        ecli
        instance
        instance_li
        extracted_from
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
    $filter: ModelCaselawV4FilterInput
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
        DocSourceId
        SourceDocDate
        ecli
        instance
        instance_li
        extracted_from
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
    $filter: ModelCaselawV4FilterInput
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
        DocSourceId
        SourceDocDate
        ecli
        instance
        instance_li
        extracted_from
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const searchCaselawV4s = /* GraphQL */ `
  query SearchCaselawV4s(
    $filter: SearchableCaselawV4FilterInput
    $sort: SearchableCaselawV4SortInput
    $limit: Int
    $nextToken: String
    $from: Int
  ) {
    searchCaselawV4s(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
      from: $from
    ) {
      items {
        DocSourceId
        SourceDocDate
        ecli
        instance
        instance_li
        extracted_from
        createdAt
        updatedAt
      }
      nextToken
      total
    }
  }
`;
