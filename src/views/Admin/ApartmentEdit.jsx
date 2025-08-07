import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Typography,
  Box,
  Card,
  Divider,
  Avatar,
  FormControlLabel,
  Switch,
} from '@material-ui/core';
import {
  Apartment as ApartmentIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Home as HomeIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
    maxWidth: 800,
    margin: '0 auto',
  },
  card: {
    borderRadius: theme.spacing(2),
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    overflow: 'visible',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: theme.spacing(3),
    borderRadius: `${theme.spacing(2)}px ${theme.spacing(2)}px 0 0`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  headerAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 50,
    height: 50,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontWeight: 600,
    fontSize: '1.5rem',
    marginBottom: theme.spacing(0.5),
  },
  subtitle: {
    opacity: 0.9,
    fontSize: '0.9rem',
  },
  content: {
    padding: theme.spacing(3),
  },
  section: {
    marginBottom: theme.spacing(3),
    '&:last-child': {
      marginBottom: 0,
    },
  },
  sectionTitle: {
    fontWeight: 600,
    color: '#1a202c',
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: theme.spacing(1),
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.1)',
      },
      '&.Mui-focused': {
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
      },
    },
  },
  formControl: {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      borderRadius: theme.spacing(1),
    },
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: '1px solid #e2e8f0',
    marginTop: theme.spacing(3),
  },
  cancelButton: {
    color: '#718096',
    borderColor: '#e2e8f0',
    '&:hover': {
      borderColor: '#cbd5e0',
      backgroundColor: '#f7fafc',
    },
  },
  saveButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontWeight: 500,
    borderRadius: theme.spacing(1),
    textTransform: 'none',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #5569d8 0%, #6a4190 100%)',
      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
    },
    transition: 'all 0.3s ease',
  },
  divider: {
    margin: theme.spacing(3, 0),
    backgroundColor: '#e2e8f0',
  },
  switchContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    backgroundColor: '#f7fafc',
    borderRadius: theme.spacing(1),
    border: '1px solid #e2e8f0',
  },
  switchLabel: {
    color: '#4a5568',
    fontWeight: 500,
  },
}));

const initialApartment = {
  name: '',
  electricity_percentage: 0,
  water_percentage: 0,
  rent: 0,
  municipality: 0,
  custom_maintenance: null,
  is_garage: false,
};

export default function ApartmentEdit({
  apartment,
  users = [],
  onCancel,
  onSave,
}) {
  const classes = useStyles();
  const isEdit = apartment !== undefined;
  const [apartmentInfo, setApartmentInfo] = useState(
    apartment || initialApartment
  );
  const [userLabels, setUserLabels] = useState(
    users.map((user) => ({ label: user.name, value: user.id }))
  );

  const handleChange = (e) => {
    setApartmentInfo((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  return (
    <Box className={classes.container}>
      <Card className={classes.card}>
        {/* Header */}
        <Box className={classes.header}>
          <Avatar className={classes.headerAvatar}>
            <ApartmentIcon />
          </Avatar>
          <Box className={classes.headerText}>
            <Typography className={classes.title}>
              {isEdit ? 'Editar Apartamento' : 'Agregar Apartamento'}
            </Typography>
            <Typography className={classes.subtitle}>
              {isEdit ? 'Modifica la información del apartamento' : 'Completa los datos del nuevo apartamento'}
            </Typography>
          </Box>
        </Box>

        {/* Content */}
        <Box className={classes.content}>
          {/* Basic Information */}
          <Box className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              <HomeIcon />
              Información Básica
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant='outlined'
                  placeholder='Número o nombre del apartamento'
                  value={apartmentInfo.name || ''}
                  label='Apartamento'
                  name='name'
                  onChange={handleChange}
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant='outlined'
                  type='number'
                  label='Alquiler (S/)'
                  placeholder='0'
                  value={apartmentInfo.rent}
                  name='rent'
                  onChange={handleChange}
                  className={classes.textField}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider className={classes.divider} />

          {/* Utility Percentages */}
          <Box className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Porcentajes de Servicios
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant='outlined'
                  type='number'
                  label='Porcentaje de Electricidad (%)'
                  placeholder='0'
                  value={apartmentInfo.electricity_percentage}
                  name='electricity_percentage'
                  onChange={handleChange}
                  className={classes.textField}
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant='outlined'
                  type='number'
                  label='Porcentaje de Agua (%)'
                  placeholder='0'
                  value={apartmentInfo.water_percentage}
                  name='water_percentage'
                  onChange={handleChange}
                  className={classes.textField}
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider className={classes.divider} />

          {/* Additional Costs */}
          <Box className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Costos Adicionales
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant='outlined'
                  type='number'
                  label='Impuesto Municipalidad (S/)'
                  placeholder='0'
                  value={apartmentInfo.municipality}
                  name='municipality'
                  onChange={handleChange}
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant='outlined'
                  type='number'
                  label='Mantenimiento Personalizado (S/)'
                  placeholder='0'
                  value={apartmentInfo.custom_maintenance || ''}
                  name='custom_maintenance'
                  onChange={handleChange}
                  className={classes.textField}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider className={classes.divider} />

          {/* Configuration */}
          <Box className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Configuración
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box className={classes.switchContainer}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={apartmentInfo.is_garage}
                        onChange={(e) => {
                          setApartmentInfo((s) => ({ ...s, is_garage: e.target.checked }));
                        }}
                        color="primary"
                      />
                    }
                    label="¿Es garaje?"
                    className={classes.switchLabel}
                  />
                </Box>
              </Grid>
              
              {isEdit && (
                <Grid item xs={12} md={6}>
                  <FormControl className={classes.formControl} variant='outlined'>
                    <InputLabel id='tenant'>Inquilino</InputLabel>
                    <Select
                      labelId='tenant'
                      id='tenant'
                      onChange={(e) => {
                        let tenant;
                        if (e.target.value) {
                          tenant = users.find((usr) => usr.id === e.target.value);
                          tenant = { name: tenant.name, id: tenant.id };
                        } else {
                          tenant = {};
                        }

                        setApartmentInfo((s) => ({
                          ...s,
                          tenant,
                        }));
                      }}
                      value={apartmentInfo.tenant?.id || ''}
                      label='Inquilino'
                    >
                      <MenuItem key={'not assigned'} value={undefined}>
                        Sin asignar
                      </MenuItem>
                      {userLabels.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Action Buttons */}
          <Box className={classes.buttonContainer}>
            <Button
              onClick={onCancel}
              variant='outlined'
              className={classes.cancelButton}
              startIcon={<CancelIcon />}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => onSave(apartmentInfo, isEdit)}
              variant='contained'
              className={classes.saveButton}
              startIcon={<SaveIcon />}
            >
              {isEdit ? 'Actualizar' : 'Guardar'}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}

ApartmentEdit.propTypes = {
  apartment: PropTypes.object,
};

ApartmentEdit.defaultProps = {
  apartment: undefined,
};
