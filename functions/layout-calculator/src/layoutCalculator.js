import cytoscape from 'cytoscape'
import { Layouts } from './layouts'
import euler from 'cytoscape-euler'
import cola from 'cytoscape-cola'
import dagre from 'cytoscape-dagre'
import spread from 'cytoscape-spread'

spread(cytoscape)
cytoscape.use(dagre)
cytoscape.use(euler)
cytoscape.use(cola)

export const calculateLayout = async (params) => {
  const {
    graph,
    layoutName,
    boundingBox,
  } = params
  const nodes = graph.nodes.map((node) => ({
    data: { id: node.id },
    group: 'nodes',
  }))
  const edges = graph.edges.map((edge) => ({
    data: {
      id: edge.id, source: edge.source, target: edge.target,
    },
    group: 'edges',
  }))
  const cy = cytoscape({
    elements: [
      ...nodes,
      ...edges,
    ],
    headless: true,
    styleEnabled: true,
  })
  const layout = cy.createLayout({
    ...Layouts[layoutName],
    boundingBox,
  })
  const result = await new Promise((resolve, reject) => {
    try {
      layout.on('layoutstop', () => {
        // @ts-ignore
        const nodePositions = {}
        // Fix the edge lines
        cy.nodes().forEach((node) => {
          nodePositions[node.id()] = node.position()
        })
        resolve(nodePositions)
        // FOR CULLING
      })
      layout.start()
    } catch (error) {
      reject(error)
    }
  })
  return result
}
