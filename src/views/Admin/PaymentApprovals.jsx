import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Checkbox,
  makeStyles,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {
  CheckCircle as ApproveIcon,
  Cancel as DeclineIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  Schedule as PendingIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  FilterList as FilterIcon,
} from '@material-ui/icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  getPendingPayments, 
  approvePayment, 
  declinePayment,
  getAllPayments 
} from '../../utils/dbRequests/payments';
import { formatCurrency, formatMonthYear } from './PaymentComponents/utils';

const useStyles = makeStyles((theme) => ({
  formCard: {
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
  },
  actionButton: {
    padding: theme.spacing(0.5),
    margin: theme.spacing(0.25),
  },
  approveButton: {
    '&.MuiIconButton-root': {
      color: '#48bb78',
      '&:hover': {
        backgroundColor: 'rgba(72, 187, 120, 0.1)',
      },
    },
  },
  declineButton: {
    '&.MuiIconButton-root': {
      color: '#e53e3e',
      '&:hover': {
        backgroundColor: 'rgba(229, 62, 62, 0.1)',
      },
    },
  },
  viewButton: {
    '&.MuiIconButton-root': {
      color: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
      },
    },
  },
  statusChip: {
    fontWeight: 500,
    '&.pending': {
      backgroundColor: '#ed8936',
      color: 'white',
    },
    '&.approved': {
      backgroundColor: '#48bb78',
      color: 'white',
    },
    '&.declined': {
      backgroundColor: '#e53e3e',
      color: 'white',
    },
  },
  bulkActions: {
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: '#f8fafc',
    borderRadius: theme.spacing(1),
  },
  summaryCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    marginBottom: theme.spacing(3),
  },
  summaryContent: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    textAlign: 'center',
  },
}));

