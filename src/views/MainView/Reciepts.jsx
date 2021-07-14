/* eslint-disable react/display-name */
import { IconButton, makeStyles, Typography } from '@material-ui/core';
import { CloudDownloadRounded } from '@material-ui/icons';
import { format } from 'date-fns/esm';
import React, { useEffect } from 'react';
import { useState } from 'react';
import Loader from '../../components/Loader';
import {
  getApartmentFromUserId,
  getLaundryUser,
  getServices,
} from '../../utils/dbRequests';
import {
  calculateLaundryUsage,
  generateRecieptInfo,
  getMonthYear,
} from '../../utils/util';
import DataTable from '../Admin/components/DataTable';
import DisplayReciept from './DisplayReciept';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexGrow: 1,

    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'flex-start',
  },
  button: {
    maxWidth: 200,
  },
}));

export default function Reciepts({ reciepts }) {
  const classes = useStyles();

  const processedReciepts = reciepts.map((r, i) => ({ ...r, id: i }));

  const columns = [
    {
      field: 'date',
      headerName: 'Date',
      width: 200,
      renderCell: (params) => {
        return new Date(params.value).toDateString();
      },
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 250,
    },
    {
      field: 'url',
      headerName: 'Download',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <a href={params.value} target='_blank' rel='noreferrer'>
          <IconButton>
            <CloudDownloadRounded />
          </IconButton>
        </a>
      ),
    },
  ];

  if (!reciepts) return <Loader />;

  return (
    <div>
      <Typography style={{ margin: '20px 0' }} variant='h3'>
        Recibos
      </Typography>
      <div className={classes.root}>
        <div
          style={{
            width: '100%',
            maxWidth: 550,
            marginRight: 20,
          }}
        >
          <h2 style={{ marginBottom: 20 }}>Recibos anteriors</h2>
          <DataTable
            rows={processedReciepts}
            customStyles={{ maxWidth: 550, maxHeight: 500 }}
            columns={columns}
          />
        </div>
      </div>
    </div>
  );
}
