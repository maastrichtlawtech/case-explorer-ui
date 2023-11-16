const {calculateLayout} = require('./layoutCalculator')

exports.handler = async (event, context, callback) => {
  console.log('event', event)
  const {nodes, edges, layoutName, boundingBox} = event //JSON.parse(event.body)
  console.log('event', event)
  const result = await calculateLayout({
    boundingBox,
    graph: {
      edges,
      nodes
    },
    layoutName
  })
  console.log('result', result)
  // callback(null, result)
  return {
    statusCode: 200,
    //  Uncomment below to enable CORS requests
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*'
    },
    body: JSON.stringify(result)
  }
}
