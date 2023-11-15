// @ts-nocheck
import React from 'react'
import Form from '@rjsf/material-ui'
import * as API from '../API'
import {Modal, Button, Box, Typography, TextField, Paper, IconButton} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import {getQueryBuilderSchema, DEFAULT_FORM_DATA} from './constants'
import {NodeAttributes} from '../../../src/API'
import {NODE_LIMIT} from '..'
import {QueryTabs} from './QueryTabs'
import {useImmer} from 'colay-ui/hooks/useImmer'
import * as R from 'colay/ramda'
import {AlertContent} from '../components/AlertContent'

export type QueryBuilderProps = {
  query: any
  onStart: () => void
  onError: (e: Error) => void
  onFinish: (data: any) => void
  onClose: () => void
  isOpen: boolean
}
const transformData = data => {
  // console.log(data)

  // const date = data.Date;
  // console.log(date)
  // return {
  //   "DateStart": `${date[0]}-01-01`,
  //   "DateEnd": `${date[1]}-12-31`,
  //   ...data
  // }

  return data
}
const {schema, uiSchema} = getQueryBuilderSchema()

export const QueryBuilder = (props: QueryBuilderProps) => {
  const {isOpen, onStart, onError, onFinish, query, onClose, onNetworkStatisticsCalculated} = props
  const alertRef = React.useRef(null)
  const createFormChangeHandler = tabId => e => {
    updateState(draft => {
      const tab = draft.tabs.find(item => item.id === tabId)
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
      onChange: createFormChangeHandler(id)
    }
    return tab
  }, [])
  const [state, updateState] = useImmer({
    tabs: [initialTab],
    selectedTab: 0
  })
  const onCreateTab = React.useCallback(() => {
    updateState(draft => {
      const id = R.uuid()
      const tab = {
        id,
        name: `Query-${draft.tabs.length}`,
        schema,
        uiSchema,
        formData: query,
        onChange: createFormChangeHandler(id)
      }
      draft.tabs.push(tab)
      draft.selectedTab = draft.tabs.length - 1
    })
  }, [state])
  const onDeleteTab = React.useCallback(
    index => {
      if (state.tabs.length === 1) {
        return
      }
      updateState(draft => {
        draft.tabs.splice(index, 1)
        draft.selectedTab = draft.tabs.length - 1
      })
    },
    [state]
  )
  const formRef = React.useRef()
  const onSubmit = React.useCallback(
    async e => {
      onStart()
      console.log('START', state)
      var invalid_query = false
      const casesDataList = await Promise.all(
        state.tabs.map(async (tab, index) => {
          try {
            var all_required_fields = true
            var error = `The following error(s) were found in Query-${index}:\n`

            // validating Data Sources
            if (tab.formData.DataSources.length === 0) {
              error += '* One or more Data Sources required\n'
              highlightInputError('root_DataSources')
              all_required_fields = false
            }

            // validating Documents Types
            if (tab.formData.Doctypes.length === 0) {
              error += '* One or more Document Types required\n'
              highlightInputError('root_Doctypes')
              all_required_fields = false
            }

            // validating Date Start
            if (Number.isNaN(Date.parse(tab.formData.DateStart))) {
              error += `* Date Start required\n`
              highlightInputError('root_DateStart')
              all_required_fields = false
            }

            // validating Date End
            if (Number.isNaN(Date.parse(tab.formData.DateEnd))) {
              error += `* Date End required\n`
              highlightInputError('root_DateEnd')
              all_required_fields = false
            }

            // validating Degrees Sources
            if (!Number.isFinite(tab.formData.DegreesSources)) {
              error += `* One or more Degree Sources required\n`
              highlightInputError('root_DegreesSources')
              all_required_fields = false
            }

            // validating Degrees Target
            if (!Number.isFinite(tab.formData.DegreesTargets)) {
              error += `* One or more Degree Targets required\n`
              highlightInputError('root_DegreesTargets')
              all_required_fields = false
            }

            const at_least_one_of =
              tab.formData.Eclis?.length > 0 ||
              tab.formData.Keywords?.length > 0 ||
              tab.formData.Articles?.length > 0 ||
              tab.formData.Domains?.length > 0 ||
              tab.formData.Instances?.length > 0

            if (!at_least_one_of) {
              error += `* At least one of these parameters required\n`
              highlightInputError('root_Eclis')
              highlightInputError('root_Keywords')
              highlightInputError('root_Articles')
              highlightInputError('root_Domains')
              highlightInputError('root_Instances')
            }

            if (all_required_fields && at_least_one_of) {
              let casesData = await API.listCases(transformData(tab.formData))
              // let casesData = prepareData(cases)
              return casesData
            } else {
              onError(new Error(error))
              invalid_query = true
            }
          } catch (e) {
            console.log(e)
            // onError(e)
            return null
          }
        })
      )
      if (invalid_query) {
        console.log('INVALID QUERY')
        return
      }
      console.log(casesDataList)
      const casesDataMap = {
        nodes: {},
        edges: {},
        message: ''
      }
      casesDataList
        .filter(item => !!item)
        .forEach(caseData => {
          caseData.nodes.forEach(node => {
            casesDataMap.nodes[node.id] = node
          })
          caseData.edges.forEach(edge => {
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
        onError(new Error('No cases returned'))
        return
      }
      const allNodes = casesData?.nodes.map(node => ({
        id: node.id,
        data: JSON.stringify(node.data)
      }))
      const allEdges = casesData?.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target
      }))

      const networkStatistics = await API.getNetworkStatistics({
        nodes: allNodes,
        edges: allEdges
      })
      onFinish({
        nodes: casesData?.nodes,
        edges: allEdges,
        stats: networkStatistics,
        message
      })
      console.log('All', allNodes, allEdges)
    },
    [onFinish, onStart, onError, state]
  )
  return (
    <>
      <Modal
        open={isOpen}
        // onClose={onClose}
        style={{
          display: 'flex',
          // flexDirection: 'column-reverse',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        BackdropProps={
          {
            // style: {
            //   backgroundColor: 'rgba(0, 0, 0, 0)',
            // },
            // onClick: () => {
            // },
          }
        }
      >
        <Paper
          style={{
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
            <IconButton aria-label="Example" onClick={onClose}>
              <CloseIcon />
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
              onTabChange={newIndex => {
                updateState(draft => {
                  draft.selectedTab = newIndex
                })
              }}
              onSubmit={onSubmit}
            />
          </Box>
        </Paper>
      </Modal>

      <AlertContent ref={alertRef} />
    </>
  )
}
function highlightInputError(elem_id) {
  const elem = document.getElementById(elem_id)?.parentNode?.lastChild
  elem.setAttribute('style', 'border:red solid 1px !important;')
  setTimeout(() => {
    elem.setAttribute('style', '')
  }, 3500)
}
