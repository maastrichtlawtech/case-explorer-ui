import React from 'react'
import {View} from 'colay-ui'
import {download} from 'colay-ui/utils'
import {Button} from '@mui/material'

import * as API from '../../API'
import {FullGraphContext, UIStateContext} from '../../Contexts'
import {Graph, Node} from '../../types'

async function testAPI() {
  const testResult = await API.testAuth({
    ecli: 'ECLI:NL:HR:2004:AP0186'
  })
  console.log('testAuthResult', testResult)
}

async function downloadMetaData(fullGraph: Graph, updateFullGraph: (fun: (draft: Graph) => void) => void) {
  const nodeChunks: {id: string}[][] = []
  const chunkSize = 1000
  for (let i = 0; i < fullGraph.nodes.length; i += chunkSize) {
    const slice: Node[] = fullGraph.nodes.slice(i, i + chunkSize)
    nodeChunks.push(slice.map(({id}) => ({id})))
  }

  const nodesWithMetaData = await Promise.all(nodeChunks.map(nodes => API.batchGetElementData({nodes: nodes}))).then(
    results => results.flat(1)
  ) // flatten the results of the chunks

  const nodeMap: {[idx: string]: Node} = {}
  fullGraph.nodes.forEach((node: Node) => {
    nodeMap[node.id] = node
  })
  const result = nodesWithMetaData.map(({id, data, ...rest}) => {
    return {
      id,
      data: {
        ...(nodeMap[id].data ?? {}),
        ...data
      },
      ...rest
    }
  })

  updateFullGraph((draft: Graph) => {
    draft.nodes = result
  })
  download(result, 'perfect-graph.json')
}

export function ActionBarRight() {
  const {updateState} = React.useContext(UIStateContext)
  const {fullGraph, updateFullGraph} = React.useContext(FullGraphContext)
  return (
    <View style={{flexDirection: 'row'}}>
      <Button onClick={() => updateState((draft: any) => (draft.helpModal.isOpen = true))}>Help</Button>
      <Button onClick={async () => downloadMetaData(fullGraph, updateFullGraph)}>Download MetaData</Button>
      <Button onClick={testAPI}>Test the API</Button>
    </View>
  )
}
