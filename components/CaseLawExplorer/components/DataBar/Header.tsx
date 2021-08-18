import { Button, Typography } from '@material-ui/core'
import { Auth } from 'aws-amplify'
import { View } from 'colay-ui'
import React from 'react'
import { useUser } from '../../useUser'



export const DataBarHeader = () => {
  const [user] = useUser()
  return (
    <View
      style={{ flexDirection: 'row', justifyContent: 'space-between' }}
    >
      <Typography>{user?.attributes?.email}</Typography>
      <Button
        color="secondary"
        onClick={() => Auth.signOut()}
      >
        Signout
      </Button>
    </View>
  )
}