import React, { createContext, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import { IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    position: 'relative',
    maxWidth: '100vw',
    padding: '0 20px 0 20px',
    overflowY: 'auto',
    maxHeight: '100%',
  },
  close: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 999,
  },
}));

export const ModalContext = createContext();

export default function SimpleModal({ children, className }) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(null);

  const handleModal = (comp) => {
    if (comp) {
      setOpen(true);
      setContent(comp);
    } else {
      setOpen(false);
    }
  };

  return (
    <div>
      <ModalContext.Provider value={handleModal}>
        {children}
      </ModalContext.Provider>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={`${classes.modal} modal ${className}`}
        open={open}
        closeAfterTransition
        onClose={() => setOpen(false)}
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <div className={classes.paper}>
            <IconButton onClick={() => handleModal()} className={classes.close}>
              <CloseIcon />
            </IconButton>
            {content}
          </div>
        </Fade>
      </Modal>
    </div>
  );
}
