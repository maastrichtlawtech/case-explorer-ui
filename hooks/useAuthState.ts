import React from 'react'
import {AuthState, onAuthUIStateChange} from '@aws-amplify/ui-components'

export const useAuthState = () => {
  const [authState, setAuthState] = React.useState<AuthState>()
  const [user, setUser] = React.useState<object>()

  React.useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState)
      setUser(authData)
    })
  }, [])
  return [
    {
      authState,
      user
    }
  ]
}
