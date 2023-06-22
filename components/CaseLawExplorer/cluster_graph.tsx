import { Button, Typography, Divider } from '@mui/material'
import React from 'react'
import { ControllerContext } from './ControllerContext'

type NodeId = string
type EdgeId = string
type Node = {id: NodeId, data: any}
type Edge = {id: EdgeId, source: NodeId, target: NodeId}
type NetworkStats = { [key: NodeId]: {parent: number} }
type Graph = { networkStatistics: NetworkStats , nodes: Node[] , edges: Edge[] }

function selectClusters
( { networkStatistics, nodes, edges } : Graph
, activeClusters: number[]
) : {nodes: Node[], edges: Edge[]}
{
    const clusters = new Set(activeClusters)
    const new_nodes = nodes.filter((node) =>
        clusters.has(networkStatistics[node.id].parent)
    )
    const new_edges : Edge[] = []
    edges.forEach((edge: Edge) => {
        const sourceCluster = networkStatistics[edge.source].parent
        const targetCluster = networkStatistics[edge.target].parent
        if (clusters.has(sourceCluster) && clusters.has(targetCluster)) {
            new_edges.push(edge)
        }
    })

    return { nodes: new_nodes
           , edges: new_edges
           }
}

function memberNodes(networkStats: NetworkStats, real_nodes: Node[], selectedClusterId: number) {
    return real_nodes.filter(n => networkStats[n.id].parent == selectedClusterId)
}

export function clusterGraph
({ networkStatistics , nodes , edges } : Graph) : {nodes: Node[], edges: Edge[]}
{
    const new_nodes = new Set(nodes.map((node) => networkStatistics[node.id].parent))
    const new_edges: Set<string> = new Set()

    edges.forEach(({source, target}) => {
        const sourceCluster = networkStatistics[source].parent
        const targetCluster = networkStatistics[target].parent
        if (sourceCluster != targetCluster) {
            if (new_nodes.has(sourceCluster) && new_nodes.has(targetCluster)) {
                const new_edge = {source: sourceCluster, target: targetCluster}
                new_edges.add(JSON.stringify(new_edge))
            }
        }
    })

    const make_node = (cluster: number) => ({id: cluster.toString(), data: {}})
    const make_edge = (str: string, idx: number): Edge => {
        const edge = JSON.parse(str)
        return {...edge, id: "edge" + idx.toString()}
    }
    return { nodes: Array.from(new_nodes).map(make_node)
           , edges: Array.from(new_edges).map(make_edge)
           }
}


export function GraphClusterButton
( { itemId } : {itemId: any})
{
    const {controllerProps, controller, fullGraph} = React.useContext(ControllerContext)

    if (controllerProps.showing_clusters && !itemId) return null

    let members: Node[] = []
    if (itemId) {
       members = memberNodes(fullGraph.networkStatistics, fullGraph.nodes, Number(itemId))
       itemId = Number(itemId)
    }

    return (
        <div>
            <Button onClick={() => {
            const zoomIn = controllerProps.showing_clusters && itemId
            const {nodes, edges} = zoomIn
                ? selectClusters(fullGraph, [itemId])
                : clusterGraph(fullGraph)

            controller.update((draft: any) => {
                draft.nodes = nodes
                draft.edges = edges
                draft.display_updated = true
                draft.showing_clusters = !zoomIn
            })
            }} color="primary">
            {controllerProps.showing_clusters && itemId ? "Zoom In" : "Zoom Out"}
            </Button>
            {   (itemId && members.length > 0 ) &&
                <div>
                    <Divider />
                    <Typography>{`Nodes Inside this cluster: ${members.length}`}</Typography>
                    <Divider />
                    {members.map((n, idx) => { return <div key={idx} style={{fontSize: "small"}}>{n.id}</div>})}
                    <Divider />
                </div>
            }
        </div>
        )
}
