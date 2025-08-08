// Utility functions for payment components

// Utility function to safely format currency values
export const formatCurrency = (value) => {
  const num = parseFloat(value) || 0;
  return `S/. ${num.toFixed(2)}`;
};

// Utility function to safely get number value
export const safeNumber = (value) => {
  return parseFloat(value) || 0;
};

// Get apartment name from user object
export const getApartmentName = (user) => {
  if (!user.apartment) return 'Sin apartamento';
  return typeof user.apartment === 'object' ? 
    user.apartment?.name || 'Sin apartamento' : 
    user.apartment || 'Sin apartamento';
};

// Calculate payment statistics
export const calculatePaymentStats = (users) => {
  if (!users || !Array.isArray(users)) {
    return { totalCollected: 0, pendingPayments: 0, totalDebt: 0 };
  }
  
  let totalDebt = 0;
  let pendingCount = 0;
  let totalCollected = 0;

  users.forEach(user => {
    if (!user) return;
    // Debt is only when user has explicitly accumulated debt from partial payments
    // or late fees, not just unpaid receipts
    if (user.debt && user.debt > 0) {
      totalDebt += safeNumber(user.debt);
    }
    
    if (user.reciepts) {
      user.reciepts.forEach(receipt => {
        if (!receipt.paid) {
          pendingCount++;
        }
        // Count actual payments made (this would need payment history)
        // For now, we count paid receipts
        if (receipt.paid && receipt.total) {
          totalCollected += safeNumber(receipt.total);
        }
      });
    }
  });

  return {
    totalCollected,
    pendingPayments: pendingCount,
    totalDebt,
  };
};

// Export filtered payments to CSV
export const exportPaymentsToCSV = (filteredPayments, showAlert, format, es) => {
  if (filteredPayments.length === 0) {
    showAlert('warning', 'No hay datos para exportar');
    return;
  }
  
  const headers = ['Fecha', 'Inquilino', 'Mes/Año', 'Monto Pagado', 'Monto Adeudado', 'Estado', 'Notas'];
  const csvData = filteredPayments.map(payment => [
    payment.paymentDate ? format(new Date(payment.paymentDate), 'dd/MM/yyyy', { locale: es }) : '',
    payment.userName || '',
    payment.monthYear || '',
    payment.amountPaid || 0,
    payment.amountOwed || 0,
    payment.amountPaid >= payment.amountOwed ? 'Completo' : 'Parcial',
    payment.notes || ''
  ]);
  
  const csvContent = [headers, ...csvData]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `pagos-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showAlert('success', 'Archivo CSV exportado exitosamente');
};