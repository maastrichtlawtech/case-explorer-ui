import React from 'react'
import * as R from 'unitx/ramda'
import mingo from 'unitx/mingo'
import { ApplicationProvider, Button, Layout,useTheme} from 'unitx-ui'
import { 
  DarkTheme,
  DefaultTheme,
} from 'unitx-ui'
import  { GraphEditorProps, GraphEditor } from 'perfect-graph/components/GraphEditor'
import { Graph } from 'perfect-graph/components'
import { useController } from 'perfect-graph/plugins/controller'
import {drawLine} from 'perfect-graph/components/Graphics'
import data from './data'
import * as C from 'unitx/color'
import { FILTER_SCHEMA,  } from './constants'

type Props = Partial<GraphEditorProps>

const NODE_SIZE = {
  width: 80,
  height: 80,
}

const AppContainer = ({
  changeTheme,
  ...rest
}) => {
  const modalRef = React.useRef(null)
  const [state, setState] = React.useState({
    visible: false, 
    data,
    filteredData: data,
    filterData: { 
      'in_degree': [0, 20]
    }
})
  const onFilterChangeCallback = React.useCallback((filterData) => {
    setTimeout(
      () => {
        const processedFilterData = R.toMongoQuery({
          data: filterData,
        }, {
          processItem: (value, path) => R.cond([
            [R.equals(['data', 'in_degree']), () => ({ 
              $gte: value[0], $lte: value[1]
            })]
          ])(path)
        })

        const cursor = mingo.find(state.data.nodes, processedFilterData)
        const filteredData = cursor.all()
        setState({
          ...state,
          filterData,
          filteredData: {
            edges: filterEdges(filteredData)(state.filteredData.edges),
            nodes: filteredData
          },
        })
      }
    )
  }, [])
  const graphRef = React.useRef(null)
  const theme = useTheme()
  const [controllerProps,] = useController(state.filteredData, {
    onEvent: (eventInfo) => {
      // console.log('h', eventInfo)
    }
  })
  return (
    <Layout style={{ width: '100%', height: '100%'}}>
      <GraphEditor
        ref={graphRef}
        // controller={controller}
        extraData={{ theme }}
        style={{ width: '100%', height: '100%', }}
        graphConfig={{
          // layout: Graph.Layouts.breadthfirst,
          zoom: 0.5
        }}
        {...controllerProps}
        filterBar={{
          ...controllerProps.filterBar,
          onChange: onFilterChangeCallback,
          formData: state.filterData,
          ...FILTER_SCHEMA
        }}
        dataBar={{
            ...controllerProps.dataBar, 
            editable: false
          }}
          actionBar={undefined}
        drawLine={({ graphics, to, from }) => {
          drawLine({
            graphics,
            to,
            from,
            directed: true,
            box: {
              width: NODE_SIZE.width + 10,
              height: NODE_SIZE.height + 10
            },
            fill:C.rgbNumber(theme.colors.text)
            // type: 'bezier'
          })
        }}
        renderNode={({ item: { id, data } }) => {
          return (
            <Graph.HoverContainer
              style={{
                ...NODE_SIZE,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 25
                }}
                renderHoverElement={() => (
                  <Graph.View
                    style={{
                      width: NODE_SIZE.width * 2,
                      height: 20,
                      position: 'absolute',
                      left: 0,
                    }}
                  >
                    <Graph.Text style={{
                      fontSize: 20,
                       textAlign: 'center',
                      }}>
                      {R.replace('ECLI:NL:', '')(data.ecli)}
                    </Graph.Text>
                  </Graph.View>
                )}
            >
              <Graph.Text style={{fontSize: 10}}>
                {R.replace('ECLI:NL:', '')(data.ecli)}
              </Graph.Text>
            </Graph.HoverContainer>
          )
        }}
        {...rest}
      />
      </Layout>
  )
}



const filterEdges = (nodes: {id: string}[]) => (edges: {source:string;target:string}[]) => {
  const nodeMap = R.groupBy(R.prop('id'))(nodes)
  return R.filter(
    (edge) => nodeMap[edge.source] && nodeMap[edge.target]
  )(edges)
}
export default (props: Props) => {
  const [isDefault, setIsDefault] = React.useState(true)
const changeTheme = () => {
  setIsDefault(!isDefault)
}

  return (
    <ApplicationProvider 
      theme={isDefault  ? DefaultTheme : DarkTheme}
    >
      <AppContainer  changeTheme={changeTheme} {...props}/>
    </ApplicationProvider>
  )
}