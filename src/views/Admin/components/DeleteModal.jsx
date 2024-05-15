import React from "react";
import { Button, Grid, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  container: {
    width: 250,
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

export default function DeleteModal({ onCancel, onSave }) {
  const classes = useStyles();

  return (
    <Grid className={classes.container} container spacing={3}>
      <Grid item xs={12}>
        Are you sure you want delete?
      </Grid>

      <Grid item xs={6}>
        <Button
          onClick={onCancel}
          className={classes.input}
          variant="contained"
        >
          Cancel
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button
          onClick={onSave}
          className={classes.input}
          variant="contained"
          color="primary"
        >
          Delete
        </Button>
      </Grid>
    </Grid>
  );
}