export default function PaymentApprovals({ refresh }) {
  const classes = useStyles();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selectedPayments, setSelectedPayments] = useState(new Set());
  const [reviewDialog, setReviewDialog] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [voucherDialog, setVoucherDialog] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, statusFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      let allPayments = [];
      
      if (statusFilter === 'ALL') {
        allPayments = await getAllPayments();
      } else {
        if (statusFilter === 'PENDING') {
          allPayments = await getPendingPayments();
        } else {
          // For other statuses, we'd need to implement specific queries
          allPayments = await getAllPayments();
        }
      }
      
      setPayments(allPayments || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = payments;
    
    if (statusFilter !== 'ALL') {
      filtered = payments.filter(payment => payment.status === statusFilter);
    }
    
    setFilteredPayments(filtered);
    setSelectedPayments(new Set()); // Clear selections when filter changes
  };

  const handleApprove = async (paymentId, notes = '') => {
    try {
      setActionLoading(true);
      await approvePayment(paymentId, 'admin', notes);
      await loadPayments();
      if (refresh) refresh();
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Error al aprobar el pago');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async (paymentId, notes = '') => {
    try {
      setActionLoading(true);
      await declinePayment(paymentId, 'admin', notes);
      await loadPayments();
      if (refresh) refresh();
    } catch (error) {
      console.error('Error declining payment:', error);
      alert('Error al rechazar el pago');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedPayments.size === 0) return;
    
    if (!window.confirm(`¿Aprobar ${selectedPayments.size} pagos seleccionados?`)) {
      return;
    }
    
    try {
      setActionLoading(true);
      const promises = Array.from(selectedPayments).map(paymentId => 
        approvePayment(paymentId, 'admin', 'Aprobado en lote')
      );
      await Promise.all(promises);
      await loadPayments();
      if (refresh) refresh();
      setSelectedPayments(new Set());
    } catch (error) {
      console.error('Error in bulk approval:', error);
      alert('Error en aprobación masiva');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectPayment = (paymentId, checked) => {
    const newSelected = new Set(selectedPayments);
    if (checked) {
      newSelected.add(paymentId);
    } else {
      newSelected.delete(paymentId);
    }
    setSelectedPayments(newSelected);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const pendingIds = filteredPayments
        .filter(p => p.status === 'PENDING')
        .map(p => p.id);
      setSelectedPayments(new Set(pendingIds));
    } else {
      setSelectedPayments(new Set());
    }
  };

  const openReviewDialog = (payment, action) => {
    setReviewDialog({ payment, action });
    setReviewNotes('');
  };

  const handleReviewSubmit = async () => {
    if (!reviewDialog) return;
    
    const { payment, action } = reviewDialog;
    
    if (action === 'approve') {
      await handleApprove(payment.id, reviewNotes);
    } else if (action === 'decline') {
      await handleDecline(payment.id, reviewNotes);
    }
    
    setReviewDialog(null);
    setReviewNotes('');
  };

  const openVoucherDialog = (payment) => {
    setVoucherDialog(payment);
  };

  const getStatusChip = (status) => {
    let label, className, icon;
    
    switch (status) {
      case 'APPROVED':
        label = 'Aprobado';
        className = 'approved';
        icon = <ApproveIcon fontSize="small" />;
        break;
      case 'DECLINED':
        label = 'Rechazado';
        className = 'declined';
        icon = <DeclineIcon fontSize="small" />;
        break;
      default:
        label = 'Pendiente';
        className = 'pending';
        icon = <PendingIcon fontSize="small" />;
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

  const pendingCount = payments.filter(p => p.status === 'PENDING').length;
  const approvedCount = payments.filter(p => p.status === 'APPROVED').length;
  const declinedCount = payments.filter(p => p.status === 'DECLINED').length;

  return (
    <Box>
      {/* Summary Cards */}
      <Card className={classes.summaryCard}>
        <CardContent>
          <Box className={classes.summaryContent}>
            <Box className={classes.summaryItem}>
              <Typography variant="h3" style={{ fontWeight: 'bold' }}>
                {pendingCount}
              </Typography>
              <Typography variant="body2">
                Pendientes
              </Typography>
            </Box>
            <Box className={classes.summaryItem}>
              <Typography variant="h3" style={{ fontWeight: 'bold' }}>
                {approvedCount}
              </Typography>
              <Typography variant="body2">
                Aprobados
              </Typography>
            </Box>
            <Box className={classes.summaryItem}>
              <Typography variant="h3" style={{ fontWeight: 'bold' }}>
                {declinedCount}
              </Typography>
              <Typography variant="body2">
                Rechazados
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <Card className={classes.formCard}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Filtrar por Estado</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Filtrar por Estado"
                  startAdornment={<FilterIcon />}
                >
                  <MenuItem value="PENDING">Pendientes</MenuItem>
                  <MenuItem value="APPROVED">Aprobados</MenuItem>
                  <MenuItem value="DECLINED">Rechazados</MenuItem>
                  <MenuItem value="ALL">Todos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {statusFilter === 'PENDING' && selectedPayments.size > 0 && (
              <Grid item xs={12} md={8}>
                <Box className={classes.bulkActions}>
                  <Typography variant="body2">
                    {selectedPayments.size} pagos seleccionados
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleBulkApprove}
                    disabled={actionLoading}
                    startIcon={<ApproveIcon />}
                    style={{ backgroundColor: '#48bb78', color: 'white' }}
                  >
                    Aprobar Seleccionados
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className={classes.formCard}>
        <CardContent>
          <Typography className={classes.sectionTitle}>
            <ReceiptIcon className={classes.sectionIcon} />
            Revisión de Pagos {statusFilter !== 'ALL' && `- ${statusFilter}`}
          </Typography>
          
          <TableContainer component={Paper} className={classes.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  {statusFilter === 'PENDING' && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedPayments.size > 0 && selectedPayments.size < filteredPayments.filter(p => p.status === 'PENDING').length}
                        checked={filteredPayments.filter(p => p.status === 'PENDING').length > 0 && selectedPayments.size === filteredPayments.filter(p => p.status === 'PENDING').length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </TableCell>
                  )}
                  <TableCell>Inquilino</TableCell>
                  <TableCell>Recibo</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha Subida</TableCell>
                  <TableCell align="center">Comprobante</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    {statusFilter === 'PENDING' && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedPayments.has(payment.id)}
                          onChange={(e) => handleSelectPayment(payment.id, e.target.checked)}
                          disabled={payment.status !== 'PENDING'}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <PersonIcon style={{ marginRight: 8, color: '#667eea' }} />
                        {payment.userName}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {formatMonthYear(payment.monthYear)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(payment.amountPaid)}
                    </TableCell>
                    <TableCell>
                      {getStatusChip(payment.status)}
                    </TableCell>
                    <TableCell>
                      {payment.uploadDate && format(payment.uploadDate.toDate(), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver comprobante">
                        <IconButton
                          className={`${classes.actionButton} ${classes.viewButton}`}
                          onClick={() => openVoucherDialog(payment)}
                          size="small"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {payment.voucherUrl && (
                        <Tooltip title="Descargar">
                          <IconButton
                            className={`${classes.actionButton} ${classes.viewButton}`}
                            onClick={() => window.open(payment.voucherUrl, '_blank')}
                            size="small"
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {payment.status === 'PENDING' && (
                        <>
                          <Tooltip title="Aprobar pago">
                            <IconButton
                              className={`${classes.actionButton} ${classes.approveButton}`}
                              onClick={() => openReviewDialog(payment, 'approve')}
                              disabled={actionLoading}
                              size="small"
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rechazar pago">
                            <IconButton
                              className={`${classes.actionButton} ${classes.declineButton}`}
                              onClick={() => openReviewDialog(payment, 'decline')}
                              disabled={actionLoading}
                              size="small"
                            >
                              <DeclineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {payment.reviewNotes && (
                        <Tooltip title={payment.reviewNotes}>
                          <IconButton size="small">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={statusFilter === 'PENDING' ? 8 : 7} align="center">
                      {loading ? 'Cargando...' : 'No hay pagos para mostrar'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!reviewDialog} onClose={() => setReviewDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {reviewDialog?.action === 'approve' ? 'Aprobar Pago' : 'Rechazar Pago'}
        </DialogTitle>
        <DialogContent>
          {reviewDialog && (
            <Box>
              <Typography variant="body2" style={{ marginBottom: 16 }}>
                <strong>Inquilino:</strong> {reviewDialog.payment.userName}<br/>
                <strong>Recibo:</strong> {formatMonthYear(reviewDialog.payment.monthYear)}<br/>
                <strong>Monto:</strong> {formatCurrency(reviewDialog.payment.amountPaid)}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={reviewDialog.action === 'approve' ? 'Notas (opcional)' : 'Motivo del rechazo'}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                variant="outlined"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(null)}>
            Cancelar
          </Button>
          <Button
            onClick={handleReviewSubmit}
            disabled={actionLoading}
            variant="contained"
            color={reviewDialog?.action === 'approve' ? 'primary' : 'secondary'}
          >
            {reviewDialog?.action === 'approve' ? 'Aprobar' : 'Rechazar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Voucher Preview Dialog */}
      <Dialog open={!!voucherDialog} onClose={() => setVoucherDialog(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          Comprobante de Pago
        </DialogTitle>
        <DialogContent>
          {voucherDialog && (
            <Box>
              <Typography variant="body2" style={{ marginBottom: 16 }}>
                <strong>Inquilino:</strong> {voucherDialog.userName}<br/>
                <strong>Recibo:</strong> {formatMonthYear(voucherDialog.monthYear)}<br/>
                <strong>Monto:</strong> {formatCurrency(voucherDialog.amountPaid)}<br/>
                <strong>Archivo:</strong> {voucherDialog.voucherFilename}
              </Typography>
              {voucherDialog.voucherUrl && (
                <Box style={{ textAlign: 'center', padding: 20 }}>
                  {voucherDialog.voucherFilename?.toLowerCase().includes('.pdf') ? (
                    <embed
                      src={voucherDialog.voucherUrl}
                      type="application/pdf"
                      width="100%"
                      height="500px"
                    />
                  ) : (
                    <img
                      src={voucherDialog.voucherUrl}
                      alt="Comprobante"
                      style={{ maxWidth: '100%', maxHeight: '500px' }}
                    />
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVoucherDialog(null)}>
            Cerrar
          </Button>
          {voucherDialog?.voucherUrl && (
            <Button
              onClick={() => window.open(voucherDialog.voucherUrl, '_blank')}
              variant="contained"
              color="primary"
            >
              Descargar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}