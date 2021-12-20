import Amplify, { API, Auth } from "aws-amplify";
import { 
  queryNetworkByUserInput, 
  fetchNodeData, 
  batchFetchNodeData,
  computeSubnetwork,
  computeNetworkStatistics, 
  test 
} from "../../src/graphql/queries";
import { 
  QueryNetworkByUserInputQueryVariables, 
  FetchNodeDataQueryVariables, 
  BatchFetchNodeDataQueryVariables,
  ComputeSubnetworkQueryVariables,
  ComputeNetworkStatisticsQueryVariables, 
  TestQueryVariables 
} from '../../src/API';
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';
import gql from 'graphql-tag';
import { AWS_CONFIG } from './config';
import { 
  AsyncStorage
} from 'react-native'

Amplify.configure(AWS_CONFIG);

const graphqlClient = new AWSAppSyncClient({
  url: AWS_CONFIG.aws_appsync_graphqlEndpoint,
  region: AWS_CONFIG.aws_appsync_region,
  auth: {
    type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
    jwtToken: async () => (await Auth.currentSession()).getIdToken().getJwtToken(),
  },
  offlineConfig: {
    storage: {
      setItem: async () => {},
      getItem: async () => {}
    }
  },
});

const convertJSONStringFields = (item) => {
  return {
    ...item,
    ...(item.position ? { position: JSON.parse(item.position) } : {}),
    data: JSON.parse(item.data)
  }
}

export async function listCases(variables: QueryNetworkByUserInputQueryVariables) {
  try {
    const listCasesResult = await API.graphql({
      query: gql(queryNetworkByUserInput),
      variables
    })
    const caseResults = listCasesResult.data.queryNetworkByUserInput
    return {
      nodes: caseResults.nodes.map(convertJSONStringFields),
      edges: caseResults.edges.map(convertJSONStringFields),
      message: caseResults.message,
    }

    // return caseResults.map(project => ({
    //   // ...project,
    //   nodes: project.nodes.items.map(convertJSONStringFields),
    //   // edges: project.edges.items.map(convertJSONStringFields),
    // }))
  } catch (err) {
    console.log('error creating node:', err)
  }
}

export async function getElementData(variables: FetchNodeDataQueryVariables) {
  try {
    const elementDataResult = await API.graphql({
      query: gql(fetchNodeData),
      variables
    })
    const result = elementDataResult.data.fetchNodeData.data
    return result ? JSON.parse(result) : {}
    // return caseResults.map(project => ({
    //   // ...project,
    //   nodes: project.nodes.items.map(convertJSONStringFields),
    //   // edges: project.edges.items.map(convertJSONStringFields),
    // }))
  } catch (err) {
    console.log('error getElementData node:', err)
  }
}

export async function batchGetElementData(variables: BatchFetchNodeDataQueryVariables) {
  try {
    const batchElementDataResult = await API.graphql({
      query: gql(batchFetchNodeData),
      variables,
    })
    const result = batchElementDataResult.data.batchFetchNodeData
    return result.map(convertJSONStringFields)
  } catch (err) {
    console.log('error batchGetElementData:', err)
  }
}

export async function getSubnetwork(variables: ComputeSubnetworkQueryVariables) {
  try {
    const subnetworkResult = await API.graphql({
      query: gql(computeSubnetwork),
      variables
    })
    const result = subnetworkResult.data.computeSubnetwork
    return {
      nodes: result.nodes.map(convertJSONStringFields),
      edges: result.edges.map(convertJSONStringFields),
    }
  } catch (err) {
    console.log('error getSubnetwork:', err)
  }
}

export async function getNetworkStatistics(variables: ComputeNetworkStatisticsQueryVariables) {
  try {
    const networkStatisticsResult = await API.graphql({
      query: gql(computeNetworkStatistics),
      variables
    })
    const result = networkStatisticsResult.data.computeNetworkStatistics
    return JSON.parse(result)
  } catch (err) {
    console.log('error getNetworkStatistics:', err)
  }
}

export async function testAuth(variables: TestQueryVariables) {
  try {
    const elementDataResult = await API.graphql({
      query: gql(test),
      variables
    })
    const result = elementDataResult.data.test.data
    return result ? JSON.parse(result) : {}
  } catch (err) {
    console.log('error testAuth:', err)
  }
}