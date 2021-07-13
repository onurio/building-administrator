import { Button, Grid, makeStyles, Paper, Typography } from '@material-ui/core';
import React, { useContext } from 'react';
import ResetModal from '../Admin/components/ResetModal';
import { ModalContext } from '../Admin/components/SimpleModal';
import GenerateReciepts from '../Admin/GenerateReciepts';
import { jsPDF } from 'jspdf';
import { useEffect } from 'react';
import PDFObject from 'pdfobject';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: '10px 10px',
    marginTop: '20px',
    marginBottom: 50,
    maxWidth: 500,
  },
  container: {
    textAlign: 'left',
    border: '1px solid rgba(0,0,0,0.2)',
    borderRadius: 5,
  },
  item: {
    padding: '10px',
  },
}));

const doc = new jsPDF();

doc.text('Hello world!', 10, 10);

let data = doc.output('datauristring');
export default function Settings({ userData }) {
  const { name, email, apt } = userData;
  const handleModal = useContext(ModalContext);
  const classes = useStyles();

  useEffect(() => {
    PDFObject.embed(data, '#pdf-preview', {});
  }, []);
  return (
    <>
      <Typography variant='h2'>Ajustes</Typography>
      <Paper className={classes.paper}>
        <Grid xs={12} className={classes.container} container>
          <Grid className={classes.item} xs={6}>
            Nombre:
          </Grid>
          <Grid className={classes.item} xs={6}>
            {name}
          </Grid>
          <Grid className={classes.item} xs={6}>
            Correo:
          </Grid>
          <Grid className={classes.item} xs={6}>
            {email}
          </Grid>
          <Grid className={classes.item} xs={6}>
            Departamento:
          </Grid>
          <Grid className={classes.item} xs={6}>
            {apt}
          </Grid>
        </Grid>
      </Paper>

      <GenerateReciepts />

      <div style={{ width: 400, height: 600 }} id='pdf-preview' />
    </>
  );
}
