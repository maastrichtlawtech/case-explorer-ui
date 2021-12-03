import React from 'react'
import * as R from 'colay/ramda'
import * as PIXI from 'pixi.js'
import { Graph,  } from 'perfect-graph/components'
import { RenderNode as RenderNodeType, GraphEditorRef } from 'perfect-graph/type'
import { NODE_SIZE_RANGE_MAP } from './constants'
import { 
  calculateNodeSize,
  calculateColor,
  perc2color
 } from './utils'


export type RenderNodeProps = Parameters<RenderNodeType>[0]

const DEFAULT_FONT_SIZE = 20
const TOP_SCALE = 3.1
export const RenderNode = (props: RenderNodeProps) => {
  const {
    item, element, cy, theme,
    visualization, 
    visualizationRangeMap, 
    filtering,
    labelPath,
    label,
   graphRef ,
   graphEditorRef,
   config,
 } = props
 let text =  R.takeLast(6, `${label}`)//item.id
 if (labelPath[0] === 'id' ) {
  const arr =  R.reverse(label.split(':'))
  text = `${arr[2]}:${arr[1]}`
 }
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
  const {
    view: {
      width,
      height,
      radius,
      fill,
      labelVisible,
    },
  } = config
  const fillColor = hasSelectedEdge
  ? fill.edgeSelected
  : (element.selected()
    ? fill.selected
    : (
      element.hovered()
        ? fill.hovered
        : fill.default
    )
  )
  const size = calculateNodeSize(item, graphEditorRef,visualizationRangeMap, visualization.nodeSize, )

  const color = visualization.nodeColor ? calculateColor(
    fillColor,
    item,
    graphEditorRef,
    visualizationRangeMap,
    visualization.nodeColor
  ) : theme.palette.background.paper
  console.log('AA,', size ,fillColor, color)
  return (
    <Graph.View
      width={width + (width * size)}
      height={height + (height * size)}
      fill={color}
      radius={radius}
      pointertap={(e) => {
        cy.$(':selected').unselect()
        element.select()
      }}
    >
      {
        labelVisible && (
          <Graph.Text
            ref={textRef}
            x={localDataRef.current.text.left}
            y={localDataRef.current.text.top - size/3}
            style={TEXT_STYLE}
            text={text}
            // isSprite
          />
        )
      }
    </Graph.View>
  )
}

const NODE_SIZE = {
  width: 80,
  height: 80,
}



const NETWORK_STATISTICS_NAMES = [
  'betweenness',
  'betweenness_centrality',
  'closeness',
  'closeness_centrality',
  'degree',
  'degree_centrality',
  'in_degree',
  'in_degree_centrality',
  'out_degree',
  'out_degree_centrality',
  'page_rank',
  'rel_in_degree',
  'community'
]

const TEXT_STYLE = new PIXI.TextStyle({
  fontSize: DEFAULT_FONT_SIZE,
  // fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
  // align: 'center',
  // fontWeight: 400,
  // fill: ['#ffffff', '#00ff99'], // gradient
  // stroke: '#01d27e',
  // strokeThickness: 5,
  // letterSpacing: 20,
  // dropShadow: true,
  // dropShadowColor: '#ccced2',
  // dropShadowBlur: 4,
  // dropShadowAngle: Math.PI / 6,
  // dropShadowDistance: 6,
  // wordWrap: true,
  // wordWrapWidth: 440,
})