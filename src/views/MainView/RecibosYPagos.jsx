import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  LinearProgress,
  makeStyles,
  Divider,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon,
  CloudUpload as UploadIcon,
  FileCopy as CopyIcon,
  CheckCircle as PaidIcon,
  Schedule as PendingIcon,
  Cancel as DeclinedIcon,
  AttachMoney as MoneyIcon,
  CloudDownloadRounded,
  Delete as DeleteIcon,
} from '@material-ui/icons';
import { formatCurrency, formatMonthYear } from '../Admin/PaymentComponents/utils';
import { 
  uploadPaymentVoucher, 
  getPaymentsByUser,
  getCachedUserDebt 
} from '../../utils/dbRequests/payments';
import { storage, deleteReciept, updateUser } from '../../utils/dbRequests';
import { 
  calculateReceiptPaymentStatus, 
  sortReceiptsByDate, 
  getUnpaidEligibleReceipts 
} from '../../utils/receiptUtils';
import { getDownloadURL, ref } from 'firebase/storage';
import DeleteModal from '../Admin/components/DeleteModal';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  },
  sectionCard: {
    borderRadius: '16px',
    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    background: '#ffffff',
  },
  sectionTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: '#1a202c',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontSize: '1.25rem',
  },
  pageTitle: {
    marginBottom: theme.spacing(3),
    fontWeight: 700,
    color: '#1a202c',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  bankInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: theme.spacing(1.5, 0),
    borderBottom: '1px solid #f1f5f9',
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  bankIcon: {
    color: '#2563eb',
    marginRight: theme.spacing(1.5),
    fontSize: '1.25rem',
  },
  bankLabel: {
    fontWeight: 500,
    color: '#374151',
    minWidth: '120px',
    fontSize: '0.9rem',
  },
  bankValue: {
    color: '#1a202c',
    fontSize: '0.95rem',
    fontWeight: 400,
    flex: 1,
  },
  clickableBankValue: {
    color: '#1a202c',
    fontSize: '0.95rem',
    fontWeight: 400,
    flex: 1,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
      color: '#2563eb',
    },
  },
  copyButton: {
    padding: theme.spacing(0.5),
    color: theme.palette.primary.main,
    cursor: 'pointer',
  },
  uploadArea: {
    border: `2px dashed ${theme.palette.primary.main}`,
    borderRadius: theme.spacing(2),
    padding: theme.spacing(4),
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    '&:hover': {
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      borderColor: theme.palette.primary.dark,
    },
  },
  fileInput: {
    display: 'none',
  },
  uploadButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontWeight: 600,
    padding: theme.spacing(1.5, 4),
    borderRadius: theme.spacing(1),
    textTransform: 'none',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    cursor: 'pointer',
    '&:hover': {
      background: 'linear-gradient(135deg, #5569d8 0%, #6a4190 100%)',
      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
    },
    '&:disabled': {
      background: '#cbd5e0',
      color: '#a0aec0',
      boxShadow: 'none',
      cursor: 'not-allowed',
    },
  },
  statusChip: {
    fontWeight: 500,
    '&.approved': {
      backgroundColor: '#48bb78',
      color: 'white',
    },
    '&.pending': {
      backgroundColor: '#ed8936',
      color: 'white',
    },
    '&.declined': {
      backgroundColor: '#e53e3e',
      color: 'white',
    },
    '&.unpaid': {
      backgroundColor: '#cbd5e0',
      color: '#4a5568',
    },
  },
  tableContainer: {
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  downloadButton: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    color: '#667eea',
    '&:hover': {
      backgroundColor: 'rgba(102, 126, 234, 0.2)',
    },
  },
  paymentSection: {
    padding: theme.spacing(3),
  },
  receiptSection: {
    padding: theme.spacing(3),
  },
}));

const bankInfo = {
  banco: 'Interbank',
  tipoCuenta: 'Cuenta Simple Soles Ahorros',
  numeroCuenta: '294-3147140804',
  codigoCCI: '003-294-013147140804-',
  titular: 'Federico Roque Octavio Debernardi Migliaro',
};

