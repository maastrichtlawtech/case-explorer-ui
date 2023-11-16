import React from 'react'
import {Button, Typography} from '@mui/material'
import {View} from 'colay-ui'
import {Lottie} from 'colay-ui/lab/Lottie'
import {Auth} from 'aws-amplify'
import {Illustration} from './Illustration'

export const Signin = ({onSignin, onSignup}) => {
  return (
    <View
      style={{
        alignItems: 'center',
        overflow: 'scroll',
        flex: 1
      }}
    >
      <Typography
        variant="h6"
        fontSize={36}
        fontWeight="extrabold"
        style={{
          marginBottom: -57,
          marginTop: 30
        }}
      >
        Case Law Explorer
      </Typography>
      <Lottie
        source={{
          uri: 'https://assets2.lottiefiles.com/packages/lf20_nkmkuqhm.json'
        }}
        style={{
          width: '100%',
          height: 550
        }}
        resizeMode="cover"
      />
      <View
        style={{
          alignItems: 'center',
          width: '100%',
          marginBottom: 35
        }}
      >
        <View style={{width: '25vw', flexDirection: 'row', justifyContent: 'space-around'}}>
          <Button variant="contained" onClick={onSignin}>
            Signin
          </Button>
          <Button variant="contained" onClick={onSignup}>
            Signup
          </Button>
        </View>
      </View>
      {/* <Illustration/> */}
    </View>
  )
}
