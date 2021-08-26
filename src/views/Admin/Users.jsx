/* eslint-disable react/display-name */
import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import DataTable from './components/DataTable';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import UserEdit from './UserEdit';
import { ModalContext } from './components/SimpleModal';
import { saveUser, deleteUser, updateUser } from '../../utils/dbRequests';
import DeleteModal from './components/DeleteModal';
import FileUploader from './components/FileUploader';
import ListReciepts from '../MainView/ListReciepts';

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
  controlsContainer: {
    display: 'flex',
  },
  hideShow: {
    marginLeft: 10,
    padding: '0 10px',
  },
}));

export default function Users({ storage, auth, users, refresh }) {
  const classes = useStyles();
  const handleModal = useContext(ModalContext);
  const [hideShow, setHideShow] = useState(true);

  const openDownloads = (user) => {
    handleModal(
      <FileUploader
        path={`${user.name.toLowerCase().replace(' ', '_')}_${
          user.id
        }/shared_files`}
        files={user.shared_files}
        onChange={(files) => {
          updateUser({ ...user, shared_files: files });
          refresh();
        }}
        title='Shared Files'
        storage={storage}
      />
    );
  };

  const openRecieptsModal = (user) => {
    handleModal(
      <div style={{ width: 800, maxWidth: '80vw', height: 660 }}>
        <ListReciepts
          handleModal={handleModal}
          allowEdit
          refresh={refresh}
          user={user}
          reciepts={user.reciepts}
        />
      </div>
    );
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
    },

    {
      field: 'apartment',
      headerName: 'Apartment',
      width: 120,
      renderCell: (params) => params.value?.name || 'Not assigned',
    },
    {
      field: 'services',
      headerName: 'Services',
      width: 180,
    },
    {
      field: 'dni_ruc',
      headerName: 'Dni/Ruc',
      width: 150,
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
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'contract_end',
      headerName: 'Contract Start',
      width: 150,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'shared_files',
      headerName: 'Shared Files',
      sortable: false,
      width: 140,
      renderCell: (params) => (
        <Button
          onClick={() => {
            openDownloads(params.row);
          }}
          variant='outlined'
          size='small'
        >
          {params.value?.length || 0} Files
        </Button>
      ),
    },
    {
      field: 'reciepts',
      headerName: 'Reciepts',
      sortable: false,
      width: 140,
      renderCell: (params) => (
        <Button
          onClick={() => openRecieptsModal(params.row || {})}
          variant='outlined'
        >
          {params.value?.length} Reciepts
        </Button>
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

  if (!hideShow) {
    columns.splice(4, 7);
  }

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
      updateUser(info);
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
        <div className={classes.controlsContainer}>
          <Button
            onClick={() => openAdd()}
            className={classes.button}
            startIcon={<PersonAddIcon />}
            variant='outlined'
          >
            Add User{' '}
          </Button>
          <Paper className={classes.hideShow}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={hideShow}
                  onChange={(e) => setHideShow(e.target.checked)}
                  color='primary'
                />
              }
              label='Show All/Essential Columns'
            />
          </Paper>
        </div>

        <DataTable rows={users} columns={columns} />
      </div>
    </div>
  );
}
