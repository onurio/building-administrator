import React from 'react';
import { Button, Grid, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    width: 250,
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

export default function ResetModal({ onCancel, onReset }) {
  const classes = useStyles();

  return (
    <Grid className={classes.container} container spacing={3}>
      <Grid item xs={12}>
        Estas seguro que quieres resetear? (Mandaremos la contraseña nueva a tu
        correo)
      </Grid>

      <Grid item xs={6}>
        <Button
          onClick={onCancel}
          className={classes.input}
          variant='contained'
        >
          NO
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button
          onClick={onReset}
          className={classes.input}
          variant='contained'
          color='primary'
        >
          SI
        </Button>
      </Grid>
    </Grid>
  );
}
