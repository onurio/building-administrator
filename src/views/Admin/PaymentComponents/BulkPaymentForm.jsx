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
  CircularProgress,
  makeStyles,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  PlaylistAdd as BulkIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as DetailsIcon,
} from '@material-ui/icons';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { formatCurrency, safeNumber, getApartmentName, calculatePaymentBreakdown, formatBreakdownDisplay, formatMonthYear } from './utils';
import { getLaundryUser } from '../../../utils/dbRequests';
import { getPaymentsByUser } from '../../../utils/dbRequests/payments';

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
  expandableTable: {
    '& .MuiTableRow-root': {
      '&.expanded': {
        backgroundColor: '#f8f9fa',
      },
    },
  },
  breakdownCell: {
    fontSize: '0.875rem',
    color: '#4a5568',
  },
  breakdownValue: {
    fontWeight: 600,
    color: '#2d3748',
  },
  expandButton: {
    padding: 4,
    minWidth: 'auto',
  },
  breakdownRow: {
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #e2e8f0',
  },
  breakdownContent: {
    padding: theme.spacing(2),
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
  },
  breakdownItem: {
    minWidth: 120,
    padding: theme.spacing(1),
    backgroundColor: 'white',
    borderRadius: theme.spacing(0.5),
    border: '1px solid #e2e8f0',
  },
  breakdownLabel: {
    fontSize: '0.75rem',
    color: '#718096',
    fontWeight: 500,
  },
  breakdownAmount: {
    fontSize: '0.875rem',
    color: '#2d3748',
    fontWeight: 600,
  },
  debtPositive: {
    color: '#e53e3e !important',
    fontWeight: 600,
  },
  debtNegative: {
    color: '#38a169 !important', 
    fontWeight: 600,
  },
  debtZero: {
    color: '#718096 !important',
    fontWeight: 500,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    minHeight: 200,
  },
  loadingText: {
    marginTop: theme.spacing(2),
    color: '#718096',
  },
}));

