import React from 'react';
import GraphEditor from "./components/CaseLawExplorer";
import Amplify  from "aws-amplify";
import { Button }  from "@material-ui/core";
import { withAuthenticator  } from '@aws-amplify/ui-react';
import * as API from './components/CaseLawExplorer/API';
// import awsconfig from './src/aws-exports';

Amplify.configure({
  "aws_project_region": "eu-central-1",
  "aws_appsync_graphqlEndpoint": "https://culpdi4smbeqtjyiqaqxusuv3q.appsync-api.eu-central-1.amazonaws.com/graphql",
  "aws_appsync_region": "eu-central-1",
  "aws_appsync_authenticationType": "API_KEY",
  "aws_appsync_apiKey": "da2-l7smc55gkvgbdftblcbfra4d5y"
});


// runQuery()
const runQuery = async ()=> {
  const result = await API.testAuth({
    "id": "ECLI:NL:HR:2012:BV5128"
  })
  console.log('API RESULT: ', result)
}

const App = () => {
  return (
    <div>
      {/* <AmplifySignOut /> */}
      <Button
        // variant="contained"
        onClick={runQuery}
      >Test the API</Button>
      <GraphEditor />
    </div>
  )
 }

export default withAuthenticator(App, {
  federated: {
    googleClientId: '678991149519-fhmj5s0vl3tt1ic9elps5l47s4fdtcb3.apps.googleusercontent.com',
  }
});