import { Button, Typography, Divider } from '@mui/material'
import { Auth } from 'aws-amplify'
import { View } from 'colay-ui'
import React from 'react'
import { useUser } from '../../useUser'
import { useGraphEditor } from 'perfect-graph/hooks/useGraphEditor'


export const DataBarHeader = () => {
  const [user] = useUser()
  const [
    {
      nodes,
      edges
    },
  ] = useGraphEditor(
    (editor) => {
      const {
        nodes,
        edges
      } = editor
      return {
        nodes,
        edges
      }
    }
  )
  return (
    <View>
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
      <Divider />
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 2 }}
      >
        <Typography>{`Node Count: ${nodes.length}`}</Typography>
        <Typography>{`Edge Count: ${edges.length}`}</Typography>
      </View>
    </View>
  )
}