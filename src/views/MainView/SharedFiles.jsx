/* eslint-disable react/display-name */
import { IconButton, makeStyles, Typography } from '@material-ui/core';
import { CloudDownloadRounded } from '@material-ui/icons';
import React from 'react';
import DataTable from '../Admin/components/DataTable';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      minWidth: 'unset',
    },
    minWidth: 420,
    height: 'fit-content',
    maxHeight: 600,
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'flex-start',
  },
  button: {
    maxWidth: 200,
  },
}));

export default function SharedFiles({ sharedFiles = [] }) {
  const classes = useStyles();
  const files = sharedFiles.map((file, index) => ({ ...file, id: index }));

  const columns = [
    {
      field: 'title',
      headerName: 'Name',
      width: 300,
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

  return (
    <div className={classes.root}>
      <Typography style={{ marginBottom: 20 }} variant='h5'>
        Archivos compartidos
      </Typography>
      <div>
        <DataTable
          rows={files}
          columns={columns}
          customStyles={{ maxHeight: 400 }}
        />
      </div>
    </div>
  );
}
