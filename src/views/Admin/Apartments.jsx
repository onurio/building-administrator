/* eslint-disable react/display-name */
import { Button, IconButton, makeStyles, Typography } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import DataTable from './components/DataTable';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import ApartmentEdit from './ApartmentEdit';
import { ModalContext } from './components/SimpleModal';
import {
  getApartments,
  getCategories,
  saveApartment,
  deleteApartment,
} from '../../utils/dbRequests';
import DeleteModal from './components/DeleteModal';

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

export default function Apartments({ db, storage }) {
  const classes = useStyles();
  const handleModal = useContext(ModalContext);
  const [apartments, setApartments] = useState([]);

  const init = async () => {
    refresh();
  };

  console.log(apartments);
  useEffect(() => {
    init();
  }, []);

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      width: 250,
    },
    {
      field: 'tenant',
      headerName: 'Tenant',
      width: 250,
    },
    {
      field: 'rent',
      headerName: 'Rent',
      width: 150,
      renderCell: (params) => params.value + './S',
    },
    {
      field: 'bills',
      headerName: 'Bills',
      width: 100,
      renderCell: (params) => params.value + '%',
    },
    {
      field: 'edit',
      headerName: 'Edit',
      sortable: false,
      width: 100,
      renderCell: (params) => (
        <IconButton
          variant='contained'
          color='primary'
          size='small'
          onClick={() => openAdd(apartments[params.value])}
          style={{ marginLeft: 16 }}
        >
          <EditIcon />
        </IconButton>
      ),
    },
    {
      field: 'id',
      headerName: 'Delete',
      sortable: false,
      width: 100,
      renderCell: (params) => (
        <IconButton
          variant='contained'
          color='primary'
          size='small'
          onClick={() =>
            handleModal(
              <DeleteModal
                onCancel={handleModal}
                onSave={() => {
                  onDelete(params.value);
                  handleModal();
                }}
              />
            )
          }
          style={{ marginLeft: 16 }}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];
  const refresh = async () => {
    let processed = await getApartments(db);
    processed = processed.map((apartment, index) => {
      return { ...apartment, edit: index };
    });
    setApartments(processed);
  };

  const onSave = async (info) => {
    await saveApartment(db, info);
    handleModal();
    refresh();
  };

  const onDelete = async (id) => {
    await deleteApartment(db, id);
    refresh();
  };

  const openAdd = (apartment) => {
    handleModal(
      <ApartmentEdit
        apartment={apartment}
        onSave={onSave}
        onCancel={() => handleModal()}
      />
    );
  };

  return (
    <div>
      <Typography variant='h3'>Apartments</Typography>

      <div className={classes.root}>
        <Button
          onClick={() => openAdd()}
          className={classes.button}
          startIcon={<PersonAddIcon />}
          variant='outlined'
        >
          Add Apartment{' '}
        </Button>
        <DataTable rows={apartments} columns={columns} />
      </div>
    </div>
  );
}
