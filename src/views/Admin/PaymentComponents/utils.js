// Utility functions for payment components

import { generateRecieptInfo, calculateLaundryUsage, getMonthYear } from '../../../utils/util';
import { getCachedUserDebt } from '../../../utils/dbRequests/payments';

// Spanish month names
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Format month_year string (MM_YYYY) to readable format (e.g., "Julio 2025")
export const formatMonthYear = (monthYear) => {
  if (!monthYear) return '';
  
  // Handle format "MM_YYYY"
  const parts = monthYear.split('_');
  if (parts.length !== 2) return monthYear; // Return as-is if not in expected format
  
  const month = parseInt(parts[0], 10);
  const year = parts[1];
  
  if (isNaN(month) || month < 1 || month > 12) return monthYear;
  
  return `${MONTH_NAMES[month - 1]} ${year}`;
};

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

// Calculate payment statistics (now async due to dynamic debt calculation)
export const calculatePaymentStats = async (users) => {
  if (!users || !Array.isArray(users)) {
    return { totalCollected: 0, pendingPayments: 0, totalDebt: 0 };
  }
  
  let totalDebt = 0;
  let pendingCount = 0;
  let totalCollected = 0;

  // Helper function to check if a receipt month is July 2025 or later
  const isReceiptEligible = (receiptName) => {
    if (!receiptName) return false;
    const parts = receiptName.split('_');
    if (parts.length !== 2) return false;
    const month = parseInt(parts[0], 10);
    const year = parseInt(parts[1], 10);
    if (isNaN(month) || isNaN(year)) return false;
    // Check if it's July 2025 or later
    if (year > 2025) return true;
    if (year === 2025 && month >= 7) return true;
    return false;
  };

  // Calculate debts for all users in parallel
  await Promise.all(users.map(async (user) => {
    if (!user) return;
    
    // Get dynamic debt for this user
    try {
      const userDebt = await getCachedUserDebt(user.id);
      if (userDebt > 0) {
        totalDebt += userDebt;
      }
    } catch (error) {
      console.error(`Error calculating debt for user ${user.id}:`, error);
    }
    
    if (user.reciepts) {
      user.reciepts.forEach(receipt => {
        // Only count receipts from July 2025 onwards for consistency
        if (isReceiptEligible(receipt.name)) {
          if (!receipt.paid) {
            pendingCount++;
          }
          // Count actual payments made (this would need payment history)
          // For now, we count paid receipts
          if (receipt.paid && receipt.total) {
            totalCollected += safeNumber(receipt.total);
          }
        }
      });
    }
  }));

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

// Calculate detailed payment breakdown for a receipt
export const calculatePaymentBreakdown = async (user, receipt, services, apartments, getLaundryUserFn) => {
  if (!receipt || !services || !user) {
    return null;
  }

  try {
    // Find the user's apartment
    const apartment = apartments?.find(apt => apt.tenant?.id === user.id);
    if (!apartment) {
      return createBasicBreakdown(receipt);
    }

    // Get laundry usage for the receipt month
    const laundryUsage = getLaundryUserFn ? 
      await getLaundryUserFn(user.id).then(laundryUser => 
        calculateLaundryUsage(laundryUser, receipt.name)
      ).catch(() => null) : null;

    // Calculate known fixed costs first
    const rent = safeNumber(apartment.rent || 0);
    // Get dynamic debt
    const debt = await getCachedUserDebt(user.id) || 0;
    
    // Basic services (these should be consistent)
    const maintenance = apartment.is_garage ? 0 : 
      apartment.custom_maintenance ? safeNumber(apartment.custom_maintenance) : 
      Math.round(safeNumber(services.maintenance || 0));
    const administration = apartment.is_garage ? 0 : Math.round(safeNumber(services.administration || 0));
    const municipality = Math.round(safeNumber(apartment.municipality || 0));
    
    // User-specific services
    const internet = user.services?.includes("internet") ? 50 : 0;
    const cable = user.services?.includes("cable") ? 50 : 0;
    const laundryTotal = laundryUsage?.total || 0;
    
    // Calculate what we know
    const knownCosts = rent + debt + maintenance + administration + municipality + internet + cable + laundryTotal;
    const receiptTotal = safeNumber(receipt.total || 0);
    
    // The remaining amount should be water + electricity
    const remainingUtilities = receiptTotal - knownCosts;
    
    // Try to split remaining utilities between water and electricity based on percentages
    let water = 0;
    let electricity = 0;
    
    if (remainingUtilities > 0 && apartment.water_percentage && apartment.electricity_percentage) {
      const totalUtilityPercentage = (apartment.water_percentage || 0) + (apartment.electricity_percentage || 0);
      if (totalUtilityPercentage > 0) {
        // Estimate based on relative percentages
        const waterRatio = apartment.water_percentage / totalUtilityPercentage;
        const electricityRatio = apartment.electricity_percentage / totalUtilityPercentage;
        water = Math.round(remainingUtilities * waterRatio);
        electricity = Math.round(remainingUtilities * electricityRatio);
      }
    }

    // Build breakdown
    const breakdown = {
      // Basic services
      rent,
      maintenance,
      administration,
      municipality,
      
      // Utilities
      water,
      electricity,
      internet,
      cable,
      laundryTotal,
      
      // Debt
      debt,
      
      // Calculated totals
      basicServices: maintenance + administration + municipality,
      utilities: water + electricity + internet + cable + laundryTotal,
      subtotal: 0,
      total: receiptTotal
    };

    breakdown.subtotal = breakdown.basicServices + breakdown.utilities;

    return breakdown;
  } catch (error) {
    console.error('Error calculating payment breakdown:', error);
    return createBasicBreakdown(receipt);
  }
};

// Create a basic breakdown when detailed calculation fails
const createBasicBreakdown = (receipt) => {
  const total = safeNumber(receipt.total || 0);
  return {
    rent: 0,
    maintenance: 0,
    administration: 0,
    municipality: 0,
    water: 0,
    electricity: 0,
    internet: 0,
    cable: 0,
    laundryTotal: 0,
    debt: 0,
    basicServices: 0,
    utilities: 0,
    subtotal: total,
    total: total
  };
};

// Format breakdown for display
export const formatBreakdownDisplay = (breakdown) => {
  if (!breakdown) return null;
  
  return {
    basicServices: {
      label: 'Servicios Básicos',
      value: formatCurrency(breakdown.basicServices),
      details: [
        { label: 'Mantenimiento', value: formatCurrency(breakdown.maintenance) },
        { label: 'Administración', value: formatCurrency(breakdown.administration) },
        { label: 'Arbitrios', value: formatCurrency(breakdown.municipality) }
      ].filter(item => safeNumber(item.value.replace('S/. ', '')) > 0)
    },
    utilities: {
      label: 'Utilidades',
      value: formatCurrency(breakdown.utilities),
      details: [
        { label: 'Agua', value: formatCurrency(breakdown.water) },
        { label: 'Electricidad', value: formatCurrency(breakdown.electricity) },
        { label: 'Internet', value: formatCurrency(breakdown.internet) },
        { label: 'Cable', value: formatCurrency(breakdown.cable) },
        { label: 'Lavandería', value: formatCurrency(breakdown.laundryTotal) }
      ].filter(item => safeNumber(item.value.replace('S/. ', '')) > 0)
    },
    debt: {
      label: 'Deuda Anterior',
      value: formatCurrency(breakdown.debt)
    },
    rent: {
      label: 'Alquiler',
      value: formatCurrency(breakdown.rent)
    },
    total: {
      label: 'Total',
      value: formatCurrency(breakdown.total)
    }
  };
};