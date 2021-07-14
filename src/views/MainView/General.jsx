import { Button, Grid, makeStyles, Paper, Typography } from '@material-ui/core';
import React, { useContext } from 'react';
import ResetModal from '../Admin/components/ResetModal';
import { ModalContext } from '../Admin/components/SimpleModal';
import GenerateReciepts from '../Admin/GenerateReciepts';
import { jsPDF } from 'jspdf';
import { useEffect } from 'react';
import PDFObject from 'pdfobject';
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
    margin: 20,
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

// const doc = new jsPDF();

// doc.text('Hello world!', 10, 10);

// let data = doc.output('datauristring');

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
    label: 'Telofono',
    field: 'tel',
  },
  {
    label: 'Telefono Emergencia',
    field: 'tel_emergency',
  },
];

export default function General({ userData }) {
  const handleModal = useContext(ModalContext);
  const classes = useStyles();

  console.log(userData);
  useEffect(() => {
    // PDFObject.embed(data, '#pdf-preview', {});
  }, []);
  return (
    <>
      <Typography variant='h4'>General</Typography>

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
                  {userData[field.field]}
                </Grid>
              </>
            ))}
            <Grid className={classes.item} xs={6}>
              Departamento:
            </Grid>
            <Grid className={classes.item} xs={6}>
              {userData.apartment.name}
            </Grid>
          </Grid>
        </Paper>
        <Paper className={classes.paper}>
          <SharedFiles sharedFiles={userData.shared_files} />
        </Paper>

        {/* <div style={{ width: 400, height: 600 }} id='pdf-preview' /> */}
      </div>
    </>
  );
}
