import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  IconButton,
  Tooltip,
  makeStyles,
} from '@material-ui/core';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@material-ui/icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency, safeNumber, formatMonthYear } from './utils';

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  actionButton: {
    padding: theme.spacing(0.5),
    '&.MuiIconButton-root': {
      color: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
      },
    },
  },
  deleteButton: {
    '&.MuiIconButton-root': {
      color: theme.palette.error.main,
      '&:hover': {
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
      },
    },
  },
}));

export default function PaymentHistory({ filteredPayments, allPayments, onEditPayment, onDeletePayment }) {
  const classes = useStyles();

  return (
    <>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Inquilino</TableCell>
              <TableCell>Mes/Año</TableCell>
              <TableCell align="right">Monto</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {(() => {
                    try {
                      if (payment.paymentDate) {
                        return format(new Date(payment.paymentDate), 'dd/MM/yyyy', { locale: es });
                      }
                      if (payment.uploadDate && payment.uploadDate.toDate) {
                        return format(payment.uploadDate.toDate(), 'dd/MM/yyyy', { locale: es });
                      }
                      if (payment.createdAt && payment.createdAt.toDate) {
                        return format(payment.createdAt.toDate(), 'dd/MM/yyyy', { locale: es });
                      }
                      return 'N/A';
                    } catch (error) {
                      console.error('Error formatting date for payment:', payment.id, error);
                      return 'Error';
                    }
                  })()}
                </TableCell>
                <TableCell>{payment.userName}</TableCell>
                <TableCell>{formatMonthYear(payment.monthYear)}</TableCell>
                <TableCell align="right">
                  {payment.amountOwed && payment.amountPaid < payment.amountOwed ? (
                    // Show partial payment format: paid / owed
                    <div>
                      <div>{formatCurrency(payment.amountPaid)} / {formatCurrency(payment.amountOwed)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                        Pendiente: {formatCurrency(payment.amountOwed - payment.amountPaid)}
                      </div>
                    </div>
                  ) : (
                    // Show normal payment amount
                    formatCurrency(payment.amountPaid)
                  )}
                </TableCell>
                <TableCell>
                  {payment.status ? (
                    // User payment with status
                    <Chip 
                      size="small" 
                      label={
                        payment.status === 'APPROVED' ? 'Aprobado' :
                        payment.status === 'PENDING' ? 'Pendiente' :
                        payment.status === 'DECLINED' ? 'Rechazado' :
                        payment.status
                      }
                      style={{ 
                        backgroundColor: 
                          payment.status === 'APPROVED' ? '#48bb78' :
                          payment.status === 'PENDING' ? '#ed8936' :
                          payment.status === 'DECLINED' ? '#e53e3e' :
                          '#cbd5e0',
                        color: 'white' 
                      }} 
                    />
                  ) : (
                    // Admin payment (no status, check amount)
                    payment.amountPaid >= payment.amountOwed ? (
                      <Chip size="small" label="Completo" style={{ backgroundColor: '#48bb78', color: 'white' }} />
                    ) : (
                      <Chip size="small" label="Parcial" style={{ backgroundColor: '#4299e1', color: 'white' }} />
                    )
                  )}
                </TableCell>
                <TableCell align="center">
                  <Box style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    <Tooltip title="Editar pago">
                      <IconButton
                        className={classes.actionButton}
                        size="small"
                        onClick={() => onEditPayment && onEditPayment(payment)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar pago">
                      <IconButton
                        className={`${classes.actionButton} ${classes.deleteButton}`}
                        size="small"
                        onClick={() => onDeletePayment && onDeletePayment(payment)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredPayments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {allPayments.length === 0 ? 'No hay pagos registrados' : 'No se encontraron pagos con los filtros aplicados'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Summary for filtered results */}
      {filteredPayments.length > 0 && (
        <Card style={{ marginTop: 16 }}>
          <CardContent>
            <Typography variant="h6" style={{ marginBottom: 8 }}>
              Resumen de Resultados
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Total de Pagos
                </Typography>
                <Typography variant="h6">
                  {filteredPayments.length}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Monto Total
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(
                    filteredPayments.reduce((sum, p) => sum + safeNumber(p.amountPaid), 0)
                  )}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Pagos Completos
                </Typography>
                <Typography variant="h6">
                  {filteredPayments.filter(p => p.amountPaid >= p.amountOwed).length}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Pagos Parciales
                </Typography>
                <Typography variant="h6">
                  {filteredPayments.filter(p => p.amountPaid < p.amountOwed).length}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </>
  );
}