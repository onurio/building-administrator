/* eslint-disable react/display-name */
import {
  Button,
  IconButton,
  makeStyles,
  Typography,
  Box,
  Card,
  Chip,
} from '@material-ui/core';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Apartment as ApartmentIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@material-ui/icons';
import React, { useContext } from 'react';
import DataTable from './components/DataTable';
import ApartmentEdit from './ApartmentEdit';
import { ModalContext } from './components/SimpleModal';
import {
  saveApartment,
  deleteApartment,
  updateUser,
} from '../../utils/dbRequests';
import DeleteModal from './components/DeleteModal';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },
  header: {
    marginBottom: theme.spacing(4),
  },
  title: {
    fontWeight: 600,
    color: "#1a202c",
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    color: "#718096",
    marginBottom: theme.spacing(3),
  },
  statsCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
  statsContent: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      textAlign: "center",
    },
  },
  statsIcon: {
    fontSize: "3rem",
    marginRight: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      marginRight: 0,
      marginBottom: theme.spacing(1),
    },
  },
  statsText: {
    flex: 1,
  },
  statsValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "white",
  },
  statsLabel: {
    fontSize: "1rem",
    opacity: 0.9,
    color: "white",
  },
  controlsCard: {
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  controlsContainer: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
  },
  primaryButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    fontWeight: 500,
    padding: "12px 24px",
    borderRadius: theme.spacing(1),
    textTransform: "none",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
    "&:hover": {
      background: "linear-gradient(135deg, #5569d8 0%, #6a4190 100%)",
      boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
    },
    transition: "all 0.3s ease",
  },
  dataTableCard: {
    borderRadius: theme.spacing(2),
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
  },
}));

export default function Apartments({ users, apartments, refresh }) {
  const classes = useStyles();
  const handleModal = useContext(ModalContext);

  const columns = [
    {
      field: 'name',
      headerName: 'Apartamento',
      width: 160,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color="primary"
          icon={<ApartmentIcon />}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: 'tenant',
      headerName: 'Inquilino',
      width: 180,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value?.name || 'No asignado'}
        </Typography>
      ),
    },
    {
      field: 'rent',
      headerName: 'Alquiler',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={`S/.${params.value || 0}`}
          color="default"
          size="small"
        />
      ),
    },
    {
      field: 'electricity_percentage',
      headerName: 'Electricidad',
      width: 160,
      renderCell: (params) => (
        <Chip
          label={`${params.value || 0}%`}
          style={{ backgroundColor: '#f6ad55', color: 'white' }}
          size="small"
        />
      ),
    },
    {
      field: 'water_percentage',
      headerName: 'Agua',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={`${params.value || 0}%`}
          style={{ backgroundColor: '#3182ce', color: 'white' }}
          size="small"
        />
      ),
    },
    {
      field: 'municipality',
      headerName: 'Municipalidad',
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2">
          S/.{params.value || 0}
        </Typography>
      ),
    },
    {
      field: 'custom_maintenance',
      headerName: 'Mantenimiento',
      width: 170,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          style={{ 
            fontStyle: params.value ? 'normal' : 'italic',
            color: params.value ? 'inherit' : '#999'
          }}
          noWrap
        >
          {params.value || 'No definido'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      sortable: false,
      width: 140,
      renderCell: (params) => (
        <Box style={{ display: 'flex', gap: '4px' }}>
          <IconButton
            color='primary'
            size='small'
            onClick={() => openAdd(params.row)}
            title="Editar"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            color='secondary'
            size='small'
            onClick={() =>
              handleModal(
                <DeleteModal
                  onCancel={() => handleModal()}
                  onSave={() => {
                    onDelete(params.row.id);
                    handleModal();
                  }}
                />
              )
            }
            title="Eliminar"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
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

  const occupiedApartments = apartments.filter(apt => apt.tenant?.name).length;

  return (
    <Box className={classes.root}>
      {/* Header Section */}
      <Box className={classes.header}>
        <Typography variant="h4" className={classes.title}>
          Gestión de Apartamentos
        </Typography>
        <Typography variant="subtitle1" className={classes.subtitle}>
          Administra los apartamentos del edificio y sus asignaciones
        </Typography>
      </Box>

      {/* Stats Card */}
      <Card className={classes.statsCard}>
        <Box className={classes.statsContent}>
          <BusinessIcon className={classes.statsIcon} />
          <Box className={classes.statsText}>
            <Typography className={classes.statsValue}>
              {apartments.length}
            </Typography>
            <Typography className={classes.statsLabel}>
              Apartamentos • {occupiedApartments} Ocupados
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Controls Card */}
      <Card className={classes.controlsCard}>
        <Box className={classes.controlsContainer}>
          <Button
            onClick={() => openAdd()}
            className={classes.primaryButton}
            startIcon={<ApartmentIcon />}
            size="large"
          >
            Agregar Apartamento
          </Button>
        </Box>
      </Card>

      {/* Data Table Card */}
      <Card className={classes.dataTableCard}>
        <DataTable rows={apartments.sort((a, b) => a.name.localeCompare(b.name))} columns={columns} />
      </Card>
    </Box>
  );
}
