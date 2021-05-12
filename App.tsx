import React from 'react';
import GraphEditor from "./components/CaseLawExplorer";
import Amplify  from "aws-amplify";
import { withAuthenticator } from '@aws-amplify/ui-react';
import * as API from './components/CaseLawExplorer/API';


Amplify.configure({
  "aws_project_region": "eu-central-1",
  "aws_appsync_graphqlEndpoint": "https://culpdi4smbeqtjyiqaqxusuv3q.appsync-api.eu-central-1.amazonaws.com/graphql",
  "aws_appsync_region": "eu-central-1",
  "aws_appsync_authenticationType": "API_KEY",
  "aws_appsync_apiKey": "da2-l7smc55gkvgbdftblcbfra4d5y"
});



// runQuery()

const App = () => {
  React.useEffect(() => {
    const runQuery = async ()=> {
      const result = await API.complexQuery({
    
      })
      console.log('API RESULT: ', result)
    }
    runQuery()
  }, [])
  return (
    <div>
      {/* <AmplifySignOut /> */}
      <GraphEditor />
    </div>
  )
 }

export default App//withAuthenticator(App);