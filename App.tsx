import React from 'react';
import GraphEditor from "./components/CaseLawExplorer";
import Amplify, { Auth }  from "aws-amplify";
import { withAuthenticator } from '@aws-amplify/ui-react';
import * as API from './components/CaseLawExplorer/API';
import awsconfig from './src/aws-exports';


Amplify.configure(awsconfig);


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