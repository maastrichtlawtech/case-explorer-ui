import { Node, Edge } from './types'

export type Location = { x: number, y: number }
export type ClusterInfo = {
    nodes: Node[],
    edges: Edge[],
    lastLayout?: any,
    locations?: Location[]
}
export type ClusterCache = Map<number|null, ClusterInfo>

const clusterCache: ClusterCache = new Map()

export default {
    reset: () => clusterCache.clear(),
    get: (key: number|null) => { return clusterCache.get(key) },
    set: (key: number|null, val: ClusterInfo) => {
        clusterCache.set(key, val)
        return val
    }

}
