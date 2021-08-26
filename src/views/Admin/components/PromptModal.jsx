import React from 'react';
import { Button, Grid, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    width: 350,
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: 20,
    display: 'flex',
    justifyContent: 'center',
  },
}));

export default function PromptModal({ title, actionTitle, onCancel, onSave }) {
  const classes = useStyles();

  return (
    <Grid className={classes.container} container spacing={3}>
      <Grid item xs={12}>
        {title}
      </Grid>

      <Grid item xs={6}>
        <Button
          onClick={onCancel}
          className={classes.input}
          variant='contained'
        >
          Cancel
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button
          onClick={onSave}
          className={classes.input}
          variant='contained'
          color='primary'
        >
          {actionTitle}
        </Button>
      </Grid>
    </Grid>
  );
}
