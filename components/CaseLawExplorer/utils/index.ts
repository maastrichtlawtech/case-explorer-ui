/* eslint-disable */
// @ts-nocheck
import { NODE_SIZE_RANGE_MAP } from '../constants'
import * as R from 'colay/ramda'
import Color from 'color'


export const filterEdges = (nodes: { id: string }[]) => (edges: { source: string; target: string }[]) => {
  const nodeMap = R.groupBy(R.prop('id'))(nodes)
  return R.filter(
    (edge) => nodeMap[edge.source] && nodeMap[edge.target]
  )(edges)
}

const CHUNK_COUNT = 3
export const createMockData = (nodeSize: number, edgeSize: number) => {
  const nodes = R.range(0, nodeSize).map((index) => ({ id: `node-${index}` }) )
  const edges = R.range(0, edgeSize).map((index) => ({ 
    id: `edge-${index}`,
    source: `node-${Math.floor(Math.random() * nodeSize)}`,
    target: `node-${Math.floor(Math.random() * nodeSize)}`,
  }))
  return {
    nodes,
    edges
  }
}

export const prepareData = (data) => {
  const {
    nodes,
    edges
  } = data
  const preNodes = R.splitEvery(Math.ceil(nodes.length / CHUNK_COUNT))(nodes)[0]
  const preEdges = filterEdges(preNodes)(edges)
  return {
    nodes: preNodes,
    edges: preEdges
  }
}

export const calculateNetworkStatisticsRange  = (
  networkStatistics: any,
  subNetwork: {
    nodes: any[],
    edges: any[]
  }
) => {
  const nodeSizeRangeMap = R.clone(NODE_SIZE_RANGE_MAP)
  const nodeIds = Object.keys(networkStatistics);
  const subNetworkNodeIds = subNetwork.nodes.map(R.prop('id'))
  const communityStats = {}
  nodeIds.forEach((id, index) => {
    const nodeStatistics = networkStatistics[id]
    if (nodeStatistics?.community && subNetworkNodeIds.includes(id)) {
      if (R.isNotNil(communityStats[nodeStatistics.community])) {
        communityStats[nodeStatistics.community] += 1 
      } else {
        communityStats[nodeStatistics.community] = 1
      }
    }
    Object.keys(nodeStatistics).forEach((key) => {
      const statisticValue = nodeStatistics[key]; // the value of the statistic
      if (index === 0) {
        nodeSizeRangeMap[key][0] = statisticValue
        nodeSizeRangeMap[key][1] = statisticValue
      } else {
        nodeSizeRangeMap[key][0] = Math.min(statisticValue, nodeSizeRangeMap[key][0]);
        nodeSizeRangeMap[key][1] = Math.max(statisticValue, nodeSizeRangeMap[key][1]);
      }
    })
  })
  return {
    nodeSizeRangeMap,
    communityStats: Object.keys(communityStats).map((key) => ({
      key,
      value: communityStats[key]
    })).sort((a, b) => b.value - a.value)
  }
}

const getStatisticsValue = (
  item: any, graphEditorRef: GraphEditorRef, fieldName?: keyof typeof NODE_SIZE_RANGE_MAP,
  ) => graphEditorRef.current.context.localDataRef.current.networkStatistics.local?.[item.id]?.[fieldName]
??  item.data[fieldName]

export const calculateNodeSize = (item: object, graphEditorRef: GraphEditorRef, rangeMap: any, fieldName?: keyof typeof NODE_SIZE_RANGE_MAP, ) => {
  if (!fieldName) {
    return 0//rangeMap.size[0]
  }
  const value = getStatisticsValue(item, graphEditorRef, fieldName)
  const fieldRange = rangeMap[fieldName]
  const sizeRangeGap = rangeMap.size[1] - rangeMap.size[0]
  const fieldRangeGap = fieldRange[1] - fieldRange[0]
  const fieldRangeValue = (value ?? fieldRange[0]) - fieldRange[0]
  if (fieldRangeGap === 0) { 
    return 0
  }
  return (fieldRangeValue / fieldRangeGap) // (fieldRangeValue / fieldRangeGap) * sizeRangeGap
  // return  ((fieldRangeValue / fieldRangeGap) * sizeRangeGap) + rangeMap.size[0]
}

export const calculateColor = (
  color: number,
  item: object,
  graphEditorRef: GraphEditorRef,
  rangeMap: any,
  fieldName?: keyof typeof NODE_SIZE_RANGE_MAP
) => {
  if (!fieldName) {
    return perc2color(color, 0)
  }
  const fieldRange = rangeMap[fieldName]
  const sizeRangeGap = rangeMap.size[1] - rangeMap.size[0]
  const fieldRangeGap = fieldRange[1] - fieldRange[0]
  const value = getStatisticsValue(item, graphEditorRef, fieldName)
  const fieldRangeValue = (value ?? fieldRange[0]) - fieldRange[0]
  if (fieldRangeGap === 0) { 
    return perc2color(color, 0)
  }
  return  perc2color(color,(fieldRangeValue / fieldRangeGap) * 100)
}

export const perc2color = (
  color: number,
  perc: number,
  min = 0, 
  max = 100
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
  return Color(
    '#' + (`000000` + h.toString(16)).slice(-6)
  ).rgbNumber()
}
