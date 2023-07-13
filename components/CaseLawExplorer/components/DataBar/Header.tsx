import { Button, Typography, Divider } from '@mui/material'
import { Auth } from 'aws-amplify'
import { View } from 'colay-ui'
import React from 'react'
import { useUser } from '../../useUser'
import { useGraphEditor } from 'perfect-graph/hooks/useGraphEditor'
import { selectCluster, GraphClusterButton } from '../../cluster_graph'
import { Graph } from '../../types'
import { ControllerContext, FullGraphContext } from '../../Contexts'

function ClusterInfo(props: { fullGraph: Graph, activeCluster: number|null, itemId: number|null }) {
    const { fullGraph, activeCluster, itemId } = props
    if (activeCluster !== null || itemId === null) return null

    const { nodes } = selectCluster(fullGraph, itemId)

    if (nodes.length == 0) return null

    return (
        <div>
              <Typography>{`Nodes Inside this cluster: ${nodes.length}`}</Typography>
              <Divider />
              {nodes.map((n, idx) => { return <div key={idx} style={{fontSize: "small"}}>{n.id}</div>})}
              <Divider />
        </div>
    )
}

export const DataBarHeader = (props) => {
  const [user] = useUser()
  const [
    {
      nodes,
      edges,
      targetPath,
      selectedItemId
    },
  ] = useGraphEditor(
    (editor) => {
      const {
        selectedElement,
        selectedItem,
        nodes,
        edges
      } = editor
      const targetPath = selectedElement?.isNode() ? 'nodes' : 'edges'
      const selectedItemId = selectedItem?.id!
      return {
        nodes,
        edges,
        targetPath,
        selectedItemId
      }
    }
  )
  const { fullGraph } = React.useContext(FullGraphContext)
  const { activeCluster } = React.useContext(ControllerContext)
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
      <Divider />
      <GraphClusterButton itemId={selectedItemId} />
      <Divider />
      <ClusterInfo activeCluster={activeCluster} fullGraph={fullGraph} itemId={Number(selectedItemId)} />
    </View>
  )
}
