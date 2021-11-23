/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const queryNetworkByUserInput = /* GraphQL */ `
  query QueryNetworkByUserInput(
    $DataSources: [DataSource!]!
    $Keywords: String
    $Articles: String
    $Eclis: String
    $DegreesSources: Int!
    $DegreesTargets: Int!
    $DateStart: AWSDate!
    $DateEnd: AWSDate!
    $Instances: [String]
    $Domains: [String]
    $Doctypes: [DocType!]!
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
      allNodes {
        id
        data
      }
      allEdges {
        id
        source
        target
        data
      }
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
      message
    }
  }
`;
export const computeNetworkStatistics = /* GraphQL */ `
  query ComputeNetworkStatistics(
    $nodes: [NodeInput!]!
    $edges: [EdgeInput!]!
    $subNodes: [NodeInput!]!
  ) {
    computeNetworkStatistics(nodes: $nodes, edges: $edges, subNodes: $subNodes)
  }
`;
export const fetchNodeData = /* GraphQL */ `
  query FetchNodeData($attributesToFetch: NodeAttributes, $node: NodeInput!) {
    fetchNodeData(attributesToFetch: $attributesToFetch, node: $node) {
      id
      data
    }
  }
`;
export const batchFetchNodeData = /* GraphQL */ `
  query BatchFetchNodeData(
    $attributesToFetch: NodeAttributes
    $nodes: [NodeInput!]!
  ) {
    batchFetchNodeData(attributesToFetch: $attributesToFetch, nodes: $nodes) {
      id
      data
    }
  }
`;
export const test = /* GraphQL */ `
  query Test($Ecli: String) {
    test(Ecli: $Ecli) {
      id
      data
    }
  }
`;
export const getCaselaw = /* GraphQL */ `
  query GetCaselaw($ecli: String!, $ItemType: String!) {
    getCaselaw(ecli: $ecli, ItemType: $ItemType) {
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
export const listCaselaws = /* GraphQL */ `
  query ListCaselaws(
    $ecli: String
    $ItemType: ModelStringKeyConditionInput
    $filter: ModelCaselawFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listCaselaws(
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
    $filter: ModelCaselawFilterInput
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
    $filter: ModelCaselawFilterInput
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
    $filter: ModelCaselawFilterInput
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
