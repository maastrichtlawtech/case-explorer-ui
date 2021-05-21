import React from 'react';
import GraphEditor from "./components/CaseLawExplorer";
import Amplify  from "aws-amplify";
import { Button }  from "@material-ui/core";
import { withAuthenticator  } from '@aws-amplify/ui-react';
import * as API from './components/CaseLawExplorer/API';
import awsconfig from './src/aws-exports';

Amplify.configure(awsconfig);

const runQuery = async ()=> {
  const result = await API.testAuth({
    "id": "ECLI:NL:HR:2012:BV5128"
  })
  console.log('API RESULT: ', result)
}

const App = () => {
  return (
    <div>
      <Button
        onClick={runQuery}
      >Test the API</Button>
      <GraphEditor />
    </div>
  )
}

const AppContent = withAuthenticator(App);

const AppContainer = () => {
  React.useEffect(() => {
    setTimeout(()=>{
      const button = document.getElementsByTagName('amplify-authenticator')[0]
    .shadowRoot?.children[0].getElementsByTagName('amplify-sign-in')[0]
    .shadowRoot?.children[0].getElementsByTagName('amplify-federated-buttons')[0]
    .shadowRoot?.children[0].getElementsByTagName('amplify-oauth-button')[0]
    .shadowRoot?.children[0].getElementsByTagName('button')[0]
    .click()
    }, 800 )
  }, [])
  return (
    <AppContent/>
  )
}

export default AppContainer