import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  makeStyles,
} from '@material-ui/core';
import {
  CloudDownloadRounded,
  Receipt as ReceiptIcon,
  Delete as DeleteIcon,
} from '@material-ui/icons';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage, deleteReciept, updateUser } from '../../../utils/dbRequests';
import { getPaymentsByUser } from '../../../utils/dbRequests/payments';
import { formatMonthYear } from '../PaymentComponents/utils';
import { 
  calculateReceiptPaymentStatus, 
  sortReceiptsByDate 
} from '../../../utils/receiptUtils';
import DeleteModal from './DeleteModal';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
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
}));

export default function AdminReceiptManager({ user, refresh, handleModal }) {
  const classes = useStyles();
  const [userPayments, setUserPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadUserPayments();
    }
  }, [user?.id]);

  const loadUserPayments = async () => {
    try {
      setLoadingPayments(true);
      const payments = await getPaymentsByUser(user.id);
      setUserPayments(payments || []);
    } catch (error) {
      console.error('Error loading user payments:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  const downloadFileFromStorage = async (receipt) => {
    const storageRef = ref(storage, receipt.url);
    const url = await getDownloadURL(storageRef);
    window.open(url, '_blank');
  };

  const handleChangePaid = async (receipt, isPaid) => {
    const receiptIndex = receipt.id;
    const updatedReceipt = { ...user.reciepts[receiptIndex], paid: isPaid };
    const newReceipts = user.reciepts;
    newReceipts[receiptIndex] = updatedReceipt;
    const updatedUser = { ...user, reciepts: [...newReceipts] };
    await updateUser(updatedUser);
    await refresh();
  };

  const onDelete = async (receipt) => {
    await deleteReciept(user, receipt);
    await refresh();
  };

  const getStatusChip = (status, amount, total) => {
    let label, className, icon;
    
    switch (status) {
      case 'approved':
      case 'paid':
        label = 'Pagado';
        className = 'approved';
        break;
      case 'pending':
        label = 'En Revisión';
        className = 'pending';
        break;
      case 'partial':
        label = `Parcial (S/.${amount.toFixed(2)}/S/.${total.toFixed(2)})`;
        className = 'pending';
        break;
      default:
        label = 'Pendiente';
        className = 'unpaid';
    }
    
    return (
      <Chip
        label={label}
        size="small"
        className={`${classes.statusChip} ${className}`}
      />
    );
  };

  // Sort receipts by date (newest first) and add id
  const processedReceipts = sortReceiptsByDate(user.reciepts || [])
    .map((r, i) => ({ ...r, id: i }));

  return (
    <Box className={classes.root}>
      <Typography variant='h5' className={classes.pageTitle}>
        Gestión de Recibos - {user.name}
      </Typography>

      <Card className={classes.sectionCard}>
        <CardContent>
          <Typography variant='h6' className={classes.sectionTitle}>
            <ReceiptIcon /> Recibos del Usuario
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
                  <TableCell align="center">Eliminar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processedReceipts.length > 0 ? processedReceipts.map((receipt) => {
                  const paymentStatus = calculateReceiptPaymentStatus(receipt, userPayments);
                  const receiptPayments = userPayments.filter(p => 
                    p.receiptId === receipt.name && (!p.status || p.status === 'APPROVED')
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
                        S/.{receipt.total?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell align="center">
                        {getStatusChip(status, totalPaid, receipt.total)}
                      </TableCell>
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
                          style={{ color: '#e53e3e' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No hay recibos disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}