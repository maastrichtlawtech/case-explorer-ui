import { NODE_SIZE_RANGE_MAP } from './constants'
import * as R from 'colay/ramda'
import Color from 'color'

export const calculateNetworkStatisticsRange  = (networkStatistics: any): any => {

  const nodeSizeRangeMap = R.clone(NODE_SIZE_RANGE_MAP)
  const values = Object.values(networkStatistics);
  values.forEach((nodeStatistics, index) =>{
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
  console.log('nodeSizeRangeMap',nodeSizeRangeMap)
  return nodeSizeRangeMap
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
  return Color(
    '#' + (`${color}` + h.toString(16)).slice(-6)
  ).rgbNumber()
}