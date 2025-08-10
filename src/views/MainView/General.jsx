import { Grid, makeStyles, Paper, Typography, Box, Divider, Chip } from '@material-ui/core';
import { Person, Email, Phone, Home, Business, Build } from '@material-ui/icons';
import React from 'react';

import SharedFiles from './SharedFiles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr', // Personal info gets 1/3, shared files gets 2/3
    gap: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr', // Stack vertically on medium screens and smaller
      gap: theme.spacing(1.5),
    },
  },
  paper: {
    padding: theme.spacing(3),
    borderRadius: '16px',
    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    background: '#ffffff',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      borderRadius: '12px',
    },
  },
  sectionTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: '#1a202c',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5, 0),
    borderBottom: '1px solid #f1f5f9',
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  infoIcon: {
    color: '#2563eb',
    marginRight: theme.spacing(1.5),
    fontSize: '1.25rem',
  },
  infoLabel: {
    fontWeight: 500,
    color: '#374151',
    minWidth: '140px',
    fontSize: '0.9rem',
    textAlign: 'left',
  },
  infoValue: {
    color: '#1a202c',
    fontSize: '0.95rem',
    fontWeight: 400,
  },
  servicesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  serviceChip: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontWeight: 500,
    '& .MuiChip-icon': {
      color: '#2563eb',
    },
  },
  pageTitle: {
    marginBottom: theme.spacing(3),
    fontWeight: 700,
    color: '#1a202c',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(2),
      fontSize: '2rem',
    },
  },
}));

const fields = [
  {
    label: 'Nombre',
    field: 'name',
    icon: Person,
  },
  {
    label: 'Correo',
    field: 'email',
    icon: Email,
  },
  {
    label: 'DNI/RUC',
    field: 'dni_ruc',
    icon: Business,
  },
  {
    label: 'Teléfono',
    field: 'tel',
    icon: Phone,
  },
  {
    label: 'Teléfono Emergencia',
    field: 'tel_emergency',
    icon: Phone,
  },
];

export default function General({ user }) {
  const classes = useStyles();

  const getServiceIcon = (service) => {
    switch (service.toLowerCase()) {
      case 'laundry':
        return <Build />;
      case 'cable':
        return <Business />;
      default:
        return <Build />;
    }
  };

  return (
    <Box>
      <Typography variant='h4' className={classes.pageTitle}>
        Mi Información
      </Typography>


      <div className={classes.root}>
        {/* Personal Information */}
        <Paper className={classes.paper}>
          <Typography variant='h6' className={classes.sectionTitle}>
            <Person /> Información Personal
          </Typography>
          
          <Box>
            {fields.map((field, index) => {
              const IconComponent = field.icon;
              return (
                <Box key={index} className={classes.infoItem}>
                  <IconComponent className={classes.infoIcon} />
                  <Typography className={classes.infoLabel}>
                    {field.label}:
                  </Typography>
                  <Typography className={classes.infoValue}>
                    {user[field.field] || 'No especificado'}
                  </Typography>
                </Box>
              );
            })}
            
            {/* Apartment */}
            <Box className={classes.infoItem}>
              <Home className={classes.infoIcon} />
              <Typography className={classes.infoLabel}>
                Departamento:
              </Typography>
              <Typography className={classes.infoValue}>
                {user.apartment?.name || 'No asignado'}
              </Typography>
            </Box>
            
            {/* Services */}
            <Box className={classes.infoItem}>
              <Build className={classes.infoIcon} />
              <Typography className={classes.infoLabel}>
                Servicios:
              </Typography>
              <Box className={classes.servicesContainer}>
                {user.services?.map((service, index) => (
                  <Chip 
                    key={index}
                    icon={getServiceIcon(service)}
                    label={service === 'laundry' ? 'Lavandería' : service}
                    className={classes.serviceChip}
                    size="small"
                  />
                )) || <Typography className={classes.infoValue}>No hay servicios</Typography>}
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Shared Files */}
        <Paper className={classes.paper}>
          <SharedFiles sharedFiles={user.shared_files} userId={user.id} user={user} />
        </Paper>
      </div>
    </Box>
  );
}
