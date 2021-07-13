/* eslint-disable react/display-name */
import { Button, IconButton, makeStyles, Typography } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import DataTable from './components/DataTable';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import UserEdit from './UserEdit';
import { ModalContext } from './components/SimpleModal';
import { saveUser, deleteUser } from '../../utils/dbRequests';
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

export default function Users({ storage, auth, users, refresh }) {
  const classes = useStyles();
  const handleModal = useContext(ModalContext);

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      width: 250,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
    },
    {
      field: 'dni_ruc',
      headerName: 'Dni/Ruc',
      width: 150,
    },
    {
      field: 'apartment',
      headerName: 'Apartment',
      width: 150,
      renderCell: (params) => params.value?.name || 'Not assigned',
    },
    {
      field: 'services',
      headerName: 'Services',
      width: 180,
    },
    {
      field: 'debt',
      headerName: 'Debt',
      width: 90,
    },
    {
      field: 'deposit',
      headerName: 'Deposit',
      width: 120,
    },
    {
      field: 'tel',
      headerName: 'Phone',
      width: 110,
    },
    {
      field: 'telEmergency',
      headerName: 'E.Phone',
      width: 110,
    },
    {
      field: 'contract_start',
      headerName: 'Contract End',
      width: 150,
    },
    {
      field: 'contract_end',
      headerName: 'Contract Start',
      width: 150,
    },
    {
      field: 'reciepts',
      headerName: 'Reciepts',
      sortable: false,
      width: 120,
      renderCell: (params) => (
        <Button variant='outlined'>{params.value.length} Reciepts</Button>
      ),
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
          onClick={() => openAdd(users[params.value])}
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
    if (!isEdit) {
      auth
        .createUserWithEmailAndPassword(info.email, '12345678')
        .then(() => {
          saveUser(info);
          handleModal();
          refresh();
        })
        .catch((error) => {
          handleModal();
          refresh();

          alert(error);
        });
    } else {
      saveUser(info);
      handleModal();
      refresh();
    }
  };

  const onDelete = async (id) => {
    await deleteUser(id);
    refresh();
  };

  const openAdd = (user) => {
    handleModal(
      <UserEdit user={user} onSave={onSave} onCancel={() => handleModal()} />
    );
  };

  return (
    <div>
      <Typography variant='h3'>Users</Typography>

      <div className={classes.root}>
        <Button
          onClick={() => openAdd()}
          className={classes.button}
          startIcon={<PersonAddIcon />}
          variant='outlined'
        >
          Add User{' '}
        </Button>
        <DataTable rows={users} columns={columns} />
      </div>
    </div>
  );
}
