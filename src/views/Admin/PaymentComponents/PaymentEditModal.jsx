import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Chip,
  InputAdornment,
  makeStyles,
} from '@material-ui/core';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
} from '@material-ui/icons';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency, safeNumber } from './utils';

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  titleIcon: {
    fontSize: '1.5rem',
  },
  formSection: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    fontWeight: 600,
    color: '#2d3748',
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: theme.spacing(1),
    },
  },
  balanceChip: {
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  saveButton: {
    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
    color: 'white',
    fontWeight: 600,
    '&:hover': {
      background: 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)',
    },
  },
  cancelButton: {
    color: '#718096',
    borderColor: '#e2e8f0',
    '&:hover': {
      borderColor: '#cbd5e0',
      backgroundColor: '#f7fafc',
    },
  },
}));

export default function PaymentEditModal({
  open,
  payment,
  onClose,
  onSave,
  loading = false,
}) {
  const classes = useStyles();
  
  // Form state
  const [formData, setFormData] = useState({
    amountPaid: '',
    paymentDate: new Date(),
    notes: '',
  });
  
  // Initialize form data when payment prop changes
  useEffect(() => {
    if (payment) {
      setFormData({
        amountPaid: payment.amountPaid || '',
        paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : new Date(),
        notes: payment.notes || '',
      });
    }
  }, [payment]);
  
  if (!payment) return null;
  
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleSubmit = () => {
    const updatedPayment = {
      ...payment,
      amountPaid: parseFloat(formData.amountPaid) || 0,
      paymentDate: formData.paymentDate.toISOString(),
      notes: formData.notes,
    };
    
    onSave(updatedPayment);
  };
  
  const isValid = () => {
    const amount = parseFloat(formData.amountPaid);
    return amount > 0 && amount <= payment.amountOwed;
  };
  
  const calculateBalance = () => {
    const paid = parseFloat(formData.amountPaid) || 0;
    const owed = payment.amountOwed || 0;
    const balance = owed - paid;
    
    return {
      paid,
      owed,
      balance,
      isFullyPaid: balance <= 0,
    };
  };
  
  const balance = calculateBalance();
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className={classes.dialogTitle}>
        <PaymentIcon className={classes.titleIcon} />
        <Box>
          <Typography variant="h6" style={{ margin: 0, color: 'white' }}>
            Editar Pago
          </Typography>
          <Typography variant="body2" style={{ opacity: 0.9, color: 'white' }}>
            {payment.userName} - {payment.monthYear}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent style={{ paddingTop: 24 }}>
        {/* Payment Information */}
        <Box className={classes.formSection}>
          <Typography className={classes.sectionTitle}>
            Información del Pago
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Monto Pagado"
                type="number"
                value={formData.amountPaid}
                onChange={(e) => handleChange('amountPaid', e.target.value)}
                className={classes.textField}
                InputProps={{
                  startAdornment: <InputAdornment position="start">S/.</InputAdornment>,
                }}
                helperText={`Monto adeudado: ${formatCurrency(payment.amountOwed)}`}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Fecha de Pago"
                  value={formData.paymentDate}
                  onChange={(date) => handleChange('paymentDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                      className: classes.textField,
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Notas / Observaciones"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className={classes.textField}
              />
            </Grid>
          </Grid>
        </Box>
        
        {/* Payment Summary */}
        <Box className={classes.formSection}>
          <Typography className={classes.sectionTitle}>
            Resumen del Pago
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Monto Adeudado
              </Typography>
              <Typography variant="h6">
                {formatCurrency(balance.owed)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Monto a Pagar
              </Typography>
              <Typography variant="h6">
                {formatCurrency(balance.paid)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Saldo Restante
              </Typography>
              <Typography variant="h6">
                {formatCurrency(Math.max(0, balance.balance))}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Estado
              </Typography>
              <Chip
                label={balance.isFullyPaid ? "Completo" : "Parcial"}
                className={classes.balanceChip}
                style={{
                  backgroundColor: balance.isFullyPaid ? '#48bb78' : '#ed8936',
                  color: 'white',
                }}
                size="small"
              />
            </Grid>
          </Grid>
        </Box>
        
        {/* Original Payment Info */}
        <Box className={classes.formSection}>
          <Typography className={classes.sectionTitle}>
            Información Original
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="textSecondary">
                Fecha Original
              </Typography>
              <Typography variant="body1">
                {payment.paymentDate && format(new Date(payment.paymentDate), 'dd/MM/yyyy', { locale: es })}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="textSecondary">
                Monto Original
              </Typography>
              <Typography variant="body1">
                {formatCurrency(payment.amountPaid)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="textSecondary">
                Creado Por
              </Typography>
              <Typography variant="body1">
                {payment.createdBy || 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions style={{ padding: 24, paddingTop: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          className={classes.cancelButton}
          startIcon={<CancelIcon />}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          className={classes.saveButton}
          startIcon={<SaveIcon />}
          disabled={loading || !isValid()}
        >
          {loading ? 'Guardando...' : 'Actualizar Pago'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}