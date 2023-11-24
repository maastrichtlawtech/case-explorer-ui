import React from 'react'
import ReactDOM from 'react-dom'
import Box from '@mui/material/Box'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import {TreeView} from '@mui/x-tree-view/TreeView'
import {TreeItem} from '@mui/x-tree-view/TreeItem'

const Groupings = {
  Instances: {
    'Hoge Raad': [],
    'Raad van State': [],
    'Centrale Raad van Beroep': [],
    'College van Beroep voor het bedrijfsleven': [],
    Gerechtshoven: [
      'Gerechtshof Amsterdam',
      'Gerechtshof Arnhem-Leeuwarden',
      'Gerechtshof Den Haag',
      "Gerechtshof 's-Hertogenbosch"
    ],
    Rechtbanken: [
      'Rechtbank Amsterdam',
      'Rechtbank Den Haag',
      'Rechtbank Gelderland',
      'Rechtbank Limburg',
      'Rechtbank Midden-Nederland',
      'Rechtbank Noord-Holland',
      'Rechtbank Noord-Nederland',
      'Rechtbank Oost-Brabant',
      'Rechtbank Overijssel',
      'Rechtbank Rotterdam',
      'Rechtbank Zeeland-West-Brabant'
    ],
    'Andere instanties binnen het Koninkrijk': [
      'Constitutioneel Hof Sint Maarten',
      'Gemeenschappelijk Hof van Justitie van Aruba, Curacao, Sint Maarten en van Bonaire, Sint Eustatius en Saba',
      'Gerecht in Ambtenarenzaken van Aruba, Curacao, Sint Maarten en van Bonaire, Sint Eustatius en Saba',
      'Raad van Beroep in Ambtenarenzaken van Aruba, Curaçao, Sint Maarten en van Bonaire, Sint Eustatius en Saba',
      'Raad van Beroep voor Belastingzaken van Aruba, Curaçao, Sint Maarten en van Bonaire, Sint Eustatius en Saba',
      'Gerecht in Eerste Aanleg van Aruba',
      'Gerecht in eerste aanleg van Bonaire, Sint Eustatius en Saba',
      'Gerecht in eerste aanleg van Curaçao',
      'Gerecht in eerste aanleg van Sint Maarten'
    ]
  }
}

export const CustomSelectComponent = (props: any) => {
  console.log(props)
  const label = props.label
  let group = Groupings[label as keyof typeof Groupings]
  console.log(group)
  let nodeIds = 1
  return Object.keys(group).map(key => {
    const subgroup = group[key as keyof typeof group]
    if (subgroup) {
      return (
        <TreeView
          aria-label="file system navigator"
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <TreeItem nodeId={String(nodeIds++)} label={key}>
            {subgroup.map(value => {
              return <TreeItem nodeId={String(nodeIds++)} label={value} />
            })}
          </TreeItem>
        </TreeView>
      )
    } else
      return (
        <TreeView
          aria-label="file system navigator"
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <TreeItem nodeId={String(nodeIds++)} label={key} />
        </TreeView>
      )
  })
}
