import React from  'react'
import {
    Button,
  Typography,
} from '@mui/material'
import{ View } from 'colay-ui'
import{ Auth } from 'aws-amplify'
import{ Illustration } from './Illustration'

export const Signin = () => {
  return (
    <View
      style={{
        backgroundColor: '#f9f9f9',
        alignItems: 'center'
      }}
    >
       <Typography
         variant="h6"
         style={{
          marginBottom: 30,
          marginTop: 30,
         }}
       >
          Working with Graphs made easy
       </Typography>
       <View
        style={{
          alignItems: 'center',
          width: '100%',
          marginBottom: 35
        }}
       >
        <View style={{ width: '25vw', flexDirection: 'row', justifyContent: 'space-around' }}>
          <Button variant="contained" onClick={() => Auth.federatedSignIn()}>Signin</Button>
          <Button variant="contained" onClick={() => Auth.federatedSignIn()}>Signup</Button>
          </View>
       </View>
       <Illustration/>
    </View>
  )
}