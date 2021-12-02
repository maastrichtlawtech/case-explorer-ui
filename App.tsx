import { AuthState,onAuthUIStateChange, } from '@aws-amplify/ui-components';
import { AmplifyAuthenticator,  } from '@aws-amplify/ui-react';
import { Button } from "@mui/material";
import Amplify, { Auth,  Hub,  }  from "aws-amplify";
import React from 'react';
import cytoscape from 'cytoscape'
import euler from 'cytoscape-euler'
import cola from 'cytoscape-cola'
import dagre from 'cytoscape-dagre'
import spread from 'cytoscape-spread'
import GraphEditor, {
  ACTIONS
} from "./components/CaseLawExplorer";
import * as API from './components/CaseLawExplorer/API';
import {TermsOfService} from './components/CaseLawExplorer/components/TermsOfService';
import * as R from 'colay/ramda';
import {useMeasure, View} from 'colay-ui';
import { Signin  }from './components/CaseLawExplorer/Signin'
// import { TermsOfService } from './components/TermsOfService';

spread(cytoscape)
cytoscape.use(dagre)
cytoscape.use(euler)
cytoscape.use(cola)

const AWS_PROD_CONFIG = {
  "aws_project_region": "eu-central-1",
  "aws_appsync_graphqlEndpoint": "https://mqnkmzj5ezd7vcdqxjp5lzdjj4.appsync-api.eu-central-1.amazonaws.com/graphql",
  "aws_appsync_region": "eu-central-1",
  "aws_appsync_authenticationType": "API_KEY",
  "aws_appsync_apiKey": "da2-rafwqh2pjjfbnk5x7bwzxk6pgu",
  "aws_cognito_region": "eu-central-1",
  "aws_user_pools_id": "eu-central-1_Iia5Ube9G",
  "aws_user_pools_web_client_id": "529do26g6icslepgrvcelapu8v",
  "oauth": {
      "domain": "case-law-explorer-dev.auth.eu-central-1.amazoncognito.com",
      "scope": [
          "phone",
          "email",
          "openid",
          "profile",
          "aws.cognito.signin.user.admin"
      ],
      "redirectSignIn": "https://dev.d11iy22xsphp3a.amplifyapp.com/",
      "redirectSignOut": "https://dev.d11iy22xsphp3a.amplifyapp.com/",
      "responseType": "code"
  },
  "federationTarget": "COGNITO_USER_POOLS"
}

const AWS_DEV_CONFIG_OVERRIDE = {
  "oauth": {
      "redirectSignIn": "http://localhost:19006/",
      "redirectSignOut": "http://localhost:19006/",
  },
}

function getUser() {
  return Auth.currentAuthenticatedUser()
    .then(userData => userData)
    .catch(() => console.log('Not signed in'));
}
const AWS_CONFIG = __DEV__
  ? R.mergeDeepRight(AWS_PROD_CONFIG, AWS_DEV_CONFIG_OVERRIDE)
  : AWS_PROD_CONFIG

Amplify.configure(AWS_CONFIG);

const runQuery = async ()=> {
  const result = await API.testAuth({
    "ecli": "ECLI:NL:HR:2012:BV5128"
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
  const [containerRef, { width, height, initialized }] = useMeasure()
  return (
    <View 
      ref={containerRef}
      style={{
        width: '100%', height: '100%'
      }}
    >
      {
        initialized && (
          <GraphEditor
            dispatch={dispatch}
            {...{width, height}}
          />
        )
      }
    </View>
  )
}

const AppWithAuth = () => {
  const [authState, setAuthState] = React.useState();
  const [user, setUser] = React.useState({});
  // const [authState, setAuthState] = React.useState(AuthState.SignedIn);
  // const [user, setUser] = React.useState({});
  const [termsOfServiceUser, setTermsOfServiceUser] = React.useState(null)

  React.useEffect(() => {
    Hub.listen('auth', ({ payload: { event, data } }) => {
      console.log(event, data)
      switch (event) {
        case 'signIn':
        case 'cognitoHostedUI':
          getUser().then(userData => setUser(userData));
          break;
        case 'signOut':
          setUser(null);
          break;
        case 'signIn_failure':
        case 'cognitoHostedUI_failure':
          console.log('Sign in failure', data);
          break;
      }
    });

    // getUser().then(userData => setUser(userData));
  }, []);
    // React.useEffect(() => {
    //   return onAuthUIStateChange((nextAuthState, authData) => {
    //         setAuthState(nextAuthState);
    //         setUser(authData)
    //     });
    // }, []);
    //authState === AuthState.SignedIn && 
    console.log('USER: ', user)
  return  <>
  {
    user ? (
      <App />
    ) : (
      <Signin/>
        // <AmplifyAuthenticator />
        // <Button
        //   onClick={() => Auth.federatedSignIn()}
        // >Signin</Button>
      // <AmplifyAuthenticator>
      //   <AmplifySignIn
      //     // headerText="My Custom Sign In Text"
      //     slot="sign-in"
      //   ></AmplifySignIn>
      // </AmplifyAuthenticator>
  )
  }
  {
    authState === AuthState.SignUp && (
      <TermsOfService 
        user={termsOfServiceUser}
        onAgree={() => setTermsOfServiceUser({
          attributes: {
            'custom:isOldUser': 'yes'
          }
        })}
      />
  )
  }
  </>
}
// const AppWithAuth = withAuthenticator(App);

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

export default AppWithAuth // App


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
