/* eslint-disable */
// @ts-nocheck
import {
  Backdrop, Button, CircularProgress, createTheme as createMuiTheme, ThemeProvider as MuiThemeProvider, Typography
} from '@material-ui/core'
import { Auth } from 'aws-amplify'
import { View } from 'colay-ui'
import { useImmer } from 'colay-ui/hooks/useImmer'
import * as R from 'colay/ramda'
import { Graph } from 'perfect-graph/components'
import { GraphEditor, GraphEditorProps } from 'perfect-graph/components/GraphEditor'
import { EVENT } from 'perfect-graph/constants'
import {
  DarkTheme,
  DefaultTheme
} from 'perfect-graph/core/theme'
import { useController } from 'perfect-graph/plugins/controller'
import { createSchema } from 'perfect-graph/plugins/createSchema'
import { getSelectedElementInfo, getSelectedItemByElement } from 'perfect-graph/utils'
import React from 'react'
import * as API from './API'
import { AlertContent } from './components/AlertContent'
import { HelpModal } from './components/HelpModal'
import { TermsOfService } from './components/TermsOfService'
import { DataBarHeader } from './components/DataBar/Header'
import { ActionBarRight } from './components/ActionBar/Right'
import { getFetchSchema, getFilterSchema, VIEW_CONFIG_SCHEMA } from './constants'
import defaultData from './data'
import { QueryBuilder } from './QueryBuilder'
import { RenderEdge } from './RenderEdge'
import { RenderNode } from './RenderNode'
import { useUser } from './useUser'
import {
   filterEdges, prepareData
} from './utils'

export const ACTIONS = {
  TEST_API: 'TEST_API',
}

const NODE_LIMIT = 100
const HELP_VIDEO_ID = "OrzMIhLpVps"

const MUIDarkTheme = createMuiTheme({
  palette: {
    mode: 'dark',
  },
});
const MUILightTheme = createMuiTheme({
  palette: {
    mode: 'light',
  },
});

const CHUNK_COUNT = 3

const data = prepareData(defaultData)
type Props = Partial<GraphEditorProps>


const AUTO_CREATED_SCHEMA = {
  schema: createSchema(data.nodes)
}


