import Amplify, { API } from "aws-amplify";
import { queryNetworkByUserInput, fetchNodeData, test } from "../../src/graphql/queries";
import { QueryNetworkByUserInputQueryVariables, FetchNodeDataQueryVariables, TestQueryVariables } from '../../src/API';
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
      nodes: caseResults.nodes.map(convertJSONStringFields),
      edges: caseResults.edges.map(convertJSONStringFields),
      networkStatistics: JSON.parse(caseResults.statistics),
      message: caseResults.message,
      // edges: project.edges.items.map(convertJSONStringFields),
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