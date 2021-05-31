import React from 'react';
import GraphEditor, { 
  ACTIONS
} from "./components/CaseLawExplorer";
import Amplify  from "aws-amplify";
import { Button, CircularProgress }  from "@material-ui/core";
import { withAuthenticator, AmplifyAuthenticator, AmplifySignIn,
    } from '@aws-amplify/ui-react';
  import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components'
import * as API from './components/CaseLawExplorer/API';
// import awsconfig from './src/aws-exports';
import { Auth } from 'aws-amplify';

const awsconfig = {
  "aws_project_region": "eu-central-1",
  "aws_appsync_graphqlEndpoint": "https://culpdi4smbeqtjyiqaqxusuv3q.appsync-api.eu-central-1.amazonaws.com/graphql",
  "aws_appsync_region": "eu-central-1",
  "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS",
  "aws_appsync_apiKey": "da2-l7smc55gkvgbdftblcbfra4d5y",
  "aws_cognito_identity_pool_id": "eu-central-1:d0d334ac-2447-4b56-9467-24eb22b28144",
  "aws_cognito_region": "eu-central-1",
  "aws_user_pools_id": "eu-central-1_czNZx5VZq",
  "aws_user_pools_web_client_id": "1im211cm81rp1sqinrlfq06bp8",
  "oauth": {
      "domain": "caseexplorerui357be15f-357be15f-dev.auth.eu-central-1.amazoncognito.com",
      "scope": [
          "phone",
          "email",
          "openid",
          "profile",
          "aws.cognito.signin.user.admin"
      ],
      "redirectSignIn": "http://localhost:19006/",
      "redirectSignOut": "http://localhost:19006/",
      "responseType": "code"
  },
  "federationTarget": "COGNITO_USER_AND_IDENTITY_POOLS"
}

Amplify.configure(awsconfig);

const runQuery = async ()=> {
  const result = await API.testAuth({
    "id": "ECLI:NL:HR:2012:BV5128"
  })
  console.log('API RESULT: ', result)
}

const App = () => {
  const dispatch = React.useCallback((action) => {
    switch (action.type) {
      case ACTIONS.TEST_API:
        runQuery()
        break;
    
      default:
        break;
    }
  }, [])
  return (
    <div>
      <GraphEditor
        dispatch={dispatch}
      />
    </div>
  )
}

// const AppWithAuth = () => {
//   const [authState, setAuthState] = React.useState();
//   const [user, setUser] = React.useState();

//     React.useEffect(() => {
//         return onAuthUIStateChange((nextAuthState, authData) => {
//             setAuthState(nextAuthState);
//             setUser(authData)
//         });
//     }, []);

//   return authState === AuthState.SignedIn && user ? (
//       <App />
//     ) : (
//       <AmplifyAuthenticator>
//         <AmplifySignIn
//           // headerText="My Custom Sign In Text"
//           slot="sign-in"
//         ></AmplifySignIn>
//       </AmplifyAuthenticator>
//   );
// }
const AppWithAuth = withAuthenticator(App);

// const AppContainer = () => {
//   React.useEffect(() => {
//     const index = detectBrowser() === 'Firefox' ? 1 : 0
//     setTimeout(()=>{
//       const call = async ()=> {
//         try {
//           const authUser = await Auth.currentAuthenticatedUser()
//           console.log('auth', authUser)
//         } catch (error) {
//           console.log( 'er', error)  
//           try {
//             const el1 = document.getElementsByTagName('amplify-authenticator')[0]
//             .shadowRoot?.children
//             const el2 = [...el1].filter(el => el.tagName !== 'STYLE')[0].getElementsByTagName('amplify-sign-in')[0]
//             .shadowRoot?.children
//             const el3 = [...el2].filter(el => el.tagName !== 'STYLE')[0].getElementsByTagName('amplify-federated-buttons')[0]
//             .shadowRoot?.children
//             const el4 = [...el3].filter(el => el.tagName !== 'STYLE')[0].getElementsByTagName('amplify-oauth-button')[0]
//             .shadowRoot?.children
//             const button = [...el4].filter(el => el.tagName !== 'STYLE')[0].getElementsByTagName('button')[0]
//             button.click()
//             //   const button = document.getElementsByTagName('amplify-authenticator')[0]
//             // .shadowRoot?.lastChild.getElementsByTagName('amplify-sign-in')[0]
//             // .shadowRoot?.lastChild.getElementsByTagName('amplify-federated-buttons')[0]
//             // ?.shadowRoot//?.lastChild//.getElementsByTagName('amplify-oauth-button')[0]
//             // // .shadowRoot?.lastChild.getElementsByTagName('button')[0]
//             // // .click()
//           } catch (error) {
            
//           }
//         }
        
//       }
//       call()
//     }, 500 )
//   }, [])
//   return (
//     <AppContent />
//   )
// }

export default AppWithAuth


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
const MySignin = () => {
  return (
    <Button>Hee</Button>
  )
}
