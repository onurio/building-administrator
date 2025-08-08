import React from 'react';
import {
  Box,
  Paper,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  LinearProgress,
  makeStyles,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
} from '@material-ui/icons';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { formatCurrency, safeNumber, getApartmentName } from './utils';

const useStyles = makeStyles((theme) => ({
  formCard: {
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    marginBottom: theme.spacing(3),
  },
  formSection: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: '#2d3748',
    display: 'flex',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  balanceCard: {
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  balancePositive: {
    backgroundColor: '#f0fff4',
    border: '1px solid #9ae6b4',
  },
  balanceNegative: {
    backgroundColor: '#fff5f5',
    border: '1px solid #feb2b2',
  },
  balanceNeutral: {
    backgroundColor: '#f7fafc',
    border: '1px solid #cbd5e0',
  },
  submitButton: {
    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
    color: 'white',
    fontWeight: 600,
    padding: theme.spacing(1.5, 4),
    borderRadius: theme.spacing(1),
    textTransform: 'none',
    boxShadow: '0 4px 15px rgba(72, 187, 120, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)',
      boxShadow: '0 6px 20px rgba(72, 187, 120, 0.4)',
    },
    '&:disabled': {
      background: '#cbd5e0',
      color: '#a0aec0',
      boxShadow: 'none',
    },
  },
}));

export default function PaymentForm({
  users,
  selectedUser,
  setSelectedUser,
  userReceipts,
  selectedReceipt,
  setSelectedReceipt,
  paymentAmount,
  setPaymentAmount,
  paymentDate,
  setPaymentDate,
  notes,
  setNotes,
  balance,
  loading,
  onSubmit,
}) {
  const classes = useStyles();

  return (
    <Card className={classes.formCard}>
      <CardContent>
        {/* User Selection */}
        <Box className={classes.formSection}>
          <Typography className={classes.sectionTitle}>
            <PersonIcon className={classes.sectionIcon} />
            Seleccionar Inquilino
          </Typography>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Inquilino</InputLabel>
            <Select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              label="Inquilino"
            >
              <MenuItem value="">
                <em>Seleccione un inquilino</em>
              </MenuItem>
              {users?.sort((a, b) => a.name.localeCompare(b.name)).map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} - {getApartmentName(user)}
                  {safeNumber(user.debt) > 0 && (
                    <Chip
                      size="small"
                      label={`Deuda: ${formatCurrency(user.debt)}`}
                      color="secondary"
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Receipt Selection */}
        {selectedUser && (
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <ReceiptIcon className={classes.sectionIcon} />
              Seleccionar Recibo
            </Typography>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Recibo</InputLabel>
              <Select
                value={selectedReceipt}
                onChange={(e) => setSelectedReceipt(e.target.value)}
                label="Recibo"
              >
                <MenuItem value="">
                  <em>Seleccione un recibo</em>
                </MenuItem>
                {userReceipts.map((receipt) => (
                  <MenuItem key={receipt.name} value={receipt.name}>
                    {receipt.name} - {formatCurrency(receipt.total)}
                    {receipt.paid && (
                      <Chip
                        size="small"
                        label="Pagado"
                        style={{ marginLeft: 8, backgroundColor: '#48bb78', color: 'white' }}
                      />
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Payment Details */}
        {selectedReceipt && (
          <>
            <Box className={classes.formSection}>
              <Typography className={classes.sectionTitle}>
                <MoneyIcon className={classes.sectionIcon} />
                Detalles del Pago
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Monto a Pagar"
                    variant="outlined"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">S/.</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Fecha de Pago"
                      value={paymentDate}
                      onChange={setPaymentDate}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "outlined"
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notas / Observaciones"
                    variant="outlined"
                    multiline
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Balance Summary */}
            {balance && (
              <Box
                className={`${classes.balanceCard} ${
                  balance.isFullyPaid
                    ? classes.balancePositive
                    : balance.balance > 0
                    ? classes.balanceNegative
                    : classes.balanceNeutral
                }`}
              >
                <Typography variant="h6" style={{ marginBottom: 12 }}>
                  Resumen del Balance
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="textSecondary">
                      Total Adeudado
                    </Typography>
                    <Typography variant="h6">{formatCurrency(balance.owed)}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="textSecondary">
                      Pagos Anteriores
                    </Typography>
                    <Typography variant="h6">{formatCurrency(balance.previousPayments)}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="textSecondary">
                      Pago Actual
                    </Typography>
                    <Typography variant="h6">{formatCurrency(balance.paid)}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="textSecondary">
                      {balance.balance > 0 ? 'Saldo Pendiente' : 'Crédito a Favor'}
                    </Typography>
                    <Typography variant="h6" style={{ color: balance.balance > 0 ? '#e53e3e' : '#38a169' }}>
                      {formatCurrency(Math.abs(balance.balance))}
                    </Typography>
                  </Grid>
                </Grid>
                {balance.isFullyPaid && (
                  <Alert severity="success" style={{ marginTop: 12 }}>
                    <strong>¡Recibo pagado completamente!</strong> Este recibo será marcado como pagado.
                  </Alert>
                )}
              </Box>
            )}

            {/* Submit Button */}
            <Box style={{ marginTop: 24, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                className={classes.submitButton}
                onClick={onSubmit}
                disabled={loading || !paymentAmount}
                startIcon={loading ? null : <CheckIcon />}
              >
                {loading ? <LinearProgress style={{ width: 100 }} /> : 'Registrar Pago'}
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}