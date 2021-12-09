import Amplify, { API } from "aws-amplify";
import { 
  queryNetworkByUserInput, 
  fetchNodeData, 
  batchFetchNodeData,
  computeNetworkStatistics, 
  test 
} from "../../src/graphql/queries";
import { 
  QueryNetworkByUserInputQueryVariables, 
  FetchNodeDataQueryVariables, 
  BatchFetchNodeDataQueryVariables,
  ComputeNetworkStatisticsQueryVariables, 
  TestQueryVariables 
} from '../../src/API';
// import awsExports from "./aws-exports";

const API_AUTH_MODE = {
  API_KEY: 'API_KEY'
} as const

const convertJSONStringFields = (item) => {
  return {
    ...item,
    ...(item.position ? { position: JSON.parse(item.position) } : {}),
    data: JSON.parse(item.data)
  }
}

export async function listCases(variables: QueryNetworkByUserInputQueryVariables) {
  try {
    console.log(variables)
    const listCasesResult = await API.graphql({
      query: queryNetworkByUserInput,
      // authMode: API_AUTH_MODE.API_KEY,
      variables
    })

    const caseResults = listCasesResult.data.queryNetworkByUserInput
    console.log(caseResults)

    return {
      allNodes: caseResults.allNodes.map(convertJSONStringFields),
      allEdges: caseResults.allEdges.map(convertJSONStringFields),
      nodes: caseResults.nodes.map(convertJSONStringFields),
      edges: caseResults.edges.map(convertJSONStringFields),
      //networkStatistics: JSON.parse(caseResults.statistics),
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
      query: fetchNodeData,
      // authMode: API_AUTH_MODE.API_KEY,
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
    console.log('batchGetElementData',variables)
    const batchElementDataResult = await API.graphql({
      query: batchFetchNodeData,
      // authMode: API_AUTH_MODE.API_KEY,
      variables
    })
    const result = batchElementDataResult.data.batchFetchNodeData
    return result.map(convertJSONStringFields)
  } catch (err) {
    console.log('error batchGetElementData:', err)
  }
}

export async function getNetworkStatistics(variables: ComputeNetworkStatisticsQueryVariables) {
  try {
    const networkStatisticsResult = await API.graphql({
      query: computeNetworkStatistics,
      // authMode: API_AUTH_MODE.API_KEY,
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
      query: test,
      // authMode: API_AUTH_MODE.API_KEY,
      variables
    })
    const result = elementDataResult.data.test.data
    return result ? JSON.parse(result) : {}
  } catch (err) {
    console.log('error testAuth:', err)
  }
}