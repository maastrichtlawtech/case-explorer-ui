import React from 'react'
import * as R from 'colay/ramda'
import * as PIXI from 'pixi.js'
import { Graph,  } from 'perfect-graph/components'
import { RenderNode as RenderNodeType, GraphEditorRef } from 'perfect-graph/type'


export type RenderNodeProps = Parameters<RenderNodeType>[0]

const DEFAULT_FONT_SIZE = 20
const TOP_SCALE = 3.1
export const RenderNode = (props: RenderNodeProps) => {
  const {
    item, element, cy, theme,
    visualization, 
    filtering,
    labelPath,
    label,
   graphRef ,
   graphEditorRef,
 } = props
 let text =  R.takeLast(6, `${label}`)//item.id
 if (labelPath[0] === 'id' ) {
  const arr =  R.reverse(label.split(':'))
  text = `${arr[2]}:${arr[1]}`
 }
  const size = calculateNodeSize(item, graphEditorRef, visualization.nodeSize)
  const color = visualization.nodeColor ? calculateColor(
    item.data,
    visualization.nodeColor
  ) : theme.palette.background.paper
  const hasSelectedEdge = element.connectedEdges(':selected').length > 0
  const textRef = React.useRef(null)
  const localDataRef = React.useRef({
    scale: {
      x: 1,
      y: 1
    },
    text: {
      top: - DEFAULT_FONT_SIZE * TOP_SCALE,
      left:- DEFAULT_FONT_SIZE / 2, 
    }
  })
  React.useEffect(() => {
    const onZoom = () => {
        const xScale = 1/graphRef.current.viewport.scale.x
        const yScale = 1/graphRef.current.viewport.scale.y
        localDataRef.current.scale.x = xScale
        localDataRef.current.scale.y = yScale
        if (xScale >= 1 && xScale <= 5) {
          textRef.current.scale.x = xScale
          textRef.current.scale.y = yScale
          const top =  - DEFAULT_FONT_SIZE * yScale
          const left =  - (DEFAULT_FONT_SIZE / 2) * xScale
          textRef.current.x = left
          textRef.current.y = top
          return
        }
    }
    if (graphRef.current.viewport) {
      onZoom()
      graphRef.current.viewport.on('zoomed',onZoom)
    }
    return () => {
      if (graphRef.current.viewport) {
        graphRef.current.viewport.off('zoomed',onZoom)
      }
    }
  }, [graphRef.current.viewport])
  return (
    <Graph.View
      style={{
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        backgroundColor: hasSelectedEdge
        ? theme.palette.secondary.main
        : (
          element.selected()
          ? theme.palette.primary.main
          : (
            element.hovered()
            ? theme.palette.secondary.main
            : color
            )
          ),
        borderRadius: size,
      }}
      pointertap={(e) => {
        cy.$(':selected').unselect()
        element.select()
      }}
    >
      <Graph.Text
        ref={textRef}
        style={{
          position: 'absolute',
          left: localDataRef.current.text.left,
          top: localDataRef.current.text.top  - size/3,
          fontSize: DEFAULT_FONT_SIZE
        }}
        isSprite
      >
        {text}
      </Graph.Text>
    </Graph.View>
  )
}

const NODE_SIZE = {
  width: 80,
  height: 80,
}

const NODE_SIZE_RANGE_MAP = {
  size: [60, 250],
  betweenness: [0, 10],
  betweenness_centrality: [0, 1],
  closeness: [0, 10],
  degree: [0, 20],
  indegree: [0, 10],
  outdegree: [0, 10],
  pageRank: [0, 1],
  rel_in_degree: [0, 1],
  year: [
    1969,
    2015
  ],
  authorities: [0, 1],
  community: [0, 10],
  hubs: [0, 1],
}

const NETWORK_STATISTICS_NAMES = [
  'betweenness',
  'betweenness_centrality',
  'closeness',
  'degree',
  'indegree',
  'outdegree',
  'pageRank',
  'rel_in_degree',
]
const calculateNodeSize = (item: object, graphEditorRef: GraphEditorRef, fieldName?: keyof typeof NODE_SIZE_RANGE_MAP) => {
  if (!fieldName) {
    return NODE_SIZE_RANGE_MAP.size[0]
  }
  
  const value = NETWORK_STATISTICS_NAMES.includes(fieldName)
    ? graphEditorRef.current.context.localDataRef.current.networkStatistics.local?.[item.id]?.[fieldName]
    : item.data[fieldName]
  console.log(fieldName, item,graphEditorRef.current.context.localDataRef.current.networkStatistics.local, value, )
  const fieldRange = NODE_SIZE_RANGE_MAP[fieldName]
  const sizeRangeGap = NODE_SIZE_RANGE_MAP.size[1] - NODE_SIZE_RANGE_MAP.size[0]
  const fieldRangeGap = fieldRange[1] - fieldRange[0]
  const fieldRangeValue = (value ?? fieldRange[0]) - fieldRange[0]
  return  ((fieldRangeValue / fieldRangeGap) * sizeRangeGap) + NODE_SIZE_RANGE_MAP.size[0]
}

const calculateColor = (data: object, fieldName?: keyof typeof NODE_SIZE_RANGE_MAP) => {
  if (!fieldName) {
    return perc2color(0)
  }
  const fieldRange = NODE_SIZE_RANGE_MAP[fieldName]
  const sizeRangeGap = NODE_SIZE_RANGE_MAP.size[1] - NODE_SIZE_RANGE_MAP.size[0]
  const fieldRangeGap = fieldRange[1] - fieldRange[0]
  const fieldRangeValue = (data[fieldName] ?? fieldRange[0]) - fieldRange[0]
  return  perc2color((fieldRangeValue / fieldRangeGap) * 100)
}
const perc2color = (
  perc: number,
  min = 20, 
  max = 80
) => {
  var base = (max - min);

  if (base === 0) { perc = 100; }
  else {
      perc = (perc - min) / base * 100; 
  }
  var r, g, b = 0;
  if (perc < 50) {
      r = 255;
      g = Math.round(5.1 * perc);
  }
  else {
      g = 255;
      r = Math.round(510 - 5.10 * perc);
  }
  var h = r * 0x10000 + g * 0x100 + b * 0x1;
  return '#' + ('000000' + h.toString(16)).slice(-6);
}
