import {Button, Typography, Divider, FormControlLabel, Switch, FormGroup} from '@mui/material'
import React from 'react'
import {ControllerContext, FullGraphContext} from './Contexts'
import {Node, Edge, NetworkStats, Graph} from './types'
import ClusterCache from './ClusterCache'

export function selectCluster(
  {networkStatistics, nodes, edges}: Graph,
  activeCluster: number
): {nodes: Node[]; edges: Edge[]} {
  const cachedResult = ClusterCache.get(activeCluster)
  if (cachedResult) {
    return {nodes: cachedResult.nodes, edges: cachedResult.edges}
  }

  const new_nodes = nodes.filter(node => networkStatistics[node.id].community == activeCluster)
  const new_edges: Edge[] = []
  edges.forEach((edge: Edge) => {
    const sourceCluster = networkStatistics[edge.source].community
    const targetCluster = networkStatistics[edge.target].community
    if (activeCluster == sourceCluster && activeCluster == targetCluster) {
      new_edges.push(edge)
    }
  })

  const result = {
    nodes: new_nodes,
    edges: new_edges
  }
  return result
}

export function clusterGraph({networkStatistics, nodes, edges}: Graph): {nodes: Node[]; edges: Edge[]} {
  const cachedResult = ClusterCache.get(null)
  if (cachedResult) {
    return {nodes: cachedResult.nodes, edges: cachedResult.edges}
  }

  const new_nodes = new Set(nodes.map(node => networkStatistics[node.id].community))
  const new_edges: Set<string> = new Set()

  edges.forEach(({source, target}) => {
    const sourceCluster = networkStatistics[source].community
    const targetCluster = networkStatistics[target].community
    if (sourceCluster != targetCluster) {
      if (new_nodes.has(sourceCluster) && new_nodes.has(targetCluster)) {
        const new_edge = {source: sourceCluster, target: targetCluster}
        new_edges.add(JSON.stringify(new_edge))
      }
    }

  const make_node = (cluster: number) => ({id: cluster.toString(), data: {}})
  const make_edge = (str: string, idx: number): Edge => {
    const edge = JSON.parse(str)
    return {...edge, id: 'edge' + idx.toString()}
  }
  const result = {
    nodes: Array.from(new_nodes).map(make_node),
    edges: Array.from(new_edges).map(make_edge)
  }
  return result
}

export function GraphClusterButton({itemId}: {itemId: any}) {
  const {fullGraph} = React.useContext(FullGraphContext)
  const {controller, activeCluster} = React.useContext(ControllerContext)
  const showing_clusters = activeCluster === null || activeCluster === false

  if ((showing_clusters && !itemId) || activeCluster === false) return null

  return (
    <div>
      <Button
        onClick={() => {
          const zoomIn = showing_clusters && itemId
          const {nodes, edges} = zoomIn ? selectCluster(fullGraph, itemId) : clusterGraph(fullGraph)
          controller.update((draft: any) => {
            draft.nodes = nodes
            draft.edges = edges
            draft.activeCluster = zoomIn ? itemId : null
          })
        }}
        color="primary"
      >
        {showing_clusters && itemId ? 'Zoom In' : 'Zoom Out'}
      </Button>
    </div>
  )
}

export function ClusterToggleSwitch({itemId}: {itemId: any}) {
  const {fullGraph} = React.useContext(FullGraphContext)
  const {controller, activeCluster} = React.useContext(ControllerContext)
  const showing_clusters = activeCluster === null || activeCluster === false

  if (!showing_clusters) return null
  return (
    <div>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              defaultChecked
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const showClusters = event.target.checked
                const {nodes, edges} = showClusters ? clusterGraph(fullGraph) : fullGraph
                controller.update((draft: any) => {
                  draft.nodes = nodes
                  draft.edges = edges
                  draft.activeCluster = showClusters ? null : false
                })
              }}
            />
          }
          label="Show clusters?"
        />
      </FormGroup>
    </div>
  )
}
