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
  graphRef 
}: RenderEdgeProps) => {
  const text = R.takeLast(6, item.id)
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
  
  return (
    <Graph.View
              interactive
              style={{
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
              }}
              click={() => {
                cy.$(':selected').unselect()
                element.select()
              }}
            >
              <Graph.Text
                ref={textRef}
                style={{
                  // position: 'absolute',
                  // top: -40,
                  // backgroundColor: DefaultTheme.palette.background.paper,
                  fontSize: DEFAULT_FONT_SIZE
                }}
                isSprite
              >
                {text}
              </Graph.Text>
            </Graph.View>
  )
}

