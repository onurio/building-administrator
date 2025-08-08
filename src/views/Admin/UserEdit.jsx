import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  Input,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Avatar,
} from '@material-ui/core';
import {
  Person as PersonIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@material-ui/icons';
import { DatePicker, LocalizationProvider, } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';

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
  chip: {
    margin: theme.spacing(0.5, 0.5, 0.5, 0),
    backgroundColor: '#667eea',
    color: 'white',
    '&:hover': {
      backgroundColor: '#5569d8',
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
  datePickerContainer: {
    '& .MuiOutlinedInput-root': {
      borderRadius: theme.spacing(1),
    },
  },
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 100,
    },
  },
};

const today = new Date().toISOString();

const initialUser = {
  name: '',
  email: '',
  tel: '',
  telEmergency: '',
  deposito: '',
  dni_ruc: '',
  contract_start: today,
  contract_end: today,
  debt: 0,
  deposit: 0,
  reciepts: [],
  services: [],
  shared_files: [],
  needs_tax_docs: false,
  tax_documents: [],
};

let services = [
  { label: 'Internet', value: 'internet' },
  { label: 'Cable', value: 'cable' },
  { label: 'Laundry', value: 'laundry' },
];

export default function UserEdit({ user, apartments = [], onCancel, onSave }) {
  const classes = useStyles();
  const isEdit = user !== undefined;
  const [userInfo, setUserInfo] = useState(user || initialUser);

  useEffect(() => { }, []);

  const handleChange = (e) => {
    setUserInfo((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleDate = (date, type) => {
    handleChange({
      target: { name: type, value: new Date(date).toISOString() },
    });
  };

  return (
    <Box className={classes.container}>
      <Card className={classes.card}>
        {/* Header */}
        <Box className={classes.header}>
          <Avatar className={classes.headerAvatar}>
            <PersonIcon />
          </Avatar>
          <Box className={classes.headerText}>
            <Typography className={classes.title}>
              {isEdit ? 'Editar Usuario' : 'Agregar Usuario'}
            </Typography>
            <Typography className={classes.subtitle}>
              {isEdit ? 'Modifica la información del usuario' : 'Completa los datos del nuevo usuario'}
            </Typography>
          </Box>
        </Box>

        {/* Content */}
        <Box className={classes.content}>
          {/* Basic Information */}
          <Box className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Información Básica
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  variant='outlined'
                  placeholder='Nombre completo'
                  value={userInfo.name || ''}
                  label='Nombre'
                  name='name'
                  onChange={handleChange}
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  variant='outlined'
                  label='Email'
                  type='email'
                  value={userInfo.email}
                  name='email'
                  onChange={handleChange}
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  variant='outlined'
                  label='DNI/RUC'
                  value={userInfo.dni_ruc}
                  name='dni_ruc'
                  onChange={handleChange}
                  className={classes.textField}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider className={classes.divider} />

          {/* Contact Information */}
          <Box className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Información de Contacto
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant='outlined'
                  type='tel'
                  placeholder='Teléfono principal'
                  value={userInfo.tel || ''}
                  label='Teléfono'
                  name='tel'
                  onChange={handleChange}
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant='outlined'
                  type='tel'
                  placeholder='Teléfono de emergencia'
                  value={userInfo.telEmergency || ''}
                  label='Teléfono de Emergencia'
                  name='telEmergency'
                  onChange={handleChange}
                  className={classes.textField}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider className={classes.divider} />

          {/* Contract Information */}
          <Box className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Información del Contrato
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Box className={classes.datePickerContainer}>
                    <DatePicker
                      value={new Date(userInfo.contract_start)}
                      onChange={(val) => handleDate(val, 'contract_start')}
                      label='Inicio del Contrato'
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined'
                        }
                      }}
                    />
                  </Box>
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Box className={classes.datePickerContainer}>
                    <DatePicker
                      value={new Date(userInfo.contract_end)}
                      label='Fin del Contrato'
                      onChange={(val) => handleDate(val, 'contract_end')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined'
                        }
                      }}
                    />
                  </Box>
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Box>

          <Divider className={classes.divider} />

          {/* Services and Financial */}
          <Box className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Servicios y Finanzas
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl className={classes.formControl} variant='outlined'>
                  <InputLabel id='services'>Servicios</InputLabel>
                  <Select
                    labelId='services'
                    id='services'
                    multiple
                    onChange={(e) => {
                      setUserInfo((s) => ({ ...s, services: e.target.value }));
                    }}
                    value={userInfo.services || []}
                    label='Servicios'
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} className={classes.chip} size="small" />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {services.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  variant='outlined'
                  type='number'
                  placeholder='0'
                  value={userInfo.debt || ''}
                  label='Deuda (S/)'
                  name='debt'
                  onChange={handleChange}
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  variant='outlined'
                  type='number'
                  placeholder='0'
                  value={userInfo.deposit || ''}
                  label='Depósito (S/)'
                  name='deposit'
                  onChange={handleChange}
                  className={classes.textField}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider className={classes.divider} />

          {/* Tax Documents Configuration */}
          <Box className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Documentos Tributarios
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userInfo.needs_tax_docs || false}
                      onChange={(e) => setUserInfo(s => ({ ...s, needs_tax_docs: e.target.checked }))}
                      color="primary"
                    />
                  }
                  label="Requiere documentos tributarios (SUNAT) para sus recibos"
                />
              </Grid>
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
              onClick={() => onSave(userInfo, isEdit)}
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

UserEdit.propTypes = {
  user: PropTypes.object,
};

UserEdit.defaultProps = {
  user: undefined,
};
