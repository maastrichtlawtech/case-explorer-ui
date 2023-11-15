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
    $attributesToFetch: NodeAttributes
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
      attributesToFetch: $attributesToFetch
    ) {
      nodes {
        id
        data
        __typename
      }
      edges {
        id
        source
        target
        data
        __typename
      }
      message
      __typename
    }
  }
`
export const computeSubnetwork = /* GraphQL */ `
  query ComputeSubnetwork($nodes: [NodeInput!]!, $edges: [EdgeInput!]!, $maxNodes: Int) {
    computeSubnetwork(nodes: $nodes, edges: $edges, maxNodes: $maxNodes) {
      nodes {
        id
        data
        __typename
      }
      edges {
        id
        source
        target
        data
        __typename
      }
      message
      __typename
    }
  }
`
export const computeNetworkStatistics = /* GraphQL */ `
  query ComputeNetworkStatistics($nodes: [NodeInput!]!, $edges: [EdgeInput!]!) {
    computeNetworkStatistics(nodes: $nodes, edges: $edges)
  }
`
export const fetchNodeData = /* GraphQL */ `
  query FetchNodeData($node: NodeInput!, $attributesToFetch: NodeAttributes) {
    fetchNodeData(node: $node, attributesToFetch: $attributesToFetch) {
      id
      data
      __typename
    }
  }
`
export const batchFetchNodeData = /* GraphQL */ `
  query BatchFetchNodeData($nodes: [NodeInput!]!, $attributesToFetch: NodeAttributes) {
    batchFetchNodeData(nodes: $nodes, attributesToFetch: $attributesToFetch) {
      id
      data
      __typename
    }
  }
`
export const calculateLayout = /* GraphQL */ `
  query CalculateLayout(
    $nodes: [NodeInput!]!
    $edges: [EdgeInput!]!
    $layoutName: String!
    $boundingBox: BoundingBoxInput
  ) {
    calculateLayout(nodes: $nodes, edges: $edges, layoutName: $layoutName, boundingBox: $boundingBox)
  }
`
export const test = /* GraphQL */ `
  query Test($ecli: String) {
    test(ecli: $ecli) {
      id
      data
      __typename
    }
  }
`
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
      __typename
    }
  }
`
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
        __typename
      }
      nextToken
      __typename
    }
  }
`
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
        __typename
      }
      nextToken
      __typename
    }
  }
`
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
        __typename
      }
      nextToken
      __typename
    }
  }
`
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
        __typename
      }
      nextToken
      __typename
    }
  }
`
