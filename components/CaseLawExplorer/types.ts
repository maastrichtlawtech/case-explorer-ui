export type NodeId = string
export type EdgeId = string
export type Node = {id: NodeId, data: any}
export type Edge = {id: EdgeId, source: NodeId, target: NodeId}
export type NetworkStats = { [key: NodeId]: {community: number} }
export type Graph = { networkStatistics: NetworkStats , nodes: Node[] , edges: Edge[] }
