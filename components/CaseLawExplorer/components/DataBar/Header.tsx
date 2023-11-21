import {Button, Typography, Divider, List} from '@mui/material'
import {Auth} from 'aws-amplify'
import {View} from 'colay-ui'
import React from 'react'
import {useUser} from '../../useUser'
import {useGraphEditor} from 'perfect-graph/hooks/useGraphEditor'
import {selectCluster, GraphClusterButton, ClusterToggleSwitch} from '../../cluster_graph'
import {Graph} from '../../types'
import {ControllerContext, FullGraphContext} from '../../Contexts'
import {Collapsible, CollapsibleContainer, CollapsibleTitle} from 'perfect-graph/components/Collapsible'
function ClusterInfo(props: {fullGraph: Graph; activeCluster: number | null; itemId: number | null}) {
  const {fullGraph, activeCluster, itemId} = props
  if (activeCluster !== null || itemId === null) return null

  const {nodes} = selectCluster(fullGraph, itemId)

  if (nodes.length == 0) return null

  return (
    <div>
      <Typography>{`Nodes Inside this cluster: ${nodes.length}`}</Typography>
      <Collapsible>
        {({isOpen, onToggle}) => (
          <>
            <CollapsibleTitle onClick={onToggle}>{`Node List`}</CollapsibleTitle>
            {isOpen && (
              <CollapsibleContainer>
                <Divider />
                {nodes.map((n, idx) => {
                  return (
                    <div key={idx} style={{fontSize: 'small'}}>
                      {n.id}
                    </div>
                  )
                })}
                <Divider />
              </CollapsibleContainer>
            )}
          </>
        )}
      </Collapsible>
    </div>
  )
}

export const DataBarHeader = props => {
  const [user] = useUser()
  const [{nodes, edges, targetPath, selectedItemId, allNodes, allEdges}] = useGraphEditor(editor => {
    const {
      selectedElement,
      selectedItem,
      nodes,
      edges,
      localDataRef: {
        current: {
          props: {allNodes, allEdges}
        }
      }
    } = editor
    const targetPath = selectedElement?.isNode() ? 'nodes' : 'edges'
    const selectedItemId = selectedItem?.id!
    return {
      nodes,
      edges,
      targetPath,
      selectedItemId,
      allNodes,
      allEdges
    }
  })
  const {fullGraph} = React.useContext(FullGraphContext)
  const {activeCluster} = React.useContext(ControllerContext)

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 2
        }}
      >
        <Typography>{user?.attributes?.email}</Typography>
        <Button color="secondary" onClick={() => Auth.signOut()}>
          Signout
        </Button>
      </View>
      <View
        style={{
          justifyContent: 'space-between',
          padding: 2,
          alignItems: 'center'
        }}
      >
        <ClusterToggleSwitch itemId={selectedItemId} />
      </View>
      <Divider />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 2
        }}
      >
        <Typography>{`Visible Nodes: ${nodes.length}`}</Typography>
        <Typography>{`Visible Edges: ${edges.length}`}</Typography>
      </View>
      <Divider />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 2
        }}
      >
        <Typography>{`Retrieved Nodes: ${allNodes?.length}`}</Typography>
        <Typography>{`Retrieved Edges: ${allEdges?.length}`}</Typography>
      </View>
      <Divider />
      <GraphClusterButton itemId={selectedItemId} />
      <Divider />
      <ClusterInfo activeCluster={activeCluster} fullGraph={fullGraph} itemId={Number(selectedItemId)} />
    </View>
  )
}