const AppContainer = ({
  changeMUITheme,
  dispatch,
  width,
  height,
  ...rest
}) => {
  const [user] = useUser()
  const alertRef= React.useRef(null)
  const configRef = React.useRef({
    visualization: {
      nodeSize: null,
      nodeColor: null
    },
    filtering: {
      year: [1900, 2021],
      degree: [0, 100],
      indegree: [0, 100],
      outdegree: [0, 100]
    }
  })

  const FILTER_SCHEMA = React.useMemo(() => getFilterSchema(), [])
  const FETCH_SCHEMA = React.useMemo(() => getFetchSchema({
    onPopupPress: async () => {
      updateState((draft) => {
        draft.queryBuilder.visible = true
      })
    }
  }), [])
  const THEMES = {
    Dark: DarkTheme,
    Default: DefaultTheme
  }
  const NODE_ID = 'http://deeplink.rechtspraak.nl/uitspraak?id=ECLI:NL:HR:2014:3519'
  const filteredDataRef = React.useRef({})
  const [state, updateState] = useImmer({
    queryBuilder: {
      visible: false,
      query: {
        "DataSources": [
            "RS"
        ],
        "Date": [
            1900,
            2021
        ],
        "Instances": [
            "Hoge Raad"
        ],
        "Doctypes": [
            "DEC",
            "OPI"
        ],
        "DegreesSources": 1,
        "DegreesTargets": 1
      },
    },
    helpModal: {
      isOpen: false,
    }
  })
  const ActionBarRightWrapped = React.useMemo(() => () => (
      <ActionBarRight
        dispatch={({ type }) => {
          switch (type) {
            case 'help':
              updateState((draft) => {
                draft.helpModal.isOpen = true
              })
              break;
            case 'testAPI':
              updateState((draft) => {
                draft.helpModal.isOpen = true
              })
              break;
          
            default:
              break;
          }
        }}
      />
      ), [dispatch])
  const [controllerProps, controller] = useController({
    ...data,
    // nodes: [],
    // edges: [],
    // events: RECORDED_EVENTS,
    graphConfig: {
      layout: Graph.Layouts.eular,
      zoom: 0.2,
      nodes: {},
      // clusters: [
      //   {
      //     id: '123',
      //     name: 'SimpleCluster',
      //     ids: [
      //       'http://deeplink.rechtspraak.nl/uitspraak?id=ECLI:NL:HR:2015:3019',
      //       'http://deeplink.rechtspraak.nl/uitspraak?id=ECLI:NL:HR:2015:644',
      //       'http://deeplink.rechtspraak.nl/uitspraak?id=ECLI:NL:HR:2014:3519'
      //     ],
      //     childClusterIds: []
      //   },
      //   {
      //     id: '1234',
      //     name: 'SimpleCluster2',
      //     ids: [
      //       'http://deeplink.rechtspraak.nl/uitspraak?id=ECLI:NL:HR:2015:3019',
      //       'http://deeplink.rechtspraak.nl/uitspraak?id=ECLI:NL:HR:2015:644',
      //       'http://deeplink.rechtspraak.nl/uitspraak?id=ECLI:NL:HR:2014:3519'
      //     ],
      //     childClusterIds: []
      //   }
      // ]
    },
    preferencesModal: {
      // isOpen: true,
    },
    settingsBar: {
      opened: true,
      // forms: [AUTO_CREATED_SCHEMA,FETCH_SCHEMA, VIEW_CONFIG_SCHEMA, {...FILTER_SCHEMA,  formData: configRef.current.filtering}, ],
      forms: [
        { ...FETCH_SCHEMA, formData: configRef.current.fetching },
        VIEW_CONFIG_SCHEMA,
        { ...FILTER_SCHEMA, formData: configRef.current.filtering },
      ],
      createClusterForm: {
        ...FILTER_SCHEMA,
        schema: { ...FILTER_SCHEMA.schema, title: 'Create Cluster', },
        formData: configRef.current.filtering
      },
    },
    dataBar: {
      isOpen: true,
      editable: false,
      header: DataBarHeader,
      sort: (a, b) => {
        const prioritizeKeys = ['ecli', 'cited_by',]
        const aIndex = prioritizeKeys.findIndex((val) => val ===a.key)
        const bIndex = prioritizeKeys.findIndex((val) => val ===b.key)
        if (aIndex === -1 && bIndex === -1) {
          return R.toLower(a.key) < R.toLower(b.key) ? -1 : 1
        }
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex < bIndex ? -1 : 1
        }
        return aIndex > bIndex ? -1 : 1
      }
    },
    actionBar: {
      // isOpen: true,
      right: ActionBarRightWrapped,
      // autoOpen: true,
      eventRecording: false,
      actions: {
        // add: { visible: false },
        // delete: { visible: false },
        layout: {
          schema: {
            title: 'Layout',
            properties: {
              name: {
                type: 'string',
                enum: [
                  'cose', 'breadthfirst', 'circle', 'grid',
                  'euler', 'dagre', 'spread',
                ],
              },
              animationDuration: {
                type: 'number',
                minimum: 0,
                maximum: 10000,
              },
              refresh: {
                type: 'number',
                minimum: 0,
                maximum: 100,
              },
              maxIterations: {
                type: 'number',
                minimum: 0,
                maximum: 1000,
              },
              maxSimulationTime: {
                type: 'number',
                minimum: 0,
                maximum: 1000,
              },
            },
          }
        }
      },
      theming: {
        options: [
          {
            name: 'Dark',
            value: 'Dark',
          },
          {
            name: 'Default',
            value: 'Default',
          }
        ],
        value: 'Default'
      },
    },
    onEvent: async ({
      type,
      payload,
      elementId,
      graphRef,
      graphEditor,
      update,
      state,
    }, draft) => {
      const {
        cy,
      } = graphEditor
      const element = cy.$id(elementId)
      const {
        item: selectedItem,
        index: selectedItemIndex,
      } = (element && getSelectedItemByElement(element, draft)) ?? {}
      switch (type) {
        case EVENT.ELEMENT_SELECTED: {
          // draft.isLoading = true
          const {
            itemIds,
          } = payload
          draft.selectedElementIds = itemIds
          const {
            selectedItem
          } = getSelectedElementInfo(draft, graphEditor)
          let elementData = null
          try {
            elementData = await API.getElementData({ id: selectedItem.data.ecli });
          } catch (error) {
            alertRef.current.alert({
              text: JSON.stringify(error),
              type: 'error'
            })
            console.error(error)
          }
          
          if (elementData && !R.isEmpty(elementData)) {
            selectedItem.data = elementData
          } else {
            // alertRef.current.alert({
            //   type: 'warning',
            //   text: 'Data is not available!'
            // })
          }
          break
        }
        case EVENT.CREATE_CLUSTER_FORM_SUBMIT: {
          const {
            name,
            formData,
          } = payload
          const {
            year,
            degree,
            indegree,
            outdegree
          } = formData
          const clusterItemIds = draft.nodes.filter((item) => {
            const element = cy.$id(item.id)
            return (
              R.inBetween(year[0], year[1])(item.data.year)
              && R.inBetween(degree[0], degree[1])(element.degree())
              && R.inBetween(indegree[0], indegree[1])(element.indegree())
              && R.inBetween(outdegree[0], outdegree[1])(element.outdegree())

            )
          }).map((item) => item.id)
          draft.graphConfig.clusters.push({
            id: R.uuid(),
            name,
            ids: clusterItemIds,
            childClusterIds: []
          })
          return false
        }
        case EVENT.SETTINGS_FORM_CHANGED: {
          draft.settingsBar.forms[payload.index].formData = payload.value
          if (payload.form.schema.title === FILTER_SCHEMA.schema.title) {
            configRef.current = {
              ...configRef.current,
              filtering: payload.value
            }
            draft.graphConfig.nodes.filter = {
              test: ({ element, item }) => {
                const {
                  year,
                  degree,
                  indegree,
                  outdegree
                } = payload.value
                return (
                  R.inBetween(year[0], year[1])(item.data.year)
                  && R.inBetween(degree[0], degree[1])(element.degree())
                  && R.inBetween(indegree[0], indegree[1])(element.indegree())
                  && R.inBetween(outdegree[0], outdegree[1])(element.outdegree())

                )
              },
              settings: {
                opacity: 0.2
              }
            }

          } else {
            configRef.current = {
              ...configRef.current,
              visualization: payload.value
            }
          }
          return false
          break
        }

        case EVENT.CHANGE_THEME: {
          const {
            value
          } = payload
          draft.graphConfig.theme = THEMES[value]
          changeMUITheme(value)
          draft.actionBar.theming.value = value
          return false
          break
        }
        default:
          break;
      }
      return null
    }
  })
  
  React.useEffect(() => {
    setTimeout(() => {
      controller.update((draft, { graphEditorRef }) => {
        try {
          const { hitArea } = graphEditorRef.current.viewport
          const margin = 500
          const boundingBox = {
            x1: hitArea.x + margin,
            y1: hitArea.y + margin,
            w: hitArea.width - 2*margin,
            h: hitArea.height - 2*margin,
          }
          const layout = Graph.Layouts.cose
            draft.graphConfig!.layout = {
              ...layout,
              animationDuration: 0,
              boundingBox,
            } 
        } catch (error) {
          console.log('error',error)
        }
      })
    }, 1000)
}, [])
  return (
    <View
      style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}
    >
      <GraphEditor
        {...controllerProps}
        // {...R.omit(['eventHistory', ])(controllerProps)}
        extraData={[configRef.current]}
        style={{ width, height }}
        renderNode={(props) => (
          <RenderNode
            {...props}
            {...configRef.current}
            graphEditorRef={controllerProps.ref}
          />
        )}
        renderEdge={(props) => (
          <RenderEdge
            {...props}
            graphEditorRef={controllerProps.ref}
          />
        )}
        {...rest}
      />
      <QueryBuilder
        isOpen={state.queryBuilder.visible}
        query={state.queryBuilder.query}
        onClose={() => updateState((draft) => {
          draft.queryBuilder.visible = false
        })}
        onStart={() => {
          controller.update((draft) => {
            draft.isLoading = true
          })
          updateState((draft) => {
            draft.queryBuilder.visible = false
          })
        }}
        onError={(error) => {
          controller.update((draft) => {
            draft.isLoading = false
          })
          updateState((draft) => {
            draft.queryBuilder.visible = true
          })
          alertRef.current.alert({
            type: 'warning',
            text: error.message
          })
        }}
        onFinish={({
          nodes: nodes_ = [],
          edges= [],
          networkStatistics,
          message
        } = {}) => {
          controller.update((draft) => {
            const nodes = R.take(NODE_LIMIT, nodes_)
            draft.nodes = nodes
            draft.edges = filterEdges(nodes)(edges)
            draft.networkStatistics = {
              local: networkStatistics
            }
            draft.isLoading = false
          })
          setTimeout(() => {
            controller.update((draft) => {
            draft.graphConfig!.layout = {...Graph.Layouts.circle}
            })
          },250)
          if (message) {
            alertRef.current.alert({
              type: 'warning',
              text: message
            })
          }
        }}
      />
      <HelpModal 
        isOpen={state.helpModal.isOpen}
        onClose={() => updateState((draft) => {
          draft.helpModal.isOpen = false
        })}
        videoId={HELP_VIDEO_ID}
      />
      <TermsOfService
          user={user}
          onAgree={async () => {
            updateState((draft) => {
              draft.helpModal.isOpen = true
            })
            await Auth.updateUserAttributes(user, {
              'custom:isOldUser': 'yes'
            })
          }}
          // onDisagree={() => {
          //   alert('To proceed on signin, you need to accept the Terms of Usage!')
          // }}
        />
        <AlertContent 
          ref={alertRef}
        />
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={controllerProps.isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </View>
  )
}


const MUI_THEMES = {
  Dark: MUIDarkTheme,
  Light: MUILightTheme,
}

export default (props: Props) => {
  const [theme, setTheme] = React.useState(MUI_THEMES.Light)
  return (
    <MuiThemeProvider theme={theme}>
      <AppContainer
        changeMUITheme={(name) => setTheme(MUI_THEMES[name])}
        {...props}
      />
    </MuiThemeProvider>
  )
}
