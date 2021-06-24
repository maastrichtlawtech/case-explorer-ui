import Amplify, { API } from 'aws-amplify';
import { giveMeAllTheData } from './graphql/queries';
import awsExports from "./aws-exports";

const API_AUTH_MODE = {
    API_KEY: 'API_KEY'
  } as const

Amplify.configure(awsExports);

export async function getNetwork() {
    try {
      const listProjectResult = await API.graphql({
        query: giveMeAllTheData,
        variables: { 
          DataSources: ["TEST"],
          Keywords: [""],
          Articles: [""],
          Eclis: ["TEST:ECLI:001"],
          DegreesSources: 3,
          DegreesTargets: 3,
          DateStart: "1996-01-11",
          DateEnd: "2100-01-14",
          Instances: ["TEST_court001"],
          Domains: ["TEST_domain001"],
          Doctypes: ["OPI", "DEC"],
          LiPermission: false 
        },
      })
      console.log(listProjectResult);
      const projectResults = listProjectResult.data.giveMeAllTheData
      return projectResults
    } catch (err) { console.log('error listing project', err) }
  }
  
  getNetwork()