export default function RecibosYPagos({ user, refresh, handleModal, allowEdit = false }) {
  const classes = useStyles();
  const [userPayments, setUserPayments] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [refreshData, setRefreshData] = useState(0);
  const [userDebt, setUserDebt] = useState(0);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id, refreshData]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setLoadingPayments(true);
      
      // Load payments and debt in parallel
      const [payments, debt] = await Promise.all([
        getPaymentsByUser(user.id),
        getCachedUserDebt(user.id)
      ]);
      
      setUserPayments(payments || []);
      setUserDebt(debt);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
      setLoadingPayments(false);
    }
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`${label} copied to clipboard`);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten archivos PDF o imágenes (JPG, PNG)');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo debe ser menor a 10MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUploadPayment = async () => {
    if (!selectedReceipt || !selectedFile || !paymentAmount) {
      alert('Por favor complete todos los campos');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor ingrese un monto válido');
      return;
    }

    const receipt = user.reciepts?.find(r => r.name === selectedReceipt);
    if (!receipt) {
      alert('Recibo no encontrado');
      return;
    }

    try {
      setUploading(true);
      
      const paymentData = {
        userId: user.id,
        userName: user.name,
        receiptId: selectedReceipt,
        monthYear: selectedReceipt,
        amountOwed: receipt.total,
        amountPaid: amount,
        status: 'PENDING',
        uploadDate: new Date().toISOString(),
      };

      await uploadPaymentVoucher(paymentData, selectedFile, storage);
      
      // Reset form
      setSelectedReceipt('');
      setSelectedFile(null);
      setPaymentAmount('');
      
      // Clear file input
      const fileInput = document.getElementById('payment-file-input');
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Refresh data
      setRefreshData(prev => prev + 1);
      
      alert('Comprobante de pago subido exitosamente. Está pendiente de aprobación por el administrador.');
      
    } catch (error) {
      console.error('Error uploading payment:', error);
      alert('Error al subir el comprobante. Por favor intente nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const downloadFileFromStorage = async (reciept) => {
    const storageRef = ref(storage, reciept.url);
    const url = await getDownloadURL(storageRef);
    window.open(url, '_blank');
  };

  const handleChangePaid = async (reciept, isPaid) => {
    const recieptIndex = reciept.id;
    const updatedReciept = { ...user.reciepts[recieptIndex], paid: isPaid };
    const newReciepts = user.reciepts;
    newReciepts[recieptIndex] = updatedReciept;
    const updatedUser = { ...user, reciepts: [...newReciepts] };
    await updateUser(updatedUser);
    await refresh();
    await loadUserData();
  };

  const onDelete = async (reciept) => {
    await deleteReciept(user, reciept);
  };

  const getStatusChip = (status, amount, total) => {
    let label, className, icon;
    
    switch (status) {
      case 'approved':
      case 'paid':
        label = 'Pagado';
        className = 'approved';
        icon = <PaidIcon fontSize="small" />;
        break;
      case 'pending':
        label = 'En Revisión';
        className = 'pending';
        icon = <PendingIcon fontSize="small" />;
        break;
      case 'partial':
        label = `Parcial (${formatCurrency(amount)}/${formatCurrency(total)})`;
        className = 'pending';
        icon = <MoneyIcon fontSize="small" />;
        break;
      default:
        label = 'Pendiente';
        className = 'unpaid';
        icon = <ReceiptIcon fontSize="small" />;
    }
    
    return (
      <Chip
        icon={icon}
        label={label}
        size="small"
        className={`${classes.statusChip} ${className}`}
      />
    );
  };

  // Get unpaid receipts for upload selection (only July 2025 onwards)
  const unpaidReceipts = getUnpaidEligibleReceipts(user.reciepts || [], userPayments);

  // Sort receipts by date (newest first) and add id
  const processedReceipts = sortReceiptsByDate(user.reciepts || [])
    .map((r, i) => ({ ...r, id: i }));

  return (
    <Box>
      <Typography variant='h4' className={classes.pageTitle}>
        Recibos y Pagos
      </Typography>

      {/* Outstanding Debt Alert */}
      {userDebt > 0 && (
        <Alert 
          severity="warning" 
          style={{ 
            marginBottom: 24,
            borderRadius: 12,
            backgroundColor: '#fff8e1',
            border: '1px solid #ffcc02'
          }}
          icon={<MoneyIcon />}
        >
          <Typography variant="body1" style={{ fontWeight: 500 }}>
            Tienes una deuda pendiente de {formatCurrency(userDebt)}
          </Typography>
          <Typography variant="body2" color="textSecondary" style={{ marginTop: 4 }}>
            Puedes realizar el pago utilizando el formulario de abajo con la información bancaria proporcionada.
          </Typography>
        </Alert>
      )}

      <div className={classes.root}>
        {/* Receipts Section */}
        <Card className={classes.sectionCard}>
          <CardContent className={classes.receiptSection}>
            <Typography variant='h6' className={classes.sectionTitle}>
              <ReceiptIcon /> Mis Recibos
            </Typography>
            
            <TableContainer component={Paper} className={classes.tableContainer}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Descargar</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Mes</TableCell>
                    <TableCell align="right">Monto</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    {allowEdit && <TableCell align="center">Eliminar</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {processedReceipts.length > 0 ? processedReceipts.map((receipt) => {
                    const paymentStatus = calculateReceiptPaymentStatus(receipt, userPayments);
                    const receiptPayments = userPayments.filter(p => 
                      p.receiptId === receipt.name && p.status === 'APPROVED'
                    );
                    const totalPaid = receiptPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
                    
                    // Map unified status to component status format
                    const statusMapping = {
                      'paid': 'approved',
                      'pending': 'pending', 
                      'partial': 'partial',
                      'unpaid': 'unpaid'
                    };
                    const status = statusMapping[paymentStatus.status] || 'unpaid';
                    
                    return (
                      <TableRow key={receipt.name}>
                        <TableCell>
                          <IconButton
                            className={classes.downloadButton}
                            size="small"
                            onClick={() => downloadFileFromStorage(receipt)}
                            title="Descargar recibo"
                          >
                            <CloudDownloadRounded fontSize="small" />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={new Date(receipt.date).toLocaleDateString('es-ES')}
                            size="small"
                            style={{ 
                              backgroundColor: '#e0e7ff', 
                              color: '#3730a3',
                              fontSize: '0.8rem'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" style={{ fontWeight: 500 }}>
                            {formatMonthYear(receipt.name)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(receipt.total)}
                        </TableCell>
                        <TableCell align="center">
                          {getStatusChip(status, totalPaid, receipt.total)}
                        </TableCell>
                        {allowEdit && (
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleModal(
                                  <DeleteModal
                                    onCancel={() => handleModal()}
                                    onSave={async () => {
                                      await onDelete(receipt);
                                      handleModal();
                                    }}
                                  />
                                )
                              }
                              title="Eliminar recibo"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={allowEdit ? 6 : 5} align="center">
                        No hay recibos disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Payment Section */}
        <Card className={classes.sectionCard}>
          <CardContent className={classes.paymentSection}>
            <Typography variant='h6' className={classes.sectionTitle}>
              <MoneyIcon /> Realizar Pago
            </Typography>
            
            {/* Bank Information */}
            <Box mb={4}>
              <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 16 }}>
                Información Bancaria
              </Typography>
              
              <Box>
                <Box className={classes.bankInfo}>
                  <BankIcon className={classes.bankIcon} />
                  <Typography className={classes.bankLabel}>
                    Banco:
                  </Typography>
                  <Typography className={classes.bankValue}>
                    {bankInfo.banco}
                  </Typography>
                </Box>
                
                <Box className={classes.bankInfo}>
                  <BankIcon className={classes.bankIcon} />
                  <Typography className={classes.bankLabel}>
                    Tipo:
                  </Typography>
                  <Typography className={classes.bankValue}>
                    {bankInfo.tipoCuenta}
                  </Typography>
                </Box>
                
                <Box className={classes.bankInfo}>
                  <BankIcon className={classes.bankIcon} />
                  <Typography className={classes.bankLabel}>
                    N° de cuenta:
                  </Typography>
                  <Typography 
                    className={classes.clickableBankValue}
                    onClick={() => copyToClipboard(bankInfo.numeroCuenta, 'Número de cuenta')}
                    title="Clic para copiar número de cuenta"
                  >
                    {bankInfo.numeroCuenta}
                  </Typography>
                  <Tooltip title="Copiar número de cuenta">
                    <IconButton
                      className={classes.copyButton}
                      onClick={() => copyToClipboard(bankInfo.numeroCuenta, 'Número de cuenta')}
                      size="small"
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box className={classes.bankInfo}>
                  <BankIcon className={classes.bankIcon} />
                  <Typography className={classes.bankLabel}>
                    Código CCI:
                  </Typography>
                  <Typography 
                    className={classes.clickableBankValue}
                    onClick={() => copyToClipboard(bankInfo.codigoCCI, 'Código CCI')}
                    title="Clic para copiar código CCI"
                  >
                    {bankInfo.codigoCCI}
                  </Typography>
                  <Tooltip title="Copiar código CCI">
                    <IconButton
                      className={classes.copyButton}
                      onClick={() => copyToClipboard(bankInfo.codigoCCI, 'Código CCI')}
                      size="small"
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box className={classes.bankInfo}>
                  <BankIcon className={classes.bankIcon} />
                  <Typography className={classes.bankLabel}>
                    Titular:
                  </Typography>
                  <Typography className={classes.bankValue}>
                    {bankInfo.titular}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider style={{ margin: '24px 0' }} />

            {/* Payment Upload */}
            <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 16 }}>
              Subir Comprobante de Pago
            </Typography>
            
            {unpaidReceipts.length > 0 ? (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      value={selectedReceipt}
                      onChange={(e) => {
                        const receiptName = e.target.value;
                        setSelectedReceipt(receiptName);
                        
                        // Auto-fill payment amount with receipt total
                        if (receiptName) {
                          const receipt = unpaidReceipts.find(r => r.name === receiptName);
                          if (receipt) {
                            setPaymentAmount(receipt.total.toString());
                          }
                        } else {
                          setPaymentAmount('');
                        }
                      }}
                      variant="outlined"
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="">Seleccione un recibo</option>
                      {unpaidReceipts.map((receipt) => (
                        <option key={receipt.name} value={receipt.name}>
                          {formatMonthYear(receipt.name)} - {formatCurrency(receipt.total)}
                        </option>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Monto Pagado"
                      placeholder="0.00"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">S/.</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
                
                {selectedReceipt && paymentAmount && (
                  <Box mt={3}>
                    <input
                      accept=".pdf,.jpg,.jpeg,.png"
                      className={classes.fileInput}
                      id="payment-file-input"
                      type="file"
                      onChange={handleFileSelect}
                    />
                    <label htmlFor="payment-file-input">
                      <Box className={classes.uploadArea}>
                        <UploadIcon style={{ fontSize: 48, marginBottom: 16, color: '#667eea' }} />
                        <Typography variant="h6" style={{ marginBottom: 8 }}>
                          {selectedFile ? selectedFile.name : 'Seleccionar comprobante'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          PDF o imágenes (JPG, PNG). Máximo 10MB.
                        </Typography>
                      </Box>
                    </label>
                    
                    {selectedFile && (
                      <Box style={{ textAlign: 'center', marginTop: 16 }}>
                        <Button
                          variant="contained"
                          className={classes.uploadButton}
                          onClick={handleUploadPayment}
                          disabled={uploading}
                          startIcon={uploading ? null : <UploadIcon />}
                        >
                          {uploading ? (
                            <>
                              <LinearProgress style={{ width: 100, marginRight: 8 }} />
                              Subiendo...
                            </>
                          ) : (
                            'Subir Comprobante'
                          )}
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            ) : (
              <Alert severity="info">
                No tienes recibos pendientes de pago.
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </Box>
  );
}