export default function BulkPaymentForm({ users, apartments, services, onSubmit, loading }) {
  const classes = useStyles();
  
  // Filter and selection states
  const [filterMonth, setFilterMonth] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  
  // Processed data for bulk operations
  const [bulkItems, setBulkItems] = useState([]);
  const [itemBreakdowns, setItemBreakdowns] = useState({});
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [loadingBulkItems, setLoadingBulkItems] = useState(false);
  
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
    if (!filterMonth || !users || !services || !apartments) {
      setBulkItems([]);
      setItemBreakdowns({});
      setLoadingBulkItems(false);
      return;
    }
    
    const processItems = async () => {
      setLoadingBulkItems(true);
      try {
        const items = [];
        const breakdowns = {};
        
        for (const user of users) {
          if (user.reciepts) {
            const receipt = user.reciepts.find(r => 
              r.name === filterMonth && !r.paid && safeNumber(r.total) > 0
            );
            if (receipt) {
              // Get existing payments for this user to calculate remaining amount
              let userPayments = [];
              try {
                userPayments = await getPaymentsByUser(user.id);
              } catch (error) {
                console.warn(`Failed to load payments for user ${user.name}:`, error);
                userPayments = [];
              }
              
              // Calculate existing payments for this receipt
              const receiptPayments = userPayments.filter(p => 
                p.receiptId === receipt.name && (!p.status || p.status === 'APPROVED')
              );
              const totalPaid = receiptPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
              const remainingAmount = Math.max(0, safeNumber(receipt.total) - totalPaid);
              
              const item = {
                userId: user.id,
                userName: user.name,
                apartmentName: getApartmentName(user),
                receiptId: receipt.name,
                monthYear: receipt.name,
                amountOwed: safeNumber(receipt.total),
                amountPaid: remainingAmount, // Default to remaining amount instead of full amount
                receipt,
                user,
                key: `${user.id}-${receipt.name}`,
              };
              items.push(item);
              
              // Calculate breakdown for this item
              try {
                const breakdown = await calculatePaymentBreakdown(
                  user, 
                  receipt, 
                  services, 
                  apartments, 
                  getLaundryUser
                );
                if (breakdown) {
                  breakdowns[item.key] = breakdown;
                }
              } catch (error) {
                console.error(`Error calculating breakdown for ${user.name}:`, error);
              }
            }
          }
        }
        
        // Sort items by user name
        items.sort((a, b) => a.userName.localeCompare(b.userName));
        
        setBulkItems(items);
        setItemBreakdowns(breakdowns);
        setSelectedItems(new Set());
      } finally {
        setLoadingBulkItems(false);
      }
    };

    processItems();
  }, [filterMonth, users, services, apartments]);
  
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

  const handleRowExpand = (itemKey) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(itemKey)) {
      newExpanded.delete(itemKey);
    } else {
      newExpanded.add(itemKey);
    }
    setExpandedRows(newExpanded);
  };

  const getDebtColorClass = (debt) => {
    const debtValue = safeNumber(debt);
    if (debtValue > 0) return classes.debtPositive;
    if (debtValue < 0) return classes.debtNegative;
    return classes.debtZero;
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
  
  // Calculate breakdown totals for selected items
  const breakdownTotals = selectedItemsData.reduce((totals, item) => {
    const breakdown = itemBreakdowns[item.key];
    if (breakdown) {
      totals.basicServices += breakdown.basicServices || 0;
      totals.utilities += breakdown.utilities || 0;
      totals.rent += breakdown.rent || 0;
      totals.debt += breakdown.debt || 0;
    }
    return totals;
  }, { basicServices: 0, utilities: 0, rent: 0, debt: 0 });
  
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
                  {formatMonthYear(month)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Loading State */}
        {filterMonth && loadingBulkItems && (
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <BulkIcon className={classes.sectionIcon} />
              Cargando Datos de Pagos - {filterMonth}
            </Typography>
            <Card className={classes.tableContainer}>
              <CardContent>
                <Box className={classes.loadingContainer}>
                  <CircularProgress size={48} />
                  <Typography className={classes.loadingText}>
                    Procesando datos de pagos para {formatMonthYear(filterMonth)}...
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Payment Details for Bulk */}
        {filterMonth && !loadingBulkItems && bulkItems.length > 0 && (
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
              
              <TableContainer component={Paper} className={`${classes.tableContainer} ${classes.expandableTable}`}>
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
                      <TableCell align="right">Servicios Básicos</TableCell>
                      <TableCell align="right">Utilidades</TableCell>
                      <TableCell align="right">Alquiler</TableCell>
                      <TableCell align="right">Deuda</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Monto a Pagar</TableCell>
                      <TableCell align="center">Detalles</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bulkItems.map((item) => {
                      const breakdown = itemBreakdowns[item.key];
                      const isExpanded = expandedRows.has(item.key);
                      
                      return (
                        <React.Fragment key={item.key}>
                          <TableRow className={isExpanded ? 'expanded' : ''}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedItems.has(item.key)}
                                onChange={(e) => handleSelectItem(item.key, e.target.checked)}
                              />
                            </TableCell>
                            <TableCell>{item.userName}</TableCell>
                            <TableCell>{item.apartmentName}</TableCell>
                            <TableCell align="right" className={classes.breakdownCell}>
                              <span className={classes.breakdownValue}>
                                {breakdown ? formatCurrency(breakdown.basicServices) : '-'}
                              </span>
                            </TableCell>
                            <TableCell align="right" className={classes.breakdownCell}>
                              <span className={classes.breakdownValue}>
                                {breakdown ? formatCurrency(breakdown.utilities) : '-'}
                              </span>
                            </TableCell>
                            <TableCell align="right" className={classes.breakdownCell}>
                              <span className={classes.breakdownValue}>
                                {breakdown ? formatCurrency(breakdown.rent) : '-'}
                              </span>
                            </TableCell>
                            <TableCell align="right" className={classes.breakdownCell}>
                              <span className={`${classes.breakdownValue} ${breakdown ? getDebtColorClass(breakdown.debt) : ''}`}>
                                {breakdown ? formatCurrency(breakdown.debt) : '-'}
                              </span>
                            </TableCell>
                            <TableCell align="right" className={classes.breakdownCell}>
                              <span className={classes.breakdownValue}>
                                {item.amountPaid < item.amountOwed ? (
                                  // Show partial payment info: remaining / total
                                  <div>
                                    <div>{formatCurrency(item.amountOwed)}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                                      Pagado: {formatCurrency(item.amountOwed - item.amountPaid)}
                                    </div>
                                  </div>
                                ) : (
                                  formatCurrency(item.amountOwed)
                                )}
                              </span>
                            </TableCell>
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
                            <TableCell align="center">
                              <Button
                                className={classes.expandButton}
                                onClick={() => handleRowExpand(item.key)}
                                size="small"
                                disabled={!breakdown}
                              >
                                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </Button>
                            </TableCell>
                          </TableRow>
                          
                          {/* Expanded breakdown row */}
                          {isExpanded && breakdown && (
                            <TableRow className={classes.breakdownRow}>
                              <TableCell colSpan={10}>
                                <Box className={classes.breakdownContent}>
                                  {/* Basic Services Details */}
                                  {breakdown.basicServices > 0 && (
                                    <Box className={classes.breakdownItem}>
                                      <Typography className={classes.breakdownLabel}>
                                        Servicios Básicos
                                      </Typography>
                                      <Typography className={classes.breakdownAmount}>
                                        {formatCurrency(breakdown.basicServices)}
                                      </Typography>
                                      {breakdown.maintenance > 0 && (
                                        <Typography variant="caption" style={{ display: 'block', color: '#718096' }}>
                                          Mantenimiento: {formatCurrency(breakdown.maintenance)}
                                        </Typography>
                                      )}
                                      {breakdown.administration > 0 && (
                                        <Typography variant="caption" style={{ display: 'block', color: '#718096' }}>
                                          Administración: {formatCurrency(breakdown.administration)}
                                        </Typography>
                                      )}
                                      {breakdown.municipality > 0 && (
                                        <Typography variant="caption" style={{ display: 'block', color: '#718096' }}>
                                          Arbitrios: {formatCurrency(breakdown.municipality)}
                                        </Typography>
                                      )}
                                    </Box>
                                  )}
                                  
                                  {/* Utilities Details */}
                                  {breakdown.utilities > 0 && (
                                    <Box className={classes.breakdownItem}>
                                      <Typography className={classes.breakdownLabel}>
                                        Utilidades
                                      </Typography>
                                      <Typography className={classes.breakdownAmount}>
                                        {formatCurrency(breakdown.utilities)}
                                      </Typography>
                                      {breakdown.water > 0 && (
                                        <Typography variant="caption" style={{ display: 'block', color: '#718096' }}>
                                          Agua: {formatCurrency(breakdown.water)}
                                        </Typography>
                                      )}
                                      {breakdown.electricity > 0 && (
                                        <Typography variant="caption" style={{ display: 'block', color: '#718096' }}>
                                          Electricidad: {formatCurrency(breakdown.electricity)}
                                        </Typography>
                                      )}
                                      {breakdown.internet > 0 && (
                                        <Typography variant="caption" style={{ display: 'block', color: '#718096' }}>
                                          Internet: {formatCurrency(breakdown.internet)}
                                        </Typography>
                                      )}
                                      {breakdown.cable > 0 && (
                                        <Typography variant="caption" style={{ display: 'block', color: '#718096' }}>
                                          Cable: {formatCurrency(breakdown.cable)}
                                        </Typography>
                                      )}
                                      {breakdown.laundryTotal > 0 && (
                                        <Typography variant="caption" style={{ display: 'block', color: '#718096' }}>
                                          Lavandería: {formatCurrency(breakdown.laundryTotal)}
                                        </Typography>
                                      )}
                                    </Box>
                                  )}
                                  
                                  {/* Rent */}
                                  {breakdown.rent > 0 && (
                                    <Box className={classes.breakdownItem}>
                                      <Typography className={classes.breakdownLabel}>
                                        Alquiler
                                      </Typography>
                                      <Typography className={classes.breakdownAmount}>
                                        {formatCurrency(breakdown.rent)}
                                      </Typography>
                                    </Box>
                                  )}
                                  
                                  {/* Debt */}
                                  {breakdown.debt > 0 && (
                                    <Box className={classes.breakdownItem}>
                                      <Typography className={classes.breakdownLabel}>
                                        Deuda Anterior
                                      </Typography>
                                      <Typography className={classes.breakdownAmount}>
                                        {formatCurrency(breakdown.debt)}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Summary and Submit */}
            {selectedItems.size > 0 && (
              <Box className={classes.formSection}>
                <Alert severity="info" style={{ marginBottom: 16 }}>
                  <Box>
                    <Typography variant="h6" style={{ marginBottom: 8, color: '#1976d2' }}>
                      <strong>Resumen de {selectedItems.size} pagos seleccionados</strong>
                    </Typography>
                    <Grid container spacing={2} style={{ marginTop: 8 }}>
                      <Grid item xs={6} sm={2.4}>
                        <Box>
                          <Typography variant="caption" style={{ color: '#666', display: 'block' }}>
                            Servicios Básicos
                          </Typography>
                          <Typography variant="body2" style={{ fontWeight: 600 }}>
                            {formatCurrency(breakdownTotals.basicServices)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={2.4}>
                        <Box>
                          <Typography variant="caption" style={{ color: '#666', display: 'block' }}>
                            Utilidades
                          </Typography>
                          <Typography variant="body2" style={{ fontWeight: 600 }}>
                            {formatCurrency(breakdownTotals.utilities)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={2.4}>
                        <Box>
                          <Typography variant="caption" style={{ color: '#666', display: 'block' }}>
                            Alquiler
                          </Typography>
                          <Typography variant="body2" style={{ fontWeight: 600 }}>
                            {formatCurrency(breakdownTotals.rent)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={2.4}>
                        <Box>
                          <Typography variant="caption" style={{ color: '#666', display: 'block' }}>
                            Deuda Anterior
                          </Typography>
                          <Typography 
                            variant="body2" 
                            style={{ fontWeight: 600 }}
                            className={getDebtColorClass(breakdownTotals.debt)}
                          >
                            {formatCurrency(breakdownTotals.debt)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={2.4}>
                        <Box>
                          <Typography variant="caption" style={{ color: '#666', display: 'block' }}>
                            <strong>Total</strong>
                          </Typography>
                          <Typography variant="body1" style={{ fontWeight: 700, color: '#1976d2' }}>
                            {formatCurrency(totalAmount)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
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

        {filterMonth && !loadingBulkItems && bulkItems.length === 0 && (
          <Alert severity="info">
            No hay recibos pendientes de pago para el mes seleccionado.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}