import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TextField,
  InputAdornment,
  LinearProgress,
  makeStyles,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  PlaylistAdd as BulkIcon,
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
  tableContainer: {
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    marginBottom: theme.spacing(3),
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

export default function BulkPaymentForm({ users, onSubmit, loading }) {
  const classes = useStyles();
  
  // Filter and selection states
  const [filterMonth, setFilterMonth] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  
  // Processed data for bulk operations
  const [bulkItems, setBulkItems] = useState([]);
  
  // Get available months from all receipts
  const availableMonths = React.useMemo(() => {
    const months = new Set();
    users?.forEach(user => {
      if (user.reciepts) {
        user.reciepts.forEach(receipt => {
          if (!receipt.paid && receipt.total > 0) {
            months.add(receipt.name);
          }
        });
      }
    });
    return Array.from(months).sort();
  }, [users]);
  
  // Process bulk payment items based on filter
  useEffect(() => {
    if (!filterMonth || !users) {
      setBulkItems([]);
      return;
    }
    
    const items = [];
    users.forEach(user => {
      if (user.reciepts) {
        const receipt = user.reciepts.find(r => 
          r.name === filterMonth && !r.paid && safeNumber(r.total) > 0
        );
        if (receipt) {
          items.push({
            userId: user.id,
            userName: user.name,
            apartmentName: getApartmentName(user),
            receiptId: receipt.name,
            monthYear: receipt.name,
            amountOwed: safeNumber(receipt.total),
            amountPaid: safeNumber(receipt.total), // Default to full amount
            receipt,
            user,
            key: `${user.id}-${receipt.name}`,
          });
        }
      }
    });
    
    // Sort items by user name
    items.sort((a, b) => a.userName.localeCompare(b.userName));
    
    setBulkItems(items);
    setSelectedItems(new Set());
  }, [filterMonth, users]);
  
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(new Set(bulkItems.map(item => item.key)));
    } else {
      setSelectedItems(new Set());
    }
  };
  
  const handleSelectItem = (itemKey, checked) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemKey);
    } else {
      newSelected.delete(itemKey);
    }
    setSelectedItems(newSelected);
  };
  
  const handleAmountChange = (itemKey, newAmount) => {
    setBulkItems(prev => prev.map(item => 
      item.key === itemKey 
        ? { ...item, amountPaid: safeNumber(newAmount) }
        : item
    ));
  };
  
  const getSelectedItems = () => {
    return bulkItems.filter(item => selectedItems.has(item.key));
  };
  
  const handleBulkSubmit = () => {
    const selectedBulkItems = getSelectedItems();
    if (selectedBulkItems.length === 0) {
      return;
    }
    
    const bulkPaymentData = selectedBulkItems.map(item => ({
      ...item,
      paymentDate: paymentDate.toISOString(),
      notes,
      createdBy: 'admin',
    }));
    
    onSubmit(bulkPaymentData);
  };
  
  const selectedItemsData = getSelectedItems();
  const totalAmount = selectedItemsData.reduce((sum, item) => sum + item.amountPaid, 0);
  
  return (
    <Card className={classes.formCard}>
      <CardContent>
        {/* Month Selection */}
        <Box className={classes.formSection}>
          <Typography className={classes.sectionTitle}>
            <ReceiptIcon className={classes.sectionIcon} />
            Seleccionar Mes para Pagos Masivos
          </Typography>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Mes</InputLabel>
            <Select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              label="Mes"
            >
              <MenuItem value="">
                <em>Seleccione un mes</em>
              </MenuItem>
              {availableMonths.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Payment Details for Bulk */}
        {filterMonth && bulkItems.length > 0 && (
          <>
            <Box className={classes.formSection}>
              <Typography className={classes.sectionTitle}>
                <MoneyIcon className={classes.sectionIcon} />
                Detalles del Pago Masivo
              </Typography>
              <Grid container spacing={3}>
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
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Notas / Observaciones"
                    variant="outlined"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Bulk Items Table */}
            <Box className={classes.formSection}>
              <Typography className={classes.sectionTitle}>
                <BulkIcon className={classes.sectionIcon} />
                Seleccionar Pagos - {filterMonth}
              </Typography>
              
              <TableContainer component={Paper} className={classes.tableContainer}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selectedItems.size > 0 && selectedItems.size < bulkItems.length}
                          checked={bulkItems.length > 0 && selectedItems.size === bulkItems.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>Inquilino</TableCell>
                      <TableCell>Apartamento</TableCell>
                      <TableCell align="right">Monto Adeudado</TableCell>
                      <TableCell align="right">Monto a Pagar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bulkItems.map((item) => (
                      <TableRow key={item.key}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedItems.has(item.key)}
                            onChange={(e) => handleSelectItem(item.key, e.target.checked)}
                          />
                        </TableCell>
                        <TableCell>{item.userName}</TableCell>
                        <TableCell>{item.apartmentName}</TableCell>
                        <TableCell align="right">{formatCurrency(item.amountOwed)}</TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={item.amountPaid}
                            onChange={(e) => handleAmountChange(item.key, e.target.value)}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">S/.</InputAdornment>,
                            }}
                            style={{ width: 120 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Summary and Submit */}
            {selectedItems.size > 0 && (
              <Box className={classes.formSection}>
                <Alert severity="info" style={{ marginBottom: 16 }}>
                  <strong>Resumen:</strong> {selectedItems.size} pagos seleccionados por un total de {formatCurrency(totalAmount)}
                </Alert>
                
                <Box style={{ textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    className={classes.submitButton}
                    onClick={handleBulkSubmit}
                    disabled={loading || selectedItems.size === 0}
                    startIcon={loading ? null : <CheckIcon />}
                  >
                    {loading ? <LinearProgress style={{ width: 100 }} /> : `Registrar ${selectedItems.size} Pagos`}
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}

        {filterMonth && bulkItems.length === 0 && (
          <Alert severity="info">
            No hay recibos pendientes de pago para el mes seleccionado.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}