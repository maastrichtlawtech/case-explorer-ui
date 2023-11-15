import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import React from 'react'
import {useUser} from '../useUser'

type TermsOfServiceProps = {
  onAgree: () => void
  onDisagree?: () => void
  isOpen?: boolean
  user: object
}

const TERMS_OF_SERVICE_URL = `https://drive.google.com/file/d/1HAFcVmZrjHsypmOiwaDIZvubyBTFXg2j/view?usp=sharing`

export function TermsOfService(props: TermsOfServiceProps) {
  const {
    onAgree,
    onDisagree = () => {
      alert('To proceed on signin, you need to accept the Terms of Usage!')
    },
    user
  } = props
  const [isOpen, setOpen] = React.useState(true)

  const handleClose = () => {
    setOpen(false)
  }

  // React.useEffect(() => {
  //   setTimeout(() => {
  //     setOpen(true)
  //   }, 1000)
  // }, [])

  return (
    <>
      <Dialog
        open={isOpen && user?.attributes?.['custom:isOldUser'] !== 'yes'}
        // onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Terms of Service'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            To use this service please consider on Terms of Service. You can read the all content on the
            <a href={TERMS_OF_SERVICE_URL} target="_blank">
              {` link`}
            </a>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              // handleClose()
              onDisagree()
            }}
            color="primary"
          >
            Disagree
          </Button>
          <Button
            onClick={() => {
              handleClose()
              onAgree()
            }}
            color="primary"
            autoFocus
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
