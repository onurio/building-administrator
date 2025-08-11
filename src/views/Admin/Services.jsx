import {
  Box,
  Button,
  makeStyles,
  Paper,
  Grid,
  TextField,
  Typography,
  Card,
  CardContent,
  InputAdornment,
  Chip,
} from '@material-ui/core';
import {
  Settings as SettingsIcon,
  Wifi as WifiIcon,
  Build as BuildIcon,
  Business as BusinessIcon,
  Tv as TvIcon,
  TrendingUp as TrendingUpIcon,
} from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import ChipsArray from './components/ChipArray';
import PropTypes from 'prop-types';
import {
  getLaundry,
  getServices,
  updateServices,
} from '../../utils/dbRequests';
import Loader from '../../components/Loader';
import LaundryUseView from './LaundryUseView';
import { useToast } from '../../components/Toast';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  header: {
    marginBottom: theme.spacing(4),
  },
  title: {
    fontWeight: 600,
    color: '#1a202c',
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    color: '#718096',
    marginBottom: theme.spacing(3),
  },
  statsCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  statsContent: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      textAlign: 'center',
    },
  },
  statsIcon: {
    fontSize: '3rem',
    marginRight: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      marginRight: 0,
      marginBottom: theme.spacing(1),
    },
  },
  statsText: {
    flex: 1,
  },
  statsValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white',
  },
  statsLabel: {
    fontSize: '1rem',
    opacity: 0.9,
    color: 'white',
  },
  contentContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  pricesSection: {
    maxWidth: '600px',
    width: '100%',
  },
  pricesCard: {
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    height: 'fit-content',
  },
  pricesHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: '1px solid #e2e8f0',
  },
  pricesIcon: {
    marginRight: theme.spacing(1),
    color: '#667eea',
  },
  pricesTitle: {
    fontWeight: 600,
    color: '#1a202c',
    fontSize: '1.25rem',
  },
  priceField: {
    marginBottom: theme.spacing(3),
    '& .MuiOutlinedInput-root': {
      borderRadius: theme.spacing(1),
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#667eea',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#667eea',
      },
    },
    '& .MuiInputLabel-outlined': {
      color: '#718096',
      '&.Mui-focused': {
        color: '#667eea',
      },
    },
  },
  priceIcon: {
    color: '#667eea',
  },
  updateButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontWeight: 500,
    padding: '12px 32px',
    borderRadius: theme.spacing(1),
    textTransform: 'none',
    width: '100%',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #5569d8 0%, #6a4190 100%)',
      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
    },
    '&:disabled': {
      background: '#cbd5e0',
      color: '#a0aec0',
      boxShadow: 'none',
    },
    transition: 'all 0.3s ease',
  },
  priceSummary: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: '#f7fafc',
    borderRadius: theme.spacing(1),
    border: '1px solid #e2e8f0',
  },
  summaryText: {
    fontSize: '0.875rem',
    color: '#718096',
    fontWeight: 500,
  },
}));

export default function Services({ users }) {
  const classes = useStyles();
  const [services, setServices] = useState();
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError, ToastComponent } = useToast();

  const refresh = async () => {
    const fetchedServices = await getServices();
    setServices(fetchedServices);
  };
  
  useEffect(() => {
    if (users) {
      refresh();
    }
  }, [users]);

  const handleChange = (e) => {
    setServices((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const onSaveServices = async () => {
    setLoading(true);
    try {
      await updateServices(services);
      showSuccess('Precios actualizados exitosamente');
      await refresh();
    } catch (error) {
      console.error('Error updating services:', error);
      showError('Error al actualizar precios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (serviceName) => {
    switch (serviceName) {
      case 'internet': return <WifiIcon className={classes.priceIcon} />;
      case 'maintenance': return <BuildIcon className={classes.priceIcon} />;
      case 'administration': return <BusinessIcon className={classes.priceIcon} />;
      case 'cable': return <TvIcon className={classes.priceIcon} />;
      default: return <SettingsIcon className={classes.priceIcon} />;
    }
  };

  const getTotalServices = () => {
    if (!services) return 0;
    return (parseFloat(services.internet) || 0) + (parseFloat(services.maintenance) || 0) + 
           (parseFloat(services.administration) || 0) + (parseFloat(services.cable) || 0);
  };

  if (!services) return <Loader />;

  return (
    <Box className={classes.root}>
      <ToastComponent />
      
      {/* Header Section */}
      <Box className={classes.header}>
        <Typography variant="h4" className={classes.title}>
          Configuración de Servicios
        </Typography>
        <Typography variant="subtitle1" className={classes.subtitle}>
          Administra los precios de los servicios del edificio
        </Typography>
      </Box>

      {/* Stats Card */}
      <Card className={classes.statsCard}>
        <Box className={classes.statsContent}>
          <TrendingUpIcon className={classes.statsIcon} />
          <Box className={classes.statsText}>
            <Typography className={classes.statsValue}>
              S/.{getTotalServices()}
            </Typography>
            <Typography className={classes.statsLabel}>
              Total de Servicios Básicos
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Content Container */}
      <Box className={classes.contentContainer}>
        {/* Prices Configuration Section */}
        <Box className={classes.pricesSection}>
          <Card className={classes.pricesCard}>
            <CardContent>
              <Box className={classes.pricesHeader}>
                <SettingsIcon className={classes.pricesIcon} />
                <Typography className={classes.pricesTitle}>
                  Precios Generales
                </Typography>
              </Box>

              <TextField
                className={classes.priceField}
                fullWidth
                variant="outlined"
                type="number"
                label="Precio de Internet"
                value={services.internet || ''}
                name="internet"
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {getServiceIcon('internet')}
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Chip label="S/." size="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                className={classes.priceField}
                fullWidth
                variant="outlined"
                type="number"
                label="Precio de Mantenimiento"
                value={services.maintenance || ''}
                name="maintenance"
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {getServiceIcon('maintenance')}
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Chip label="S/." size="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                className={classes.priceField}
                fullWidth
                variant="outlined"
                type="number"
                label="Precio de Administración"
                value={services.administration || ''}
                name="administration"
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {getServiceIcon('administration')}
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Chip label="S/." size="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                className={classes.priceField}
                fullWidth
                variant="outlined"
                type="number"
                label="Precio de Cable"
                value={services.cable || ''}
                name="cable"
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {getServiceIcon('cable')}
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Chip label="S/." size="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                onClick={onSaveServices}
                className={classes.updateButton}
                disabled={loading}
                size="large"
              >
                {loading ? 'Actualizando...' : 'Actualizar Precios'}
              </Button>

              {/* Price Summary */}
              <Box className={classes.priceSummary}>
                <Typography className={classes.summaryText}>
                  Total de servicios: S/.{getTotalServices()} mensuales por apartamento
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

Services.propTypes = {};
