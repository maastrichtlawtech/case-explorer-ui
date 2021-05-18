import React from 'react';
import GraphEditor from "./components/CaseLawExplorer";
import Amplify  from "aws-amplify";
import { Button }  from "@material-ui/core";
import { withAuthenticator } from '@aws-amplify/ui-react';
import * as API from './components/CaseLawExplorer/API';
import awsconfig from './src/aws-exports';

Amplify.configure(awsconfig);


// runQuery()
const runQuery = async ()=> {
  const result = await API.testAuth({
    "id": "ECLI:NL:HR:2012:BV5128"
  })
  console.log('API RESULT: ', result)
}

const App = () => {
  // React.useEffect(() => {
  //   const runQuery = async ()=> {
  //     const result = await API.complexQuery({
    
  //     })
  //     console.log('API RESULT: ', result)
  //   }
  //   runQuery()
  // }, [])
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

export default App//withAuthenticator(App);