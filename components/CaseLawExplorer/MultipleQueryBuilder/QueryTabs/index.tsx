import React from 'react'
import {Tabs, Tab, IconButton, Button} from '@mui/material'
import {Close} from '@mui/icons-material'
import {FormProps} from '@rjsf/core'
import Form from '@rjsf/material-ui'
import {TabPanel} from './TabPanel'
import {View} from 'colay-ui'
import validator from '@rjsf/validator-ajv8'
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type QueryTab = FormProps<any>

export type QueryTabsProps = {
  tabs: QueryTab[]
  selectedTab: number
  onDeleteTab: (index: number) => void
  onCreateTab: () => void
  onSubmit: () => void
  onTabChange: (newIndex: number) => void
}

export const QueryTabs = (props: QueryTabsProps) => {
  const {tabs, selectedTab, onSubmit, onDeleteTab, onCreateTab, onTabChange} = props
  return (
    <View>
      <Tabs
        value={selectedTab}
        onChange={(e, newIndex) => onTabChange(newIndex)}
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
        aria-label="scrollable force tabs example"
      >
        {tabs.map((tab, index) => {
          return (
            <Tab
              key={index}
              icon={
                <IconButton
                  component="div"
                  onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                    e.stopPropagation()
                    onDeleteTab(index)
                  }}
                >
                  <Close />
                </IconButton>
              }
              iconPosition="end"
              label={tab.name}
            />
            // <Tab
            //   style={{
            //     display: 'flex',
            //     flexDirection: 'row',
            //   }}
            // >
            //   <>
            //   <Typography>{tab.name}</Typography>
            // <IconButton
            //   onClick={() => onDeleteTab(index)}
            // >
            //   <Close />
            // </IconButton>
            //   </>
            // </Tab>
          )
        })}
      </Tabs>
      {tabs.map((tab, index) => {
        return (
          <TabPanel key={index} value={selectedTab} index={index}>
            <Form {...tab} validator={validator}>
              <View />
            </Form>
          </TabPanel>
        )
      })}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly'
        }}
      >
        <Button variant="contained" color="secondary" onClick={onCreateTab}>
          Add Query
        </Button>
        <Button variant="contained" color="primary" onClick={onSubmit}>
          Submit
        </Button>
      </View>
    </View>
  )
}
