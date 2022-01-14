import { calculateLayout } from './src/layoutCalculator'

exports.handler = async (event, context, callback) => {
  const {
    nodes,
    edges,
    layoutName,
    boundingBox,
  } = event.arguments
  const result = await calculateLayout({
    boundingBox,
    graph: {
      edges,
      nodes,
    },
    layoutName,
  })
  callback(null, result)
}
