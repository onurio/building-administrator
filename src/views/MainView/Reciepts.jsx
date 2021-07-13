/* eslint-disable react/display-name */
import { IconButton, makeStyles, Typography } from '@material-ui/core';
import { CloudDownloadRounded } from '@material-ui/icons';
import React from 'react';
import DataTable from '../Admin/components/DataTable';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexGrow: 1,

    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'flex-start',
  },
  button: {
    maxWidth: 200,
  },
}));

export default function Reciepts({ reciepts }) {
  const classes = useStyles();

  const columns = [
    {
      field: 'date',
      headerName: 'Date',
      width: 100,
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 250,
    },
    {
      field: 'link',
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

  return (
    <div>
      <Typography variant='h3'>Reciepts</Typography>
      <div className={classes.root}>
        <DataTable rows={reciepts} columns={columns} />
      </div>
    </div>
  );
}
