import React from 'react'
import { 
  View
} from 'colay-ui'
import {
  Button
} from '@mui/material'

type P = {
  type: string;
  payload?: any
}

type ActionBarRightProps = {
  dispatch: (e: P) => void
}

export const ActionBarRight = (props: ActionBarRightProps) => {
  const {
    dispatch
  } = props
  return (
    <View
      style={{ flexDirection: 'row' }}
    >
      <Button
        onClick={() => dispatch({ type: 'help'})}
      >
        Help
      </Button>
      <Button
        onClick={() =>  dispatch({ type: 'testAPI'})}
      >
        Test the API
      </Button>
    </View>
  )
}