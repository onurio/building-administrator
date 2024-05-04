import { Grid, makeStyles, Paper, Typography } from '@material-ui/core';
import React from 'react';

import SharedFiles from './SharedFiles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      width: '100%',
    },
  },
  paper: {
    maxWidth: 500,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      margin: 0,
      marginTop: 20,
      padding: 10,
    },
    marginRight: 20,
    marginTop: 50,
    padding: 20,
  },
  container: {
    marginTop: 20,
    width: '100%',
    textAlign: 'left',
    border: '1px solid rgba(0,0,0,0.2)',
    borderRadius: 5,
  },
  item: {
    padding: '10px',
  },
}));

const fields = [
  {
    label: 'Nombre',
    field: 'name',
  },
  {
    label: 'Correo',
    field: 'email',
  },

  {
    label: 'DNI/RUC',
    field: 'dni_ruc',
  },

  {
    label: 'Telofono',
    field: 'tel',
  },
  {
    label: 'Telefono Emergencia',
    field: 'tel_emergency',
  },
  // {
  //   label: 'Inicio de conracto',
  //   field: 'contract_start',
  // },
  // {
  //   label: 'Fin de conracto',
  //   field: 'contract_end',
  // },
];

export default function General({ user }) {
  const classes = useStyles();

  return (
    <>
      <Typography style={{ marginTop: 20 }} variant='h3'>
        General
      </Typography>

      <div className={classes.root}>
        <Paper className={classes.paper}>
          <Typography variant='h5'>Informacion</Typography>

          <Grid xs={12} className={classes.container} container>
            {fields.map((field) => (
              <>
                <Grid className={classes.item} xs={6}>
                  {field.label}:
                </Grid>
                <Grid className={classes.item} xs={6}>
                  {user[field.field]}
                </Grid>
              </>
            ))}
            <Grid className={classes.item} xs={6}>
              Departamento:
            </Grid>
            <Grid className={classes.item} xs={6}>
              {user.apartment.name}
            </Grid>
            <Grid className={classes.item} xs={6}>
              Servicios:
            </Grid>
            <Grid className={classes.item} xs={6}>
              {user.services.toString()}
            </Grid>
          </Grid>
        </Paper>
        <Paper className={classes.paper}>
          <SharedFiles sharedFiles={user.shared_files} />
        </Paper>
      </div>
    </>
  );
}
