import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Snackbar,
  makeStyles,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {
  Payment as PaymentIcon,
  CheckCircle as ApprovalIcon,
} from '@material-ui/icons';
import {
  registerPayment,
  getAllPayments,
  getPaymentsByUser,
  getPaymentSummaryForReceipt,
  updateUserDebt,
  updatePayment,
  deletePayment,
} from '../../utils/dbRequests/payments';
import { updateUser } from '../../utils/dbRequests';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Import our new components
import PaymentStats from './PaymentComponents/PaymentStats';
import PaymentForm from './PaymentComponents/PaymentForm';
import PaymentHistory from './PaymentComponents/PaymentHistory';
import PaymentFilters from './PaymentComponents/PaymentFilters';
import BulkPaymentForm from './PaymentComponents/BulkPaymentForm';
import TaxDocumentsUpload from './PaymentComponents/TaxDocumentsUpload';
import PaymentEditModal from './PaymentComponents/PaymentEditModal';
import MonthlyPaymentsChart from './PaymentComponents/MonthlyPaymentsChart';
import DeleteModal from './components/DeleteModal';
import { ModalContext } from './components/SimpleModal';
import PaymentApprovals from './PaymentApprovals';
import { 
  calculatePaymentStats, 
  exportPaymentsToCSV, 
  safeNumber, 
  getApartmentName 
} from './PaymentComponents/utils';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
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
  },
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function Payments({ users, apartments, services, storage, refresh }) {
  const classes = useStyles();
  const handleModal = useContext(ModalContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Payment edit state
  const [editingPayment, setEditingPayment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Early return if users data is not ready
  if (!users) {
    return (
      <Box className={classes.root}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }
  
  // Form states
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  
  // Data states
  const [allPayments, setAllPayments] = useState([]);
  const [userReceipts, setUserReceipts] = useState([]);
  const [receiptSummary, setReceiptSummary] = useState(null);
  const [stats, setStats] = useState({ totalCollected: 0, pendingPayments: 0, totalDebt: 0 });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  
  // Alert state
  const [alert, setAlert] = useState({ open: false, severity: 'success', message: '' });

  useEffect(() => {
    loadPayments();
    loadStats();
  }, [users]);

  useEffect(() => {
    if (selectedUser) {
      const user = users.find(u => u.id === selectedUser);
      if (user && user.reciepts) {
        setUserReceipts(user.reciepts || []);
      }
    }
  }, [selectedUser, users]);

  useEffect(() => {
    if (selectedUser && selectedReceipt) {
      loadReceiptSummary();
    }
  }, [selectedUser, selectedReceipt]);

  const loadStats = async () => {
    if (!users || users.length === 0) return;
    try {
      const calculatedStats = await calculatePaymentStats(users);
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const loadPayments = async () => {
    try {
      const payments = await getAllPayments();
      setAllPayments(payments);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const loadReceiptSummary = async () => {
    try {
      const summary = await getPaymentSummaryForReceipt(selectedUser, selectedReceipt);
      setReceiptSummary(summary);
    } catch (error) {
      console.error('Error loading receipt summary:', error);
    }
  };

  const showAlert = (severity, message) => {
    setAlert({ open: true, severity, message });
  };

  const handleSubmitPayment = async () => {
    if (!selectedUser || !selectedReceipt || !paymentAmount) {
      showAlert('error', 'Por favor complete todos los campos requeridos');
      return;
    }

    if (parseFloat(paymentAmount) <= 0) {
      showAlert('error', 'El monto debe ser mayor a 0');
      return;
    }

    setLoading(true);
    try {
      const user = users.find(u => u.id === selectedUser);
      const receipt = userReceipts.find(r => r.name === selectedReceipt);
      
      const paymentData = {
        userId: selectedUser,
        userName: user.name,
        apartmentName: getApartmentName(user),
        receiptId: selectedReceipt,
        monthYear: receipt.name,
        amountOwed: receipt.total || 0,
        amountPaid: parseFloat(paymentAmount),
        paymentDate: paymentDate.toISOString(),
        notes,
        createdBy: 'admin',
      };

      await registerPayment(paymentData);
      
      // Reset form
      setPaymentAmount('');
      setNotes('');
      setSelectedReceipt('');
      
      // Reload data
      await loadPayments();
      await loadStats();
      
      showAlert('success', 'Pago registrado exitosamente');
    } catch (error) {
      console.error('Error registering payment:', error);
      showAlert('error', 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (bulkPaymentData) => {
    setLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const paymentData of bulkPaymentData) {
        try {
          await registerPayment(paymentData);
          successCount++;
        } catch (error) {
          console.error(`Error registering payment for ${paymentData.userName}:`, error);
          errorCount++;
        }
      }

      // Reload data
      await loadPayments();
      await loadStats();
      
      if (errorCount === 0) {
        showAlert('success', `${successCount} pagos registrados exitosamente`);
      } else {
        showAlert('warning', `${successCount} pagos registrados exitosamente, ${errorCount} fallaron`);
      }
    } catch (error) {
      console.error('Error processing bulk payments:', error);
      showAlert('error', 'Error al procesar los pagos masivos');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedReceiptData = () => {
    if (!selectedReceipt || !userReceipts) return null;
    return userReceipts.find(r => r.name === selectedReceipt);
  };

  const calculateBalance = () => {
    const receipt = getSelectedReceiptData();
    if (!receipt) return null;
    
    const owed = receipt.total || 0;
    const paid = parseFloat(paymentAmount) || 0;
    const previousPayments = receiptSummary?.totalPaid || 0;
    const totalPaid = previousPayments + paid;
    const balance = owed - totalPaid;
    
    return {
      owed,
      paid,
      previousPayments,
      totalPaid,
      balance,
      isFullyPaid: balance <= 0,
    };
  };

  const balance = calculateBalance();
  
  // Filter payments based on search and filter criteria
  const filteredPayments = allPayments.filter(payment => {
    const matchesSearch = !searchTerm || 
      payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.monthYear.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMonth = !filterMonth || payment.monthYear === filterMonth;
    
    return matchesSearch && matchesMonth;
  });
  
  // Get unique months for filters
  const availableMonths = [...new Set(allPayments.map(p => p.monthYear))].sort();
  
  const handleExport = () => {
    exportPaymentsToCSV(filteredPayments, showAlert, format, es);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterMonth('');
  };

  const handleTaxDocumentUpload = async (documentData, file) => {
    try {
      setLoading(true);
      
      // Upload file to storage
      const storageRef = ref(storage, `tax_documents/${documentData.userId}/${documentData.filename}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update user with new tax document
      const user = users.find(u => u.id === documentData.userId);
      if (!user) throw new Error('Usuario no encontrado');
      
      const updatedTaxDocuments = [
        ...(user.tax_documents || []),
        {
          ...documentData,
          downloadURL,
          storagePath: snapshot.ref.fullPath,
        }
      ];
      
      await updateUser({
        ...user,
        tax_documents: updatedTaxDocuments,
      });
      
      showAlert('success', 'Documento tributario subido exitosamente');
      
      // Refresh data to show updated tax documents
      if (refresh) {
        await refresh();
      }
    } catch (error) {
      console.error('Error uploading tax document:', error);
      showAlert('error', 'Error al subir el documento tributario');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setShowEditModal(true);
  };

  const handleDeletePayment = (payment) => {
    handleModal(
      <DeleteModal
        onCancel={() => handleModal()}
        onSave={async () => {
          try {
            setLoading(true);
            await deletePayment(payment.id, storage);
            await loadPayments();
            if (refresh) {
              await refresh();
            }
            showAlert('success', 'Pago eliminado exitosamente');
          } catch (error) {
            console.error('Error deleting payment:', error);
            showAlert('error', 'Error al eliminar el pago');
          } finally {
            setLoading(false);
          }
          handleModal();
        }}
      />
    );
  };

  const handleSaveEditedPayment = async (updatedPayment) => {
    try {
      setLoading(true);
      await updatePayment(updatedPayment.id, updatedPayment);
      await loadPayments();
      if (refresh) {
        await refresh();
      }
      setShowEditModal(false);
      setEditingPayment(null);
      showAlert('success', 'Pago actualizado exitosamente');
    } catch (error) {
      console.error('Error updating payment:', error);
      showAlert('error', 'Error al actualizar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPayment(null);
  };

  return (
    <Box className={classes.root}>
      {/* Header */}
      <Box className={classes.header}>
        <Typography variant="h4" className={classes.title}>
          <PaymentIcon style={{ marginRight: 12, verticalAlign: 'middle' }} />
          Gestión de Pagos
        </Typography>
        <Typography variant="subtitle1" className={classes.subtitle}>
          Registra y administra los pagos de los inquilinos
        </Typography>
      </Box>

      {/* Stats Cards */}
      <PaymentStats stats={stats} />

      {/* Monthly Payments Chart */}
      <MonthlyPaymentsChart users={users} payments={allPayments} />

      {/* Tabs */}
      <Paper square>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Registrar Pago" />
          <Tab label="Pagos Masivos" />
          <Tab label="Historial de Pagos" />
          <Tab 
            label="Aprobar Pagos" 
            icon={<ApprovalIcon />}
          />
          <Tab label="Documentos SUNAT" />
        </Tabs>
      </Paper>

      {/* Register Payment Tab */}
      <TabPanel value={tabValue} index={0}>
        <PaymentForm
          users={users}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          userReceipts={userReceipts}
          selectedReceipt={selectedReceipt}
          setSelectedReceipt={setSelectedReceipt}
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          paymentDate={paymentDate}
          setPaymentDate={setPaymentDate}
          notes={notes}
          setNotes={setNotes}
          balance={balance}
          loading={loading}
          onSubmit={handleSubmitPayment}
        />
      </TabPanel>

      {/* Bulk Payment Tab */}
      <TabPanel value={tabValue} index={1}>
        <BulkPaymentForm
          users={users}
          apartments={apartments}
          services={services}
          onSubmit={handleBulkSubmit}
          loading={loading}
        />
      </TabPanel>

      {/* Payment History Tab */}
      <TabPanel value={tabValue} index={2}>
        <PaymentFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterMonth={filterMonth}
          setFilterMonth={setFilterMonth}
          availableMonths={availableMonths}
          filteredPayments={filteredPayments}
          allPayments={allPayments}
          onExport={handleExport}
          onClearFilters={handleClearFilters}
        />
        
        <PaymentHistory 
          filteredPayments={filteredPayments} 
          allPayments={allPayments}
          onEditPayment={handleEditPayment}
          onDeletePayment={handleDeletePayment}
        />
      </TabPanel>

      {/* Payment Approvals Tab */}
      <TabPanel value={tabValue} index={3}>
        <PaymentApprovals refresh={refresh} />
      </TabPanel>

      {/* Tax Documents Tab */}
      <TabPanel value={tabValue} index={4}>
        <TaxDocumentsUpload
          users={users}
          storage={storage}
          onUpload={handleTaxDocumentUpload}
          loading={loading}
          refresh={refresh}
        />
      </TabPanel>
      
      {/* Alert Snackbar */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setAlert({ ...alert, open: false })} 
          severity={alert.severity}
          variant="filled"
        >
          {alert.message}
        </Alert>
      </Snackbar>
      
      {/* Payment Edit Modal */}
      <PaymentEditModal
        open={showEditModal}
        payment={editingPayment}
        onClose={handleCloseEditModal}
        onSave={handleSaveEditedPayment}
        loading={loading}
      />
    </Box>
  );
}