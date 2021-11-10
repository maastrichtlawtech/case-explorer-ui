import {
  Alert,
  AlertTitle, Slide,
  Snackbar
} from '@mui/material'
import { useForwardRef } from 'colay-ui'
import * as R from 'colay/ramda'
import React from 'react'

export type AlertContentProps = {

}

export const AlertContent = React.forwardRef((props: AlertContentProps,forwardedRef) => {
    const [open, setOpen] = React.useState(false);
    const [messageInfo, setMessageInfo] = React.useState(undefined);
    const ref = useForwardRef(
      forwardedRef,
      {},
      ()=> ({
        alert: (message) => {
          setMessageInfo({
            key: R.uuid(),
            ...message,
          })
          setOpen(true)
        }
      })
    )
    const handleClose = (event, reason) => {
      // if (reason === 'clickaway') {
      //   return;
      // }
      setOpen(false);
    }
    const TransitionUp = React.useCallback((props) =>(
      <Slide 
        {...props}
        direction="down"
          handleExited={() => {
          setMessageInfo(undefined);
        }}
      />
    ), [])
    return (
      <Snackbar
        key={messageInfo?.key}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={open}
        autoHideDuration={4000}
        TransitionComponent={TransitionUp}
        onClose={handleClose}
      >
        <Alert 
          onClose={handleClose}
          severity={messageInfo?.type ?? 'error'}
        >
          <AlertTitle>{messageInfo ? R.upperFirst(messageInfo.type): ''}</AlertTitle>
          {
            messageInfo?.text
          }
        </Alert>
      </Snackbar>
    )
})
