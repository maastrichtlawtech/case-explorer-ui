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
      edges,
      allNodes,
      allEdges
    },
  ] = useGraphEditor(
    (editor) => {
      const {
        nodes,
        edges,
        localDataRef: {
          current: {
            props: {
              allNodes,
              allEdges
            }
          }
        }
      } = editor
      return {
        nodes,
        edges,
        allNodes,
        allEdges
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
        <Typography>{`Visible Nodes: ${nodes.length}`}</Typography>
        <Typography>{`Visible Edges: ${edges.length}`}</Typography>
      </View>
      <Divider />
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 2 }}
      >
        <Typography>{`Retrieved Nodes: ${allNodes?.length}`}</Typography>
        <Typography>{`Retrieved Edges: ${allEdges?.length}`}</Typography>
      </View>
    </View>
  )
}