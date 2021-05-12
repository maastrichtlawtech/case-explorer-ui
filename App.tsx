import React from 'react';
import GraphEditor from "./components/CaseLawExplorer";
import Amplify, { Auth }  from "aws-amplify";
import { withAuthenticator } from '@aws-amplify/ui-react';
import * as API from './components/CaseLawExplorer/API';
import awsconfig from './src/aws-exports';


Amplify.configure(awsconfig);

const runQuery = async ()=> {
  const result = await API.getElementData({
    "id": "ECLI:NL:HR:2012:BV5128"
  })
  console.log('API RESULT: ', result)
}

// runQuery()

const App = () => {
  
  return (
    <div>
      {/* <AmplifySignOut /> */}
      <GraphEditor />
    </div>
  )
 }

export default App//withAuthenticator(App);