import React from 'react'
import {Typography, Divider} from '@mui/material'
import {View, useClipboard} from 'colay-ui'
import {Auth} from 'aws-amplify'

const EXAMPLE_SCRIPT_URI = `https://github.com/maastrichtlawtech/case-law-explorer/blob/master/notebooks/api/query_API.ipynb`

export const DeveloperSettings = () => {
  const [, setClipboard] = useClipboard()
  const [apiKey, setApiKey] = React.useState('')
  React.useEffect(() => {
    const call = async () => {
      const user = await Auth.currentSession()
      const token = user.getAccessToken().getJwtToken()
      setApiKey(token)
    }
    call()
  }, [])
  return (
    <View
      style={{
        width: '100%'
      }}
    >
      <Typography variant="h6">Developer Settings</Typography>
      <Divider />
      <Typography variant="button">API Key:</Typography>
      <Typography
        style={{
          width: '50%',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        onClick={() => {
          setClipboard(apiKey)
        }}
      >
        {apiKey}
      </Typography>
      <Divider />
      <a href={EXAMPLE_SCRIPT_URI} target="_blank">
        Example Script
      </a>
    </View>
  )
}
