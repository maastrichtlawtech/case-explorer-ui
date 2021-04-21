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
export const getCaselawV5 = /* GraphQL */ `
  query GetCaselawV5($ecli: String!, $DocId: String!) {
    getCaselawV5(ecli: $ecli, DocId: $DocId) {
      DocId
      DocSourceId
      SourceDocDate
      ecli
      instance
      instance_li
      createdAt
      updatedAt
    }
  }
`;
export const listCaselawV5s = /* GraphQL */ `
  query ListCaselawV5s(
    $ecli: String
    $DocId: ModelStringKeyConditionInput
    $filter: ModelCaselawV5FilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listCaselawV5s(
      ecli: $ecli
      DocId: $DocId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        DocId
        DocSourceId
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
export const byDocSourceId = /* GraphQL */ `
  query ByDocSourceId(
    $DocSourceId: String
    $extracted_from: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCaselawV4FilterInput
    $limit: Int
    $nextToken: String
  ) {
    ByDocSourceId(
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
export const byInstance = /* GraphQL */ `
  query ByInstance(
    $instance: String
    $SourceDocDate: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCaselawV4FilterInput
    $limit: Int
    $nextToken: String
  ) {
    ByInstance(
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
export const byInstanceLi = /* GraphQL */ `
  query ByInstanceLi(
    $instance_li: String
    $SourceDocDate: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCaselawV4FilterInput
    $limit: Int
    $nextToken: String
  ) {
    ByInstanceLi(
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
export const queryDocSourceId = /* GraphQL */ `
  query QueryDocSourceId(
    $DocSourceId: String
    $sortDirection: ModelSortDirection
    $filter: ModelCaselawV5FilterInput
    $limit: Int
    $nextToken: String
  ) {
    queryDocSourceId(
      DocSourceId: $DocSourceId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        DocId
        DocSourceId
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
export const queryDocId = /* GraphQL */ `
  query QueryDocId(
    $DocId: String
    $SourceDocDate: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCaselawV5FilterInput
    $limit: Int
    $nextToken: String
  ) {
    queryDocId(
      DocId: $DocId
      SourceDocDate: $SourceDocDate
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        DocId
        DocSourceId
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
export const queryInstance = /* GraphQL */ `
  query QueryInstance(
    $instance: String
    $SourceDocDate: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCaselawV5FilterInput
    $limit: Int
    $nextToken: String
  ) {
    queryInstance(
      instance: $instance
      SourceDocDate: $SourceDocDate
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        DocId
        DocSourceId
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
export const queryInstanceLi = /* GraphQL */ `
  query QueryInstanceLi(
    $instance_li: String
    $SourceDocDate: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCaselawV5FilterInput
    $limit: Int
    $nextToken: String
  ) {
    queryInstanceLi(
      instance_li: $instance_li
      SourceDocDate: $SourceDocDate
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        DocId
        DocSourceId
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
export const searchCaselawV5s = /* GraphQL */ `
  query SearchCaselawV5s(
    $filter: SearchableCaselawV5FilterInput
    $sort: SearchableCaselawV5SortInput
    $limit: Int
    $nextToken: String
    $from: Int
  ) {
    searchCaselawV5s(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
      from: $from
    ) {
      items {
        DocId
        DocSourceId
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
