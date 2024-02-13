import React from 'react'
import {Button, Slider, Typography} from '@mui/material'

const SliderUIField = ({formData, schema, onChange, name}) => {
  return (
    <>
      <Typography id={`${schema.title}-continuous-slider`} gutterBottom>
        {schema.title ?? name}
      </Typography>
      <Slider
        value={formData ?? [schema.minimum, schema.maximum]}
        onChange={e => {
          onChange(e.target.value)
        }}
        valueLabelDisplay="auto"
        aria-labelledby={`${schema.title}-continuous-slider`}
        min={schema.minimum}
        max={schema.maximum}
      />
    </>
  )
}
export const getFilterSchema = () => {
  return {
    schema: {
      title: 'Filter',
      type: 'object',
      required: [
        // 'title',
        // 'year',
        // 'rechtsgebied',
        // 'adjustLayout',
      ],
      additionalProperties: false,
      properties: {
        // label: {
        //   type: 'string',
        // },
        year: {
          type: 'array',
          items: {
            type: 'number',
            minimum: 1900,
            maximum: 2021
          }
        },
        degree: {
          type: 'array',
          items: {
            type: 'number',
            minimum: 0,
            maximum: 100
          }
        },
        indegree: {
          type: 'array',
          items: {
            type: 'number',
            minimum: 0,
            maximum: 100
          }
        },
        outdegree: {
          type: 'array',
          items: {
            type: 'number',
            minimum: 0,
            maximum: 100
          }
        },
        isResult: {
          type: 'boolean',
          title: 'Query Input Only'
        }
      }
    },
    uiSchema: {
      // 'year': {
      //   'ui:field': SliderUIField,
      // },
      year: {
        'ui:options': {
          addable: false,
          orderable: false,
          removable: false
        }
      },
      degree: {
        'ui:options': {
          addable: false,
          orderable: false,
          removable: false
        }
        // 'ui:field': SliderUIField,
      },
      indegree: {
        'ui:options': {
          addable: false,
          orderable: false,
          removable: false
        }
        // 'ui:field': SliderUIField,
      },
      outdegree: {
        'ui:options': {
          addable: false,
          orderable: false,
          removable: false
        }
        // 'ui:field': SliderUIField,
      }
    }
  }
}

export const getFetchSchema = (props: {onPopupPress: () => void}) => {
  const {onPopupPress} = props
  return {
    children: <div></div>,
    schema: {
      title: 'Fetch Data',
      type: 'object',
      additionalProperties: false,
      properties: {
        popup: {
          title: 'Build Query',
          type: 'boolean'
        }
      }
    },
    uiSchema: {
      Date: {
        'ui:field': SliderUIField
      },
      // 'degreesSources': {
      //   'ui:field': SliderUIField,
      // },
      // 'degreesTargets': {
      //   'ui:field': SliderUIField,
      // },
      // 'source':{
      //   'ui:widget': 'checkboxes'
      // },
      // 'liPermission':{
      //   'ui:widget': 'select'
      // },
      popup: {
        'ui:field': ({formData, schema, onChange}) => {
          return <Button onClick={onPopupPress}>Open Query Builder</Button>
        }
      }
    }
  }
}

export const VIEW_CONFIG_SCHEMA = {
  schema: {
    title: 'Visualisation',
    type: 'object',
    required: [],
    additionalProperties: false,
    properties: {
      nodeSize: {
        type: 'string',
        title: 'Node Size',
        enum: [
          'betweenness centrality',
          'closeness centrality',
          'disruption centrality',
          'degree',
          'degree centrality',
          'in-degree',
          'in-degree centrality',
          'out-degree',
          'out-degree centrality',
          'pageRank',
          'relative in-degree',
          'year'
          // 'betweenness',
          // 'closeness',
          // 'authorities',
          // 'hubs',
          // 'community',
        ],
        enumNames: [
          'Betweenness Centrality',
          'Closeness Centrality',
          'Disruption Centrality',
          'Degree',
          'Degree Centrality',
          'In-Degree',
          'In-Degree Centrality',
          'Out-Degree',
          'Out-Degree Centrality',
          'PageRank',
          'Relative In-Degree',
          'Year'
          // 'Betweenness',
          // 'Closeness',
          // 'Authorities',
          // 'Hubs',
          // 'Community',
        ]
      },
      nodeColor: {
        type: 'string',
        title: 'Node Color',
        enum: [
          'betweenness centrality',
          'closeness centrality',
          'disruption centrality',
          'degree',
          'degree centrality',
          'in-degree',
          'in-degree centrality',
          'out-degree',
          'out-degree centrality',
          'pageRank',
          'relative in-degree',
          'year',
          'authorities',
          'hubs',
          'community'
          // 'betweenness',
          // 'closeness',
        ],
        enumNames: [
          'Betweenness Centrality',
          'Closeness Centrality',
          'Disruption Centrality',
          'Degree',
          'Degree Centrality',
          'In-Degree',
          'In-Degree Centrality',
          'Out-Degree',
          'Out-Degree Centrality',
          'PageRank',
          'Relative In-Degree',
          'Year',
          'Authorities',
          'Hubs',
          'Community'
          // 'Betweenness',
          // 'Closeness',
        ]
      }
    }
  }
}

export const NODE_SIZE_RANGE_MAP = {
  size: [50, 200],
  betweenness: [0, 10],
  'betweenness centrality': [0, 1],
  closeness: [0, 10],
  'closeness centrality': [0, 1],
  disruption: [-1, 1],
  'disruption centrality': [-1, 1], 
  degree: [0, 20],
  'degree centrality': [0, 1],
  'in-degree': [0, 10],
  'in-degree centrality': [0, 1],
  'out-degree': [0, 10],
  'out-degree centrality': [0, 10],
  pageRank: [0, 1],
  'relative in-degree': [0, 1],
  community: [0, 10],
  year: [1969, 2015],
  authorities: [0, 1],
  hubs: [0, 1]
}

export const LAYOUT_SCHEMA = {
  schema: {
    title: 'Layout',
    type: 'object',
    properties: {
      name: {
        type: 'string',
        enum: ['cose', 'breadthfirst', 'circle', 'grid', 'euler', 'dagre', 'spread']
      },
      animationDuration: {
        type: 'number',
        minimum: 0,
        maximum: 10000
      },
      refresh: {
        type: 'number',
        minimum: 0,
        maximum: 100
      },
      maxIterations: {
        type: 'number',
        minimum: 0,
        maximum: 1000
      },
      maxSimulationTime: {
        type: 'number',
        minimum: 0,
        maximum: 1000
      },
      expansion: {
        type: 'number',
        minimum: 0,
        maximum: 1
      }
    }
  }
}
