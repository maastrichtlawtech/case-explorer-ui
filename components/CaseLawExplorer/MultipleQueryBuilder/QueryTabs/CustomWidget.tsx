import React from 'react'
import {Checkbox, FormControlLabel, FormLabel} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import {TreeView} from '@mui/x-tree-view/TreeView'
import {TreeItem, TreeItemContentProps, TreeItemProps, useTreeItem} from '@mui/x-tree-view/TreeItem'
import {WidgetProps} from '@rjsf/utils'
import clsx from 'clsx'

// Here other form fields can be added and mapped, for example Domains.
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
  },
  Domains: {
    Bestuursrecht: [
      'Ambtenarenrecht',
      'Belastingrecht',
      'Bestuursprocesrecht',
      'Bestuursstrafrecht',
      'Europees bestuursrecht',
      'Mededingingsrecht',
      'Omgevingsrecht',
      'Socialezekerheidsrecht',
      'Vreemdelingenrecht'
    ],
    'Civiel recht': [
      'Aanbestedingsrecht',
      'Arbeidsrecht',
      'Burgerlijk procesrecht',
      'Europees civiel recht',
      'Goederenrecht',
      'Insolventierecht',
      'Intellectueel-eigendomsrecht',
      'Internationaal privaatrecht',
      'Mededingingsrecht',
      'Ondernemingsrecht',
      'Personen- en familierecht',
      'Verbintenissenrecht'
    ],
    'Internationaal publiekrecht': ['Mensenrechten', 'Volkenrecht'],
    Strafrecht: [
      'Europees strafrecht',
      'Internationaal strafrecht',
      'Materieel strafrecht',
      'Penitentiair strafrecht',
      'Strafprocesrecht'
    ]
  }
}

//The interface extensions below are a workaround which allow us to pass our custom props to the Tree elements.
//Typescript will require to check if the custom prop exists in the props before being able to access it.
interface TreeItemContentPropsWithCheckbox extends TreeItemContentProps {
  checkbox?: React.ReactNode // Change the type to match your checkbox component or data structure
}

interface TreeItemPropsExtra extends TreeItemProps {
  checkbox?: React.ReactNode // Change the type to match your checkbox component or data structure,
  onFormUpdate?: (group: string, bool: boolean[] | boolean) => void
  values?: String[]
}

const CustomMainContent = React.forwardRef(function CustomContent(
  props: TreeItemContentProps | TreeItemContentPropsWithCheckbox,
  ref
) {
  /**
   * Custom Content Component for the TreeItems from mui-x.
   *  Necessary to be able to have TreeItems containing checkboxes.
   *  Most of the code directly taken from a demo on their website.
   */

  const hasCheckbox = 'checkbox' in props
  const {classes, className, label, nodeId, icon: iconProp, expansionIcon, displayIcon} = props
  const {disabled, expanded, selected, focused, handleExpansion, handleSelection, preventSelection} =
    useTreeItem(nodeId)
  const icon = iconProp || expansionIcon || displayIcon
  const [checked, setChecked] = React.useState(false)
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    preventSelection(event)
  }

  const handleExpansionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    handleExpansion(event)
  }

  const handleSelectionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    handleSelection(event)
  }
  return (
    <div
      className={clsx(className, classes.root, {
        [classes.expanded]: expanded,
        [classes.disabled]: disabled
      })}
      onMouseDown={handleMouseDown}
      ref={ref as React.Ref<HTMLDivElement>}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div
        onClick={handleExpansionClick}
        className={classes.iconContainer}
        style={{display: 'flex', marginRight: '15px'}}
      >
        {icon}
      </div>
      {hasCheckbox ? props.checkbox : null}
    </div>
  )
})
const groupCheckBox = (label: React.ReactNode, checked: boolean[] | boolean, setChecked: () => void) => {
  const all = Array.isArray(checked) ? checked.every(value => value === true) : checked
  const some = Array.isArray(checked) ? checked.some(value => value == true) : false
  //console.log('booleans are', checked)
  return (
    <FormControlLabel
      label={String(label)}
      control={<Checkbox checked={all} indeterminate={some && !all} onClick={() => setChecked()} />}
      style={{flexGrow: 1}}
    />
  )
}

