import React from "react";
import { Button, Grid, makeStyles, Typography, Box } from "@material-ui/core";
import { Warning as WarningIcon, Cancel as CancelIcon, Delete as DeleteIcon } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  container: {
    width: 400,
    maxWidth: '90vw',
    padding: theme.spacing(3),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),
  },
  warningIcon: {
    fontSize: '3rem',
    color: '#f56565',
    marginRight: theme.spacing(1),
  },
  title: {
    fontWeight: 600,
    color: '#2d3748',
    fontSize: '1.25rem',
  },
  message: {
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: theme.spacing(3),
    fontSize: '0.95rem',
    lineHeight: 1.5,
  },
  buttonContainer: {
    display: 'flex',
    gap: theme.spacing(1.5),
    justifyContent: 'center',
  },
  cancelButton: {
    minWidth: 120,
    padding: theme.spacing(1.2, 2.5),
    borderRadius: theme.spacing(1),
    fontWeight: 500,
    textTransform: 'none',
    backgroundColor: '#f7fafc',
    color: '#4a5568',
    border: '1px solid #e2e8f0',
    '&:hover': {
      backgroundColor: '#edf2f7',
      border: '1px solid #cbd5e0',
    },
    transition: 'all 0.2s ease',
  },
  deleteButton: {
    minWidth: 120,
    padding: theme.spacing(1.2, 2.5),
    borderRadius: theme.spacing(1),
    fontWeight: 500,
    textTransform: 'none',
    backgroundColor: '#e53e3e',
    color: 'white',
    border: '1px solid #e53e3e',
    boxShadow: '0 2px 4px rgba(229, 62, 62, 0.3)',
    '&:hover': {
      backgroundColor: '#c53030',
      border: '1px solid #c53030',
      boxShadow: '0 4px 8px rgba(229, 62, 62, 0.4)',
    },
    transition: 'all 0.2s ease',
  },
}));

export default function DeleteModal({ onCancel, onSave }) {
  const classes = useStyles();

  return (
    <Box className={classes.container}>
      <Box className={classes.header}>
        <WarningIcon className={classes.warningIcon} />
      </Box>
      
      <Typography variant="h6" className={classes.title} align="center">
        ¿Confirmar eliminación?
      </Typography>
      
      <Typography className={classes.message}>
        Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este elemento?
      </Typography>

      <Box className={classes.buttonContainer}>
        <Button
          onClick={onCancel}
          className={classes.cancelButton}
          variant="outlined"
          startIcon={<CancelIcon />}
        >
          Cancelar
        </Button>
        <Button
          onClick={onSave}
          className={classes.deleteButton}
          variant="contained"
          startIcon={<DeleteIcon />}
        >
          Eliminar
        </Button>
      </Box>
    </Box>
  );
}
