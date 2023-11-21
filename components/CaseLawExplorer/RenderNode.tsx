import React from 'react'
import * as R from 'colay/ramda'
import * as PIXI from 'pixi.js'
import {Graph} from 'perfect-graph-new/components'
import {RenderNode as RenderNodeType, GraphEditorRef} from 'perfect-graph-new/src/type'
import {NODE_SIZE_RANGE_MAP} from './constants'
import {useGraphEditor} from 'perfect-graph-new/hooks'
import {calculateNodeSize, calculateColor, perc2color} from './utils'

export type RenderNodeProps = Parameters<RenderNodeType>[0]

const DEFAULT_FONT_SIZE = 20
const TOP_SCALE = 3.1
const SIZE_MULTIPLIER = 2

export const RenderNode = (props: RenderNodeProps) => {
  const {
    item,
    element,
    cy,
    theme,
    visualization,
    visualizationRangeMap,
    filtering,
    labelPath,
    label,
    graphRef,
    graphEditorRef,
    controllerProps,
    fullGraph,
    config
  } = props

  let text = R.takeLast(6, `${label}`) //item.id
  if (labelPath[0] === 'id') {
    const arr = R.reverse(label.split(':'))
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
      top: -DEFAULT_FONT_SIZE * TOP_SCALE,
      left: -DEFAULT_FONT_SIZE / 2
    }
  })
  React.useEffect(() => {
    const onZoom = () => {
      if (textRef.current) {
        const xScale = 1 / graphRef.current.viewport.scale.x
        const yScale = 1 / graphRef.current.viewport.scale.y
        localDataRef.current.scale.x = xScale
        localDataRef.current.scale.y = yScale
        if (xScale >= 1 && xScale <= 5) {
          textRef.current.scale.x = xScale
          textRef.current.scale.y = yScale
          const top = -DEFAULT_FONT_SIZE * yScale
          const left = -(DEFAULT_FONT_SIZE / 2) * xScale
          textRef.current.x = left
          textRef.current.y = top
          return
        }
      }
    }
    if (graphRef.current.viewport) {
      onZoom()
      graphRef.current.viewport.on('zoomed', onZoom)
    }
    return () => {
      if (graphRef.current.viewport) {
        graphRef.current.viewport.off('zoomed', onZoom)
      }
    }
  }, [graphRef.current.viewport])
  const {
    view: {width, height, radius, fill, labelVisible}
  } = config
  const color = hasSelectedEdge
    ? fill.edgeSelected
    : element.selected()
      ? fill.selected
      : element.hovered()
        ? fill.hovered
        : visualization.nodeColor
          ? calculateColor(fill.default, item, graphEditorRef, visualizationRangeMap, visualization.nodeColor)
          : fill.default

  let sizePerc = calculateNodeSize(item, graphEditorRef, visualizationRangeMap, visualization.nodeSize)

  if (controllerProps.activeCluster === null) {
    let sum = fullGraph.nodes.filter(n => fullGraph.networkStatistics[n.id].community == item.id).length
    sizePerc += sum / controllerProps.nodes.length
    text = `cluster-${item.id}`
  }

  const calcWidth = width + width * sizePerc * SIZE_MULTIPLIER
  const calcHeight = height + height * sizePerc * SIZE_MULTIPLIER
  const calcRadius = radius + radius * sizePerc * SIZE_MULTIPLIER
  return (
    <Graph.View
      width={calcWidth}
      height={calcHeight}
      radius={calcRadius}
      fill={color}
      pointertap={e => {
        cy.$(':selected').unselect()
        element.select()
      }}
    >
      {labelVisible && (
        <Graph.Text
          ref={textRef}
          x={localDataRef.current.text.left}
          y={localDataRef.current.text.top - calcHeight / 3}
          style={TEXT_STYLE}
          text={text}
          // isSprite
        />
      )}
    </Graph.View>
  )
}

const NODE_SIZE = {
  width: 80,
  height: 80
}

const TEXT_STYLE = new PIXI.TextStyle({
  fontSize: DEFAULT_FONT_SIZE
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
