/* eslint-disable */
// @ts-nocheck
import * as R from 'colay/ramda'


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

const NODE_SIZE = {
  width: 80,
  height: 80,
}

export const NODE_SIZE_RANGE_MAP = {
  size: [60, 250],
  community: [0, 10],
  in_degree: [0, 10],
  out_degree: [0, 10],
  degree: [0, 20],
  year: [
    1969,
    2015
  ],
}
export const calculateNodeSize = (data: object, fieldName?: keyof typeof NODE_SIZE_RANGE_MAP) => {
  if (!fieldName) {
    return NODE_SIZE_RANGE_MAP.size[0]
  }
  const fieldRange = NODE_SIZE_RANGE_MAP[fieldName]
  const sizeRangeGap = NODE_SIZE_RANGE_MAP.size[1] - NODE_SIZE_RANGE_MAP.size[0]
  const fieldRangeGap = fieldRange[1] - fieldRange[0]
  const fieldRangeValue = (data[fieldName] ?? fieldRange[0]) - fieldRange[0]
  return ((fieldRangeValue / fieldRangeGap) * sizeRangeGap) + NODE_SIZE_RANGE_MAP.size[0]
}
export const calculateColor = (data: object, fieldName?: keyof typeof NODE_SIZE_RANGE_MAP) => {
  if (!fieldName) {
    return perc2color(0)
  }
  const fieldRange = NODE_SIZE_RANGE_MAP[fieldName]
  const sizeRangeGap = NODE_SIZE_RANGE_MAP.size[1] - NODE_SIZE_RANGE_MAP.size[0]
  const fieldRangeGap = fieldRange[1] - fieldRange[0]
  const fieldRangeValue = (data[fieldName] ?? fieldRange[0]) - fieldRange[0]
  return perc2color((fieldRangeValue / fieldRangeGap) * 100)
}
export const perc2color = (
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