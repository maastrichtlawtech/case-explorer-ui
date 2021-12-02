import React from 'react'
import * as R from 'colay/ramda'
import * as PIXI from 'pixi.js'
import { Graph,  } from 'perfect-graph/components'
import { RenderEdge as RenderEdgeType,  } from 'perfect-graph/type'


export type RenderEdgeProps = Parameters<RenderEdgeType>[0]

const DEFAULT_FONT_SIZE = 16

export const RenderEdge = ({
   item, element, cy, theme,
   visualization, 
   filtering,
   label,
   labelPath,
  graphRef ,
  config,
}: RenderEdgeProps) => {
  let text =  R.takeLast(6, `${label}`)//item.id
 if (labelPath[0] === 'id' ) {
  const arr =  R.reverse(label.split(':'))
  text = `${arr[2]}:${arr[1]}`
 }
  const textRef = React.useRef(null)
  const configRef = React.useRef({
    fontSize: DEFAULT_FONT_SIZE
  })
  React.useEffect(() => {
    const onZoom = () => {
      const xScale = 1/graphRef.current.viewport.scale.x
        const yScale = 1/graphRef.current.viewport.scale.y
        if (xScale >= 1 && xScale <= 5){
          textRef.current.scale.x = xScale
          textRef.current.scale.y = yScale
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
    view: {
      width,
      height,
      radius,
      fill,
      labelVisible,
    },
  } = config
  return (
    <Graph.View
              interactive
              pointertap={() => {
                cy.$(':selected').unselect()
                element.select()
              }}
            >
              {
                labelVisible && (
                  <Graph.Text
                    ref={textRef}
                    text={text}
                    // style={{
                    //   // position: 'absolute',
                    //   // top: -40,
                    //   // backgroundColor: DefaultTheme.palette.background.paper,
                    //   fontSize: DEFAULT_FONT_SIZE
                    // }}
                    // isSprite
                  />
                )
              }
            </Graph.View>
  )
}