const CustomMainGroupTreeItem = React.forwardRef(function CustomTreeItem(
  {...props}: TreeItemProps | TreeItemPropsExtra,
  ref: React.Ref<HTMLLIElement>
) {
  const group = Groupings[String(props.nodeId) as keyof typeof Groupings]
  const subgroup = group[props.label as keyof typeof group]
  const currentValues = 'values' in props ? props.values ?? [] : []
  const onFormUpdate =
    'onFormUpdate' in props && props.onFormUpdate ? props.onFormUpdate : (a: string, b: boolean[] | boolean) => {}
  if ('onFormUpdate' in props && props.onFormUpdate) {
    delete props.onFormUpdate // Passing ...props containing this function to children elements is against react practice (gives errors), so had to be deleted after caught here
  }
  if (subgroup.length == 0) {
    //When there are no subgroups in the group
    const [checked, setChecked] = React.useState(currentValues.includes(String(props.label))) // If it is already in the form, display checkbox correctly

    const mainGroupBox = groupCheckBox(props.label, checked, () => {
      const newChecked = !checked
      setChecked(newChecked)
      onFormUpdate(String(props.label), newChecked)
    })
    return (
      <TreeItem
        ContentComponent={CustomMainContent}
        {...props}
        ref={ref}
        ContentProps={{checkbox: mainGroupBox} as any}
      />
    )
  } else {
    //When there are subgroups in the group
    const [checked, setChecked] = React.useState(subgroup.map(item => currentValues.includes(item))) // Making sure current form data matches the checkboxes booleans.

    //Main group element. The checkbox sets all the elements in the boolean array to true or false, essentially selecting or deselecting all of the subgroups underneath.
    const mainGroupBox = groupCheckBox(props.label, checked, () => {
      const newChecked = new Array(checked.length).fill(checked.every(value => value === true) ? false : true)
      setChecked(newChecked)
      onFormUpdate(String(props.label), newChecked)
    })
    //Creating subgroup elements. Each element's checkbox flips a different boolean in the 'checked' boolean array.
    let children = subgroup.map((value, index) => {
      const subGroupBox = groupCheckBox(value, checked[index], () => {
        const updatedChecked = [...checked] // Create a copy of the array
        updatedChecked[index] = !updatedChecked[index]
        setChecked(updatedChecked)
        onFormUpdate(String(props.label), updatedChecked)
      })
      return <CustomSubGroupTreeItem nodeId={value} label={value} key={value} checkbox={subGroupBox} />
    })
    return (
      <TreeItem
        ContentComponent={CustomMainContent}
        {...props}
        ref={ref}
        ContentProps={{checkbox: mainGroupBox} as any}
      >
        {children}
      </TreeItem>
    )
  }
})

const CustomSubGroupTreeItem = React.forwardRef(function CustomTreeItem(
  props: TreeItemProps | TreeItemPropsExtra,
  ref: React.Ref<HTMLLIElement>
) {
  //This is the element generated for subgroups of a bigger group. The passed checkbox should already have implemented proper function calls when clicked.

  const subGroupBox = 'checkbox' in props ? props.checkbox : null
  return (
    //TODO add here the children buttons based on subgroups
    <TreeItem ContentComponent={CustomMainContent} {...props} ref={ref} ContentProps={{checkbox: subGroupBox} as any} />
  )
})
export const CustomSelectComponent = (props: WidgetProps) => {
  //console.log('WidgetProps', props)
  const label = props.label // Instances, Domains etc.
  let group = Groupings[label as keyof typeof Groupings]
  let values = props.value // current form data for this component
  values = [...values] // copy values to be able to use splice correctly
  const updateForm = (groupLabel: string, checkBool: boolean[] | boolean) => {
    // This function is used by smaller components to update the form data of this component based on which checkboxes are clicked

    if (Array.isArray(checkBool)) {
      // if we have a group with subgroups
      let subgroup: string[] = group[groupLabel as keyof typeof group]
      const needToBeThere = subgroup.filter((str: string, index: number) => checkBool[index])
      if (checkBool.every(value => value === true)) {
        //If all subgroups is there then also add the big group to form data
        needToBeThere.push(groupLabel)
      } else {
        // else remove the big group in case its there
        const indexToRemove = values.indexOf(groupLabel)
        if (indexToRemove !== -1) {
          values.splice(indexToRemove, 1)
        }
      }
      values = values.filter((item: string) => !subgroup.includes(item))
      values.push(...needToBeThere)
      props.onChange(values)
    } else {
      // if we have a group with no subgroups
      const indexToRemove = values.indexOf(groupLabel)
      if (indexToRemove !== -1) {
        values.splice(indexToRemove, 1)
      } else {
        values.push(groupLabel)
      }
      props.onChange(values)
    }
  }
  return (
    <div>
      <FormLabel id="group-label">{label}</FormLabel>
      {Object.keys(group).map(key => {
        const subgroup = group[key as keyof typeof group]
        return (
          <TreeView
            aria-label="file system navigator"
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            key={key}
          >
            <CustomMainGroupTreeItem nodeId={label} label={key} key={key} onFormUpdate={updateForm} values={values} />
          </TreeView>
        )
      })}
    </div>
  )
}
