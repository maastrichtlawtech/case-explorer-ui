// @ts-nocheck
import React from 'react'
import Form from '@rjsf/material-ui'
import * as API from '../API'
import { Modal, Button, Box, Typography, TextField, Paper,IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { getQueryBuilderSchema, DEFAULT_FORM_DATA } from './constants'
import { NodeAttributes } from '../../../src/API'
import { NODE_LIMIT } from '..'
import { QueryTabs } from './QueryTabs'
import {useImmer } from 'colay-ui/hooks/useImmer'
import * as R from 'colay/ramda'

export type QueryBuilderProps = {
  query: any;
  onStart: () => void;
  onError: (e: Error) => void;
  onFinish: (data: any) => void;
  onNetworkStatisticsCalculated: (data: any) => void;
  onClose: () => void;
  isOpen: boolean;
}

const transformData = (data) => {
  // console.log(data)

  // const date = data.Date;
  // console.log(date)
  // return {
  //   "DateStart": `${date[0]}-01-01`,
  //   "DateEnd": `${date[1]}-12-31`,
  //   ...data
  // }

  return data;
}

const {
  schema,
  uiSchema
}= getQueryBuilderSchema()

export const QueryBuilder = (props: QueryBuilderProps) => {
  const {
    isOpen,
    onStart,
    onError,
    onFinish,
    query,
    onClose,
    onNetworkStatisticsCalculated,
  } = props
  const createFormChangeHandler = (tabId) => (e) => {
    updateState((draft) => {
      const tab = draft.tabs.find((item) => item.id === tabId)
      tab.formData = e.formData
    })
  }
  const initialTab = React.useMemo(() => {
    const id = R.uuid()
    const tab = {
      id,
      name: 'Query-0', 
      schema,
      uiSchema,
      formData: query,
      onChange: createFormChangeHandler(id),
    }
    return tab
  }, [])
  const [state, updateState] = useImmer({
    tabs: [
      initialTab,
    ],
    selectedTab: 0,
  })
  const onCreateTab = React.useCallback(() => {
    updateState((draft) => {
      const id = R.uuid()
      const tab = {
        id,
        name: `Query-${draft.tabs.length}`,
        schema,
        uiSchema,
        formData: query,
        onChange: createFormChangeHandler(id),
      }
      draft.tabs.push(tab)
      draft.selectedTab = draft.tabs.length - 1
    })
  },[state])
  const onDeleteTab = React.useCallback((index) => {

    if (state.tabs.length === 1) {
      return
    }
    updateState((draft) => {
      draft.tabs.splice(index, 1)
      draft.selectedTab = draft.tabs.length - 1
    })
  },[state,])
  const formRef= React.useRef()
  const onSubmit = React.useCallback(async e => {
    onStart()
    console.log('START', state)
    const casesDataList = await Promise.all(
      state.tabs.map(async (tab, index) => {
        try {
          let casesData = await API.listCases(transformData(tab.formData))
          // let casesData = prepareData(cases)
          return casesData
          console.log(`RESULT-tab: ${index}`, casesData)
        } catch (e) {
          console.log(e)
          // onError(e)
          return null
        }
      })
    )
    console.log(casesDataList)
    const casesDataMap = {
      nodes: {},
      edges: {},
      message: ''
    }
    casesDataList.filter((item) => !!item).forEach((caseData) => {
      caseData.nodes.forEach((node) => {
        casesDataMap.nodes[node.id] = node
      })
      caseData.edges.forEach((edge) => {
        casesDataMap.edges[edge.id] = edge
      })
      if (caseData.message) {
        casesDataMap.message = caseData.message
      }
    })
    const casesData = {
      nodes: Object.values(casesDataMap.nodes),
      edges: Object.values(casesDataMap.edges),
      message: casesDataMap.message
    }
    const message = casesData.message
    if (casesData.nodes.length == 0) {
      onError(new Error("No cases returned"))
      return
    }
    const allNodes = casesData?.nodes.map((node)=> ({
      id: node.id,
      data: JSON.stringify(node.data)
    }))
    const allEdges = casesData?.edges.map((edge)=> ({ 
      id: edge.id,
      source: edge.source,
      target: edge.target
    }))
    
    let subNetwork = await API.getSubnetwork({
      nodes: allNodes,
      edges: allEdges,
      maxNodes: NODE_LIMIT
    })
    console.log('RESULT getSubnetwork', subNetwork)
    onFinish({
      nodes: subNetwork.nodes,
      edges: subNetwork.edges,
      message,
    })
    let allNodesWithData = await API.batchGetElementData({
      attributesToFetch: NodeAttributes.NETWORKSTATS,
      nodes: allNodes
    })
    console.log('RESULT batchFetchData', allNodesWithData)
    const allNodesData = allNodesWithData?.map((node)=> ({
      id: node.id,
      data: JSON.stringify(node.data)
    }))
    let networkStatistics = await API.getNetworkStatistics({
      nodes: allNodesData,
      edges: allEdges
    })
    console.log('RESULT getNetworkStatistics', networkStatistics)
    onNetworkStatisticsCalculated({
      networkStatistics: networkStatistics,
      message,
      allNodes: allNodesData,
      allEdges,
      subNetwork,
    })
  }, [
    onNetworkStatisticsCalculated,
     onFinish,
      onStart,
       onError,
      state, ])
  // React.useEffect(() => {
  //   setTimeout(()=> {
  //     const  event = new Event('click')
  //     event.persist = ()=>{}
  //     formRef.current.onSubmit(event)
  //   }, 1000)
  // }, [])
  // React.useEffect(() => {
  //   onSubmit()
  // }, [])
  return (
    <Modal
      open={isOpen}
      // onClose={onClose}
      style={{
        display: 'flex',
        // flexDirection: 'column-reverse',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      BackdropProps={{
        // style: {
        //   backgroundColor: 'rgba(0, 0, 0, 0)',
        // },
        // onClick: () => {
        // },
      }}
    >
      <Paper style={{
        display: 'flex',
        flexDirection: 'column',
        width: '80%',
        height: '80%',
        padding: 25,
        overflow: 'scroll'
      }}
      >
        
        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10
          }}
        >
          <Typography variant="h6">Query Builder</Typography>
          <IconButton 
            aria-label="Example"
            onClick={onClose}
            // style={{
            //   position: 'absolute',
            //   right: 24,
            //   top: 24
            // }}
          >
            <CloseIcon  />
          </IconButton>
        </Box>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <QueryTabs
            tabs={state.tabs}
            selectedTab={state.selectedTab}
            onDeleteTab={onDeleteTab}
            onCreateTab={onCreateTab}
            onTabChange={(newIndex) => {
              updateState((draft) => {
                draft.selectedTab = newIndex
              })
            }}
            onSubmit={onSubmit}
          />
        </Box>
      </Paper>
    </Modal>
  )
}


