import React from 'react'
import * as R from 'unitx/ramda'
// import mingo from 'unitx/mingo'
import { 
  DarkTheme,
  DefaultTheme,
  ApplicationProvider,
   Button, 
  Layout,
  useTheme,
  Modal,
  Spinner,
  useData,
} from 'unitx-ui'
import { ActivityIndicator } from 'react-native'
import  { GraphEditorProps, GraphEditor } from 'perfect-graph/components/GraphEditor'
import { Graph } from 'perfect-graph/components'
import { useController } from 'perfect-graph/plugins/controller'
import {drawLine} from 'perfect-graph/components/Graphics'
import data from './data'
import * as C from 'unitx/color'
import { FILTER_SCHEMA, FILTER_SCHEMA_FETCH_EXAMPLE } from './constants'
import { requestData } from './requestData'
type Props = Partial<GraphEditorProps>

const NODE_SIZE = {
  width: 80,
  height: 80,
}

const AppContainer = ({
  changeTheme,
  ...rest
}) => {
  const [state, update] = useData({
    visible: false, 
    loading: false,
    data,
    filteredData: data,
    formData: { 
      _page: 1,
      _limit: 10,
      // _start: 1
    }
})
  const onFilterChangeCallback = React.useCallback((formData) => {
    setTimeout(
      async () => {
        // const processedformData = R.toMongoQuery({
        //   data: formData,
        // }, {
        //   processItem: (value, path) => R.cond([
        //     [R.equals(['data', 'in_degree']), () => ({ 
        //       $gte: value[0], $lte: value[1]
        //     })]
        //   ])(path)
        // })
        // const cursor = mingo.find(state.data.nodes, processedformData)
        // const filteredData = cursor.all()

        // setState({
        //   ...state,
        //   formData,
        //   filteredData: {
        //     edges: filterEdges(filteredData)(state.filteredData.edges),
        //     nodes: filteredData
        //   },
        // })
        update((draft) => {
          draft.loading = true
        })
        const filteredData = await requestData(formData)
        update((draft)=>{
          draft.formData = formData
          draft.filteredData = filteredData
          draft.graphConfig =  {
            layout: Graph.Layouts.cose,
            zoom: 0.5
          }
          draft.loading = false
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
  console.log('data', state.filteredData)
  return (
    <Layout style={{ width: '100%', height: '100%'}}>

      <GraphEditor
        ref={graphRef}
        // controller={controller}
        extraData={{ theme }}
        style={{ width: '100%', height: '100%', }}
        graphConfig={state.graphConfig}
        {...controllerProps}
        filterBar={{
          ...controllerProps.filterBar,
          onSubmit: onFilterChangeCallback,
          formData: state.formData,
          // ...FILTER_SCHEMA
          children: null,
          ...FILTER_SCHEMA_FETCH_EXAMPLE
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
        renderNode={({ item: { id,  } }) => {
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
                      width: NODE_SIZE.width,
                      height: 30,
                      position: 'absolute',
                      left: 0,
                      alignItems: 'center'
                    }}
                  >
                    <Graph.Text style={{
                      fontSize: 30,
                       textAlign: 'center',
                      }}>
                        {id}
                      {/* {R.replace('ECLI:NL:', '')(data.ecli)} */}
                    </Graph.Text>
                  </Graph.View>
                )}
            >
              <Graph.Text style={{fontSize: 10}}>
                {/* {R.replace('ECLI:NL:', '')(data.ecli)} */}
                {id}
              </Graph.Text>
            </Graph.HoverContainer>
          )
        }}
        {...rest}
      />
      <Modal 
        visible={state.loading} 
        backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', }}
      >
        <ActivityIndicator />
      </Modal>
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