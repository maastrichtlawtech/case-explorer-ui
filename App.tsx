import { AuthState, onAuthUIStateChange,  } from '@aws-amplify/ui-components';
import { CognitoUser } from '@aws-amplify/auth';
import { Button, CircularProgress } from "@mui/material";
import Amplify, { Auth,  Hub,  }  from "aws-amplify";
import React from 'react';
// @ts-ignore
import cytoscape from 'cytoscape'
// @ts-ignore
import euler from 'cytoscape-euler'
// @ts-ignore
import cola from 'cytoscape-cola'
// @ts-ignore
import dagre from 'cytoscape-dagre'
// @ts-ignore
import spread from 'cytoscape-spread'
import GraphEditor, {
  ACTIONS
} from "./components/CaseLawExplorer";
import * as API from './components/CaseLawExplorer/API';
import {TermsOfService} from './components/CaseLawExplorer/components/TermsOfService';
import * as R from 'colay/ramda';
import {useMeasure, View} from 'colay-ui';
import {useImmer,} from 'colay-ui/hooks/useImmer';
import { Signin   }from './components/CaseLawExplorer/Signin'

spread(cytoscape)
cytoscape.use(dagre)
cytoscape.use(euler)
cytoscape.use(cola)

export interface UserAttributes {
    sub : string;
    email : string;
    email_verified : boolean;
    'custom:isOldUser' : "yes" | null;
}

// 2022-11-10
// The aws-auth library is exporting incorrect type signatures for CognitoUser
// (missing an attributes member), leading to type errors. Manually extend it
// here and use the extended type to eliminate the errors until aws-auth is
// fixed.
interface CognitoUserExt extends CognitoUser {
    attributes: UserAttributes;
}

function getUser() : Promise<CognitoUserExt> {
  return Auth.currentAuthenticatedUser()
    .catch(() => console.log('Not signed in'));
}

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

const AppContainer = () => {
  const [authState, setAuthState] = React.useState();
  const [state, setState] = React.useState({
    user: null as CognitoUserExt | null,
    isLoading: true
  })
  const [termsOfServiceUser, setTermsOfServiceUser] = React.useState(null)

  React.useEffect(() => {
    Hub.listen('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signIn':
        case 'cognitoHostedUI':{
          getUser().then(userData => {
            setState({
              ...state,
              isLoading: false,
              user: userData,
            })
          console.log('signIn', userData)
          });
          break;
        }

        case 'signOut':
          setState({
            ...state,
            isLoading: false,
            user: null
          })
          break;
        case 'signIn_failure':
        case 'cognitoHostedUI_failure':
          console.log('Sign in failure', data);
          break;
      }
    });

    getUser().then(userData => setState({
      ...state,
      isLoading: false,
      user: userData,
    }));
  }, []);
  if (state.isLoading) {
    return (
      <View
        style={{
          width:'100%',
          height:'100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </View>
    )
  }
  return  <>
  {
    state.user ? (
        state.user.attributes['custom:isOldUser'] !== 'yes'
        ? (
          <TermsOfService
          user={state.user}
          onAgree={async () => {
            await Auth.updateUserAttributes(state.user, {
              'custom:isOldUser': 'yes'
            });
            // Due to being in an async, the type checker complains that user
            // might be null, despite the null check above. Using state.user!
            // to silence this warning.
            state.user!.attributes['custom:isOldUser'] = 'yes';
            setState({
              ...state,
              user: state.user
            })
          }}
          onDisagree={() => {
            alert('To proceed on signin, you need to accept the Terms of Usage!')
          }}
          />
        )
        : <App />
    ) : (
      <Signin
        onSignin={async () => {
          await Auth.federatedSignIn(
            // undefined,
            // {
            //   expires_at: new Date().getTime() + 1000 * 60 * 60 * 12 * 3 ,

            // }
          //   {
          //   customProvider: 'COGNITO_IDENTITY_POOLS',
          //   provider: 'COGNITO',
          // }
          )
          setState({
            ...state,
            isLoading: true
          })
        }}
        onSignup={() => {
          Auth.federatedSignIn()
          setState({
            ...state,
            isLoading: true
          })
        }}
      />
      // <TermsOfService
          // user={user}
          // onAgree={async () => {
          //   updateState((draft) => {
          //     draft.helpModal.isOpen = true
          //   })
          //   await Auth.updateUserAttributes(user, {
          //     'custom:isOldUser': 'yes'
          //   })
          // }}
          // onDisagree={() => {
          //   alert('To proceed on signin, you need to accept the Terms of Usage!')
          // }}
      //   />
  )
  }

  </>
}

export default AppContainer
