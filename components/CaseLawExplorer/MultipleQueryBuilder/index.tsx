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
  onClose: () => void;
  isOpen: boolean;
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
          const casesData = await API.listCases(tab.formData)
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

    const subNetwork = await API.getSubnetwork({
      nodes: allNodes,
      edges: allEdges,
      maxNodes: NODE_LIMIT
    })
    const networkStatistics = await API.getNetworkStatistics({
        nodes: subNetwork.nodes,
        edges: subNetwork.edges
    })
    console.log('RESULT getSubnetwork', subNetwork)
    onFinish({
      nodes: subNetwork.nodes,
      edges: subNetwork.edges,
      stats: networkStatistics,
      message,
    })
    console.log('All', allNodes, allEdges)
  },
  [
      onFinish,
      onStart,
      onError,
      state,
    ]
  )
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
