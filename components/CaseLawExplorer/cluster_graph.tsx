import { Button, Typography, Divider } from '@mui/material'
import React, { RefObject } from 'react'

type NodeId = string
type EdgeId = string
type Node = {id: NodeId, data: any}
type Edge = {id: EdgeId, source: NodeId, target: NodeId}
type NetworkStats = { [key: NodeId]: {parent: number} }

function selectClusters
( networkStats: NetworkStats
, nodes: Node[]
, edges: Edge[]
, activeClusters: number[]
) : {nodes: Node[], edges: Edge[]}
{
    const clusters = new Set(activeClusters)
    const new_nodes = nodes.filter((node) =>
        clusters.has(networkStats[node.id].parent)
    )
    const new_edges = new Array()
    edges.forEach((edge: Edge) => {
        const sourceCluster = networkStats[edge.source].parent
        const targetCluster = networkStats[edge.target].parent
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
( networkStats: NetworkStats
, nodes: Node[]
, edges: Edge[]
) : {nodes: Node[], edges: Edge[]}
{
    const new_nodes = new Set(nodes.map((node) => networkStats[node.id].parent))
    const new_edges: Set<string> = new Set()

    edges.forEach(({source, target}) => {
        const sourceCluster = networkStats[source].parent
        const targetCluster = networkStats[target].parent
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
( { controllerRef, itemId } : {controllerRef: RefObject<any>, itemId: any})
{
    if (!controllerRef || !controllerRef.current) return null

    const {controllerProps} = controllerRef.current

    if (controllerProps.showing_clusters && !itemId) return null

    let members: Node[] = []
    if (itemId) {
       members = memberNodes(controllerProps.networkStatistics.global, controllerProps.real_nodes, Number(itemId))
    }

    return (
        <div>
            <Button onClick={() => {
            const {controller, controllerProps} = controllerRef.current
            const zoomIn = controllerProps.showing_clusters && itemId
            const networkStatistics = controllerProps.networkStatistics.global
            const {nodes, edges} = zoomIn
                ? selectClusters(networkStatistics, controllerProps.real_nodes, controllerProps.real_edges, [Number(itemId)])
                : clusterGraph(networkStatistics, controllerProps.real_nodes, controllerProps.real_edges)

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
                    {members.map(n => { return <div style={{fontSize: "small"}}>{n.id}</div>})}
                    <Divider />
                </div>
            }
        </div>
        )
}
