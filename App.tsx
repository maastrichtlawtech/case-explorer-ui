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
    const index = detectBrowser() === 'Firefox' ? 1 : 0
    setTimeout(()=>{
      const el1 = document.getElementsByTagName('amplify-authenticator')[0]
    .shadowRoot?.children
    const el2 = [...el1].filter(el => el.tagName !== 'STYLE')[0].getElementsByTagName('amplify-sign-in')[0]
    .shadowRoot?.children
    const el3 = [...el2].filter(el => el.tagName !== 'STYLE')[0].getElementsByTagName('amplify-federated-buttons')[0]
    .shadowRoot?.children
    const el4 = [...el3].filter(el => el.tagName !== 'STYLE')[0].getElementsByTagName('amplify-oauth-button')[0]
    .shadowRoot?.children
    const button = [...el4].filter(el => el.tagName !== 'STYLE')[0].getElementsByTagName('button')[0]
    button.click()
    //   const button = document.getElementsByTagName('amplify-authenticator')[0]
    // .shadowRoot?.lastChild.getElementsByTagName('amplify-sign-in')[0]
    // .shadowRoot?.lastChild.getElementsByTagName('amplify-federated-buttons')[0]
    // ?.shadowRoot//?.lastChild//.getElementsByTagName('amplify-oauth-button')[0]
    // // .shadowRoot?.lastChild.getElementsByTagName('button')[0]
    // // .click()
    }, 400 )
  }, [])
  return (
    <AppContent/>
  )
}

export default AppContainer

function detectBrowser() { 
  if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 ) {
      return 'Opera';
  } else if(navigator.userAgent.indexOf("Chrome") != -1 ) {
      return 'Chrome';
  } else if(navigator.userAgent.indexOf("Safari") != -1) {
      return 'Safari';
  } else if(navigator.userAgent.indexOf("Firefox") != -1 ){
      return 'Firefox';
  } else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) {
      return 'IE';//crap
  } else {
      return 'Unknown';
  }
} 