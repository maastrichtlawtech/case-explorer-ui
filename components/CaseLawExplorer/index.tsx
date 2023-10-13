/* eslint-disable */
// @ts-nocheck
import {
  Backdrop,
  CircularProgress,
  createTheme as createMuiTheme,
  ThemeProvider as MuiThemeProvider,
  Button,
} from "@mui/material";
import { View } from "colay-ui";
import { useImmer } from "colay-ui/hooks/useImmer";
import { current } from "immer";
import * as R from "colay/ramda";
import { Graph } from "perfect-graph/components";
import {
  GraphEditor,
  GraphEditorProps,
} from "perfect-graph/components/GraphEditor";
import {
  DefaultComponents,
  DefaultSidebarData,
} from "perfect-graph/components/GraphEditor/PreferencesModal";
import { EVENT } from "perfect-graph/constants";
import { DarkTheme, DefaultTheme } from "perfect-graph/core/theme";
import { useGraphEditor } from "perfect-graph/hooks";
import { useController } from "perfect-graph/plugins/controller";
import { createSchema } from "perfect-graph/plugins/createSchema";
import {
  filterEdges,
  getHitAreaCenter,
  getSelectedElementInfo,
  getSelectedItemByElement,
} from "perfect-graph/utils";
import * as PIXI from "pixi.js";
import React from "react";
import * as API from "./API";
import { ActionBarRight } from "./components/ActionBar/Right";
import { AlertContent } from "./components/AlertContent";
import { DataBarHeader } from "./components/DataBar/Header";
import { DeveloperSettings } from "./components/DeveloperSettings";
import { HelpModal } from "./components/HelpModal";
import {
  getFetchSchema,
  getFilterSchema,
  LAYOUT_SCHEMA,
  NODE_SIZE_RANGE_MAP,
  VIEW_CONFIG_SCHEMA,
} from "./constants";
import { QueryBuilder } from "./MultipleQueryBuilder";
import { RenderEdge } from "./RenderEdge";
import { RenderNode } from "./RenderNode";
import { calculateNetworkStatisticsRange } from "./utils";
import {
  FullGraphContext,
  ControllerContext,
  UIStateContext,
} from "./Contexts";
import ClusterCache from "./ClusterCache";
import { clusterGraph } from "./cluster_graph";

export const ACTIONS = {
  TEST_API: "TEST_API",
};

const DEFAULT_LAYOUT = Graph.Layouts.cose;
export const NODE_LIMIT = 2000;
const HELP_VIDEO_ID = "OrzMIhLpVps";

const overrideTheme = (theme) => {
  Object.keys(theme.typography).forEach((key) => {
    if (theme.typography[key]?.fontSize) {
      theme.typography[key].fontSize =
        Number(theme.typography[key].fontSize.replace("rem", "")) * 16 * 0.8;
    }
  });
  return theme;
};
const MUIDarkTheme = overrideTheme(
  createMuiTheme({
    palette: {
      mode: "dark",
    },
    spacing: 4,
    components: {
      MuiTextField: {
        defaultProps: {
          size: "small",
        },
      },
    },
  })
);

const MUILightTheme = overrideTheme(
  createMuiTheme({
    palette: {
      mode: "light",
    },
    spacing: 4,
    components: {
      MuiTextField: {
        defaultProps: {
          size: "small",
        },
      },
    },
  })
);

const COUNT = 700;
const data = {
  nodes: [],
  edges: [],
};
type Props = Partial<GraphEditorProps>;

const AUTO_CREATED_SCHEMA = {
  schema: createSchema(data.nodes),
};

const DEFAULT_FILTERING = {
  year: [1900, 2021],
  degree: [0, 100],
  indegree: [0, 100],
  outdegree: [0, 100],
  community: [],
};

const DEFAULT_VISUALIZATION = {
  nodeSize: "in-degree",
  nodeColor: "community",
};

function updateCachedNodePosition(cluster, layout, cy, nodeId, position) {
  const clusterInfo = ClusterCache.get(cluster);
  if (clusterInfo && clusterInfo?.locations && clusterInfo.lastLayout) {
    if (clusterInfo.lastLayout === JSON.stringify(layout)) {
      clusterInfo.locations[nodeId] = position;
    }
  }
}

async function updateLayout(cluster, layout, graphEditor, nodes, edges, cy) {
  const layoutName = layout.name;
  const { hitArea } = graphEditor.viewport;
  const boundingBox = {
    x1: hitArea.x,
    y1: hitArea.y,
    w: hitArea.width,
    h: hitArea.height,
  };

  var layoutResult = null;
  const clusterInfo = ClusterCache.get(cluster);
  if (clusterInfo && clusterInfo?.locations && clusterInfo.lastLayout) {
    if (clusterInfo.lastLayout === JSON.stringify(layout)) {
      layoutResult = clusterInfo.locations;
    }
  }
  if (!layoutResult) {
    layoutResult = await API.calculateLayout({
      nodes,
      edges,
      layoutName,
      boundingBox,
    });
    clusterInfo.locations = layoutResult;
    clusterInfo.lastLayout = JSON.stringify(layout);
  }

  console.log("layout res", layoutResult);
  Object.keys(layoutResult).forEach((key) => {
    const { x, y } = layoutResult[key];
    const element = cy.$id(key);
    element.position({ x, y });
  });
}

const AppContainer = ({ changeMUITheme, dispatch, width, height, ...rest }) => {
  const alertRef = React.useRef(null);
  const configRef = React.useRef({
    visualization: DEFAULT_VISUALIZATION,
    visualizationRangeMap: {},
    filtering: DEFAULT_FILTERING,
    // fetching: ,
  });

  const FILTER_SCHEMA = React.useMemo(() => getFilterSchema(), []);
  const FETCH_SCHEMA = React.useMemo(
    () =>
      getFetchSchema({
        onPopupPress: async () => {
          updateState((draft) => {
            draft.queryBuilder.visible = true;
          });
        },
      }),
    []
  );

  const THEMES = {
    Dark: DarkTheme,
    Default: DefaultTheme,
  };

  const NODE_ID =
    "http://deeplink.rechtspraak.nl/uitspraak?id=ECLI:NL:HR:2014:3519";

  const filteredDataRef = React.useRef({});
  const [state, updateState] = useImmer({
    queryBuilder: {
      visible: true,
      query: {
        DataSources: ["RS"],
        // Keywords: "werkgever* + aansprake* + BW",
        // Articles: "Wetboek van Strafrecht, Artikel 420bis",
        // "Date": [
        //     1900,
        //     2021
        // ],
        DateStart: "1900-01-01",
        DateEnd: "2021-01-01",
        Instances: ["Hoge Raad"],
        Domains: [],
        Doctypes: ["DEC"],
        DegreesSources: 0,
        DegreesTargets: 1,
      },
      // {
      //   "DataSources": [
      //       "RS"
      //   ],
      //   "Instances": [
      //       "Hoge Raad",
      //       "Raad van State",
      //       "Centrale Raad van Beroep",
      //       "College van Beroep voor het bedrijfsleven",
      //       "Gerechtshof Amsterdam",
      //       "Gerechtshof Arnhem-Leeuwarden",
      //       "Gerechtshof 's-Gravenhage",
      //       "Gerechtshof 's-Hertogenbosch",
      //       "Rechtbank Amsterdam",
      //       "Rechtbank 's-Gravenhage",
      //       "Rechtbank Gelderland",
      //       "Rechtbank Limburg",
      //       "Rechtbank Midden-Nederland",
      //       "Rechtbank Noord-Holland",
      //       "Rechtbank Noord-Nederland",
      //       "Rechtbank Oost-Brabant",
      //       "Rechtbank Overijssel",
      //       "Rechtbank Rotterdam",
      //       "Rechtbank Zeeland-West-Brabant"
      //   ],
      //   "Domains": [],
      //   "Doctypes": [
      //       "DEC"
      //   ],
      //   "DateStart": "1900-01-01",
      //   "DateEnd": "2021-01-01",
      //   "DegreesSources": 0,
      //   "DegreesTargets": 1,
      //   "Keywords": "werkgever* + aansprake* + BW"
      // }
    },
    helpModal: {
      isOpen: false,
    },
  });

  /* Stores data of the full unclustered graph */
  const [fullGraph, updateFullGraph] = useImmer({
    nodes: [],
    edges: [],
    networkStatistics: [],
  });

  const [controllerProps, controller] = useController({
    nodes: [],
    edges: [],
    // events: RECORDED_EVENTS,
    activeCluster: null,
    networkStatistics: {
      local: {},
      global: {},
      sort: {
        local: (a, b) => {
          const prioritizeKeys = [
            "degree",
            "in-degree",
            "out-degree",
            "degree centrality",
            "in-degree centrality",
            "out-degree centrality",
            "relative in-degree",
            "pageRank",
            "authorities",
            "hubs",
            "betweenness centrality",
            "closeness centrality",
            "community",
            "year",
          ];
          const aIndex = prioritizeKeys.findIndex((val) => val === a.key);
          const bIndex = prioritizeKeys.findIndex((val) => val === b.key);
          if (aIndex === -1 && bIndex === -1) {
            return R.toLower(a.key) < R.toLower(b.key) ? -1 : 1;
          }
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex < bIndex ? -1 : 1;
          }
          return aIndex > bIndex ? -1 : 1;
        },
      },
    },
    graphConfig: {
      layout: DEFAULT_LAYOUT,
      zoom: 0.1,
      nodes: {},
      edges: {
        view: {
          labelVisible: false,
        },
      },
    },
    preferencesModal: {
      // isOpen: true,
      sidebar: [
        ...DefaultSidebarData,
        {
          id: "Developer",
          icon: null,
          label: "Developer",
        },
      ],
      components: {
        ...DefaultComponents,
        Developer: () => <DeveloperSettings />,
      },
    },
    settingsBar: {
      // isOpen: true,
      forms: [
        { ...FETCH_SCHEMA, formData: configRef.current.fetching },
        { ...VIEW_CONFIG_SCHEMA, formData: configRef.current.visualization },
        { ...FILTER_SCHEMA, formData: configRef.current.filtering },
      ],
      createClusterForm: {
        ...FILTER_SCHEMA,
        schema: { ...FILTER_SCHEMA.schema, title: "Create Cluster" },
        formData: configRef.current.filtering,
      },
      defaults: {
        layout: {
          ...LAYOUT_SCHEMA,
        },
      },
    },
    dataBar: {
      isOpen: true,
      editable: false,
      header: DataBarHeader,
      sort: (a, b) => {
        const prioritizeKeys = [
          "ecli_opinion",
          "cited_by",
          "summary",
          "url_publication",
        ];
        const aIndex = prioritizeKeys.findIndex((val) => val === a.key);
        const bIndex = prioritizeKeys.findIndex((val) => val === b.key);
        if (aIndex === -1 && bIndex === -1) {
          return R.toLower(a.key) < R.toLower(b.key) ? -1 : 1;
        }
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex < bIndex ? -1 : 1;
        }
        return aIndex > bIndex ? -1 : 1;
      },
    },
    actionBar: {
      // isOpen: true,
      right: ActionBarRight,
      // autoOpen: true,
      eventRecording: false,
      actions: {
        add: { visible: false },
        delete: { visible: false },
      },
      theming: {
        options: [
          {
            name: "Dark",
            value: "Dark",
          },
          {
            name: "Bright",
            value: "Default",
          },
        ],
        value: "Default",
      },
    },
    onEvent: (
      { type, payload, elementId, graphRef, graphEditor, update, state },
      draft
    ) => {
      const { cy, context: graphEditorContext } = graphEditor;
      const element = cy.$id(elementId);
      const { item: selectedItem, index: selectedItemIndex } =
        (element && getSelectedItemByElement(element, draft)) ?? {};
      switch (type) {
        case EVENT.ELEMENT_SELECTED: {
          // draft.isLoading = true
          const { itemIds } = payload;
          draft.selectedElementIds = itemIds;
          const { selectedItem } = getSelectedElementInfo(draft, graphEditor);
          const node = {
            id: selectedItem.id,
            data: JSON.stringify(selectedItem.data),
          };
          const layout = current(draft.graphConfig!.layout) ?? DEFAULT_LAYOUT;
          const nodeId = selectedItem.id;
          const position = cy.$id(nodeId).position();
          updateCachedNodePosition(
            draft.activeCluster,
            layout,
            cy,
            nodeId,
            position
          );
          const call = async () => {
            let elementData = null;
            try {
              elementData = await API.getElementData({ node: node });
            } catch (error) {
              alertRef.current.alert({
                text: JSON.stringify(error),
                type: "error",
              });
              console.error(error);
            }

            if (elementData && !R.isEmpty(elementData)) {
              controller.update((draft, { graphEditorRef }) => {
                const { selectedItem } = getSelectedElementInfo(
                  draft,
                  graphEditorRef.current
                );
                if (selectedItem) {
                  selectedItem.data = {
                    ...selectedItem.data,
                    ...elementData,
                  };
                }
              });
            }
          };
          call();
          break;
        }
        case EVENT.CREATE_CLUSTER_FORM_SUBMIT: {
          const { name, formData } = payload;
          const { year, degree, indegree, outdegree, community } = formData;
          const {
            networkStatistics: { local: localNetworkStatistics },
          } = graphEditor.context;
          const clusterItemIds = draft.nodes
            .filter((item) => {
              const stats = localNetworkStatistics?.[item.id] ?? {};
              const element = cy.$id(item.id);
              return (
                R.inBetween(year[0], year[1])(stats.year) &&
                R.inBetween(degree[0], degree[1])(stats.degree) &&
                R.inBetween(indegree[0], indegree[1])(stats["in-degree"]) &&
                R.inBetween(outdegree[0], outdegree[1])(stats["out-degree"]) &&
                !(
                  R.isNotNil(community) &&
                  !R.isEmpty(community) &&
                  !community.includes(`${stats.community}`)
                )
              );
            })
            .map((item) => item.id);
          draft.graphConfig.clusters.push({
            id: R.uuid(),
            name,
            ids: clusterItemIds,
            childClusterIds: [],
            position: getHitAreaCenter(graphEditor),
          });
          return false;
        }
        case EVENT.SETTINGS_FORM_CHANGED: {
          draft.settingsBar.forms[payload.index].formData = payload.value;
          if (payload.form.schema.title === FILTER_SCHEMA.schema.title) {
            configRef.current = {
              ...configRef.current,
              filtering: payload.value,
            };
            draft.graphConfig.nodes.filter = {
              test: ({ element, item }) => {
                const {
                  year,
                  degree,
                  indegree,
                  outdegree,
                  isResult,
                  community,
                } = payload.value;
                const {
                  networkStatistics: { local: localNetworkStatistics },
                } = graphEditor.context;
                const stats = localNetworkStatistics?.[item.id] ?? {};
                // TODO: Change to network statistics data
                return (
                  R.inBetween(year[0], year[1])(stats.year) &&
                  R.inBetween(degree[0], degree[1])(stats.degree) &&
                  R.inBetween(indegree[0], indegree[1])(stats["in-degree"]) &&
                  R.inBetween(
                    outdegree[0],
                    outdegree[1]
                  )(stats["out-degree"]) &&
                  !(isResult && !(item.data.isResult === "True")) &&
                  !(
                    R.isNotNil(community) &&
                    !R.isEmpty(community) &&
                    !community.includes(`${stats.community}`)
                  )
                );
              },
              settings: {
                opacity: 0.2,
              },
            };
          } else {
            configRef.current = {
              ...configRef.current,
              visualization: payload.value,
            };
          }
          return false;
        }

        case EVENT.CHANGE_THEME: {
          const { value } = payload;
          console.log("CHANGE_THEME", payload, value);
          draft.graphConfig.theme = THEMES[value];
          changeMUITheme(value);
          draft.actionBar.theming.value = value;
          return false;
        }
        case EVENT.LAYOUT_CHANGED: {
          // break
          if (payload.value.expansion) {
            graphEditor.viewport.setZoom(payload.value.expansion, true);
          }
          const layoutName = payload.value.name;
          // Create a copy of nodes with the data part removed, as it is
          // unexpected by the layout calculator GraphQL query
          const nodes = draft.nodes.map((item) => ({
            id: item.id,
          }));
          const edges = current(draft.edges);
          let layout: any;
          if (layoutName) {
            layout = R.pickBy((val) => R.isNotNil(val))({
              // @ts-ignore
              ...Graph.Layouts[layoutName],
              ...payload.value,
              runLayout: false,
            });
          }
          draft.graphConfig!.layout = layout;
          const activeCluster = draft.activeCluster;
          setTimeout(() => {
            updateLayout(activeCluster, layout, graphEditor, nodes, edges, cy);
          });
          return false;
        }
        case "REDRAW_EVENT": {
          const layout = current(draft.graphConfig!.layout) ?? DEFAULT_LAYOUT;
          // Create a copy of nodes with the data part removed, as it is
          // unexpected by the layout calculator GraphQL query
          const nodes = draft.nodes.map((item) => ({
            id: item.id,
          }));
          const edges = current(draft.edges);

          const activeCluster = draft.activeCluster;
          setTimeout(() => {
            updateLayout(activeCluster, layout, graphEditor, nodes, edges, cy);
          });
          alertRef.current.alert({
            type: "success",
            text: `Display updated!`,
          });
          return false;
        }
        default:
          break;
      }
      return null;
    },
  });

  React.useEffect(() => {
    controller.update((draft, { graphEditorRef }) => {
      try {
        const { hitArea } = graphEditorRef.current.viewport;
        const margin = 500;
        const boundingBox = {
          x1: hitArea.x + margin,
          y1: hitArea.y + margin,
          w: hitArea.width - 2 * margin,
          h: hitArea.height - 2 * margin,
        };
        const layout = DEFAULT_LAYOUT;
        draft.graphConfig!.layout = {
          ...layout,
          animationDuration: 0,
          boundingBox,
        };
      } catch (error) {
        console.log("error", error);
      }
    });
  }, []);

  React.useEffect(() => {
    if (fullGraph.nodes.length === 0) {
      return () => {};
    }

    const { nodes, edges } = clusterGraph(fullGraph);
    controller.update((draft) => {
      draft.isLoading = false;
      draft.nodes = nodes;
      draft.edges = edges;
      draft.activeCluster = null;
    });
  }, [fullGraph]);

  React.useEffect(() => {
    if (controllerProps.nodes.length == 0) {
      return () => {};
    }

    const networkStatistics = controllerProps.networkStatistics.global;
    const call = async () => {
      const { nodeSizeRangeMap, communityStats } =
        calculateNetworkStatisticsRange(networkStatistics, {
          nodes: controllerProps.nodes,
          edges: controllerProps.edges,
        });
      console.log("communityStats", communityStats, nodeSizeRangeMap);
      configRef.current.visualizationRangeMap = nodeSizeRangeMap;
      controller.update((draft) => {
        const filterSchema = draft.settingsBar.forms[2].schema;
        const filterFormData = draft.settingsBar.forms[2].formData;
        filterSchema.properties.community = {
          type: "array",
          uniqueItems: true,
          items: {
            enum: communityStats.map((item) => item.key),
            enumNames: communityStats.map(
              (item) => `Community: ${item.key}: ${item.value} nodes`
            ),
            type: "string",
          },
          default: [],
        };
        filterSchema.properties.year.items.minimum = nodeSizeRangeMap.year[0];
        filterSchema.properties.year.items.maximum = nodeSizeRangeMap.year[1];
        filterSchema.properties.degree.items.minimum =
          nodeSizeRangeMap.degree[0];
        filterSchema.properties.degree.items.maximum =
          nodeSizeRangeMap.degree[1];
        filterSchema.properties.indegree.items.minimum =
          nodeSizeRangeMap["in-degree"][0];
        filterSchema.properties.indegree.items.maximum =
          nodeSizeRangeMap["in-degree"][1];
        filterSchema.properties.outdegree.items.minimum =
          nodeSizeRangeMap["out-degree"][0];
        filterSchema.properties.outdegree.items.maximum =
          nodeSizeRangeMap["out-degree"][1];
        filterFormData.year = nodeSizeRangeMap.year;
        filterFormData.degree = nodeSizeRangeMap.degree;
        filterFormData.indegree = nodeSizeRangeMap["in-degree"];
        filterFormData.outdegree = nodeSizeRangeMap["out-degree"];

        const createClusterForm = draft.settingsBar?.createClusterForm!;
        createClusterForm.schema.properties.community =
          filterSchema.properties.community;
      });
      controller.onEvent({ type: "REDRAW_EVENT" });
    };
    call();
  }, [
    controllerProps.activeCluster,
    controllerProps.nodes,
    controllerProps.edges,
  ]);

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      <UIStateContext.Provider value={{ state, updateState }}>
        <FullGraphContext.Provider value={{ fullGraph, updateFullGraph }}>
          <ControllerContext.Provider
            value={{ controller, activeCluster: controllerProps.activeCluster }}
          >
            <GraphEditor
              {...controllerProps}
              extraData={[
                configRef.current,
                configRef.current.visualizationRangeMap,
                controllerProps.netowrkStatistics?.local,
              ]}
              style={{ width, height }}
              renderNode={(props) => (
                <RenderNode
                  {...props}
                  {...configRef.current}
                  graphEditorRef={controllerProps.ref}
                  controllerProps={controllerProps}
                  fullGraph={fullGraph}
                />
              )}
              renderEdge={(props) => (
                <RenderEdge {...props} graphEditorRef={controllerProps.ref} />
              )}
              {...rest}
            />
          </ControllerContext.Provider>
        </FullGraphContext.Provider>
      </UIStateContext.Provider>
      <QueryBuilder
        isOpen={state.queryBuilder.visible}
        query={state.queryBuilder.query}
        onClose={() =>
          updateState((draft) => {
            draft.queryBuilder.visible = false;
          })
        }
        onStart={() => {
          configRef.current = {
            filtering: DEFAULT_FILTERING,
            visualization: DEFAULT_VISUALIZATION,
            visualizationRangeMap: NODE_SIZE_RANGE_MAP,
          };
          controller.update((draft) => {
            draft.isLoading = true;
            draft.graphConfig.nodes.filter = null;
            draft.settingsBar.forms[1].formData =
              configRef.current.visualization;
            draft.settingsBar.forms[2].formData = configRef.current.filtering;
          });
          updateState((draft) => {
            draft.queryBuilder.visible = false;
          });
        }}
        onError={(error) => {
          controller.update((draft) => {
            draft.isLoading = false;
          });
          updateState((draft) => {
            draft.queryBuilder.visible = true;
          });
          alertRef.current.alert({
            type: "warning",
            text: error.message,
          });
        }}
        onFinish={({ nodes, edges, stats, message }) => {
          PIXI.settings.ROUND_PIXELS = false; // true
          // @ts-ignore
          PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.LOW;
          PIXI.settings.RESOLUTION = 1; // 32// 64// window.devicePixelRatio
          PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
          PIXI.settings.SPRITE_BATCH_SIZE = 4096 * 4;

          ClusterCache.reset();
          updateFullGraph((draft) => {
            draft.nodes = nodes;
            draft.edges = edges;
            draft.networkStatistics = stats;
          });
          if (message) {
            alertRef.current.alert({
              type: "warning",
              text: message,
            });
          } else {
            alertRef.current.alert({
              type: "success",
              text: `Network Statistics Calculated!`,
            });
          }
        }}
      />
      <HelpModal
        isOpen={state.helpModal.isOpen}
        onClose={() =>
          updateState((draft) => {
            draft.helpModal.isOpen = false;
          })
        }
        videoId={HELP_VIDEO_ID}
      />

      <AlertContent ref={alertRef} />
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={controllerProps.isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </View>
  );
};

const MUI_THEMES = {
  Dark: MUIDarkTheme,
  Default: MUILightTheme,
};

export default (props: Props) => {
  const [theme, setTheme] = React.useState(MUI_THEMES.Default);
  return (
    <MuiThemeProvider theme={theme}>
      <AppContainer
        changeMUITheme={(name) => setTheme(MUI_THEMES[name])}
        {...props}
      />
    </MuiThemeProvider>
  );
};
