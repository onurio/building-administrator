/* eslint-disable react/display-name */
import { Button, IconButton, makeStyles, Typography } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import DataTable from './components/DataTable';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import UserEdit from './UserEdit';
import { ModalContext } from './components/SimpleModal';
import { getUsers, saveUser, deleteUser } from '../../utils/dbRequests';
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

export default function Users({ db, storage }) {
  const classes = useStyles();
  const handleModal = useContext(ModalContext);
  const [users, setUsers] = useState([]);

  const init = async () => {
    refresh();
  };

  console.log(users);
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
      field: 'email',
      headerName: 'Tenant',
      width: 250,
    },
    {
      field: 'apartment',
      headerName: 'Apartment',
      width: 150,
    },
    {
      field: 'services',
      headerName: 'Services',
      width: 180,
    },
    {
      field: 'reciepts',
      headerName: 'Reciepts',
      sortable: false,
      width: 150,
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
    let processed = await getUsers(db);
    processed = processed.map((user, index) => {
      return { ...user, edit: index };
    });
    setUsers(processed);
  };

  const onSave = async (info) => {
    await saveUser(db, info);
    handleModal();
    refresh();
  };

  const onDelete = async (id) => {
    await deleteUser(db, id);
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
