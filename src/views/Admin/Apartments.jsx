/* eslint-disable react/display-name */
import { Button, IconButton, makeStyles, Typography } from '@material-ui/core';
import React, { useContext } from 'react';
import DataTable from './components/DataTable';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import ApartmentEdit from './ApartmentEdit';
import { ModalContext } from './components/SimpleModal';
import {
  saveApartment,
  deleteApartment,
  updateUser,
} from '../../utils/dbRequests';
import DeleteModal from './components/DeleteModal';
import ApartmentIcon from '@material-ui/icons/Apartment';

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

export default function Apartments({ users, apartments, refresh }) {
  const classes = useStyles();
  const handleModal = useContext(ModalContext);

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
      renderCell: (params) => params.value?.name || 'Not assigned',
    },
    {
      field: 'rent',
      headerName: 'Rent',
      width: 150,
      renderCell: (params) => params.value + './S',
    },
    {
      field: 'electricity_percentage',
      headerName: 'Electricity &',
      width: 140,
      renderCell: (params) => params.value + '%',
    },
    {
      field: 'water_percentage',
      headerName: 'Water &',
      width: 140,
      renderCell: (params) => params.value + '%',
    },
    {
      field: 'municipality',
      headerName: 'Municipality Tax',
      width: 150,
      renderCell: (params) => (params.value || 0) + './S',
    },
    {
      field: 'custom_maintenance',
      headerName: 'Custom Maintenance',
      width: 150,
      renderCell: (params) => (params.value || 'Not Set'),
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
                onCancel={() => handleModal()}
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

  const onSave = async (info, isEdit) => {
    let tenant;
    let apt = { ...info };

    if (info.tenant?.id && isEdit) {
      const user = users.find((usr) => usr.id === info.tenant.id);
      const updatedUser = {
        ...user,
        apartment: { id: info.id, name: info.name },
      };
      await updateUser(updatedUser);
      tenant = { name: user.name, id: user.id };
      apt.tenant = tenant;
    }
    await saveApartment(apt);
    handleModal();
    refresh();
  };

  const onDelete = async (id) => {
    await deleteApartment(id);
    refresh();
  };

  const openAdd = (apartment) => {
    handleModal(
      <ApartmentEdit
        users={users}
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
          startIcon={<ApartmentIcon />}
          variant='outlined'
        >
          Add Apartment{' '}
        </Button>
        <DataTable rows={apartments} columns={columns} />
      </div>
    </div>
  );
}
