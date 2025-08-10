// Unified receipt utilities for consistent handling across the application

// Constants for the cutoff date where dynamic payment calculation begins
export const START_YEAR = 2025;
export const START_MONTH_NUM = 7; // July
export const START_MONTH = "07_2025";

/**
 * Check if a receipt is from July 2025 or later
 * @param {string} receiptName - Receipt name in format "MM_YYYY"
 * @returns {boolean} True if receipt is July 2025 or later
 */
export const isReceiptEligible = (receiptName) => {
  if (!receiptName) return false;
  
  // Receipt names are in format "MM_YYYY"
  const parts = receiptName.split('_');
  if (parts.length !== 2) return false;
  
  const month = parseInt(parts[0], 10);
  const year = parseInt(parts[1], 10);
  
  if (isNaN(month) || isNaN(year)) return false;
  
  // Check if it's July 2025 or later
  if (year > START_YEAR) return true;
  if (year === START_YEAR && month >= START_MONTH_NUM) return true;
  
  return false;
};

/**
 * Check if a receipt is before July 2025
 * @param {string} receiptName - Receipt name in format "MM_YYYY"
 * @returns {boolean} True if receipt is before July 2025
 */
export const isReceiptBeforeJuly2025 = (receiptName) => {
  return !isReceiptEligible(receiptName);
};

/**
 * Convert receipt name to sortable date
 * @param {string} receiptName - Receipt name in format "MM_YYYY"
 * @returns {Date} Date object for sorting
 */
export const getReceiptSortDate = (receiptName) => {
  if (!receiptName) return new Date(0);
  
  const parts = receiptName.split('_');
  if (parts.length !== 2) return new Date(0);
  
  const month = parseInt(parts[0], 10);
  const year = parseInt(parts[1], 10);
  
  if (isNaN(month) || isNaN(year)) return new Date(0);
  
  // Create date from year and month (day 1)
  return new Date(year, month - 1, 1);
};

/**
 * Sort receipts by date (newest first)
 * @param {Array} receipts - Array of receipt objects with 'name' property
 * @returns {Array} Sorted array of receipts
 */
export const sortReceiptsByDate = (receipts) => {
  if (!Array.isArray(receipts)) return [];
  
  return receipts.sort((a, b) => {
    const dateA = getReceiptSortDate(a.name);
    const dateB = getReceiptSortDate(b.name);
    return dateB.getTime() - dateA.getTime(); // Newest first
  });
};

/**
 * Calculate dynamic payment status for a receipt
 * @param {Object} receipt - Receipt object
 * @param {Array} userPayments - Array of user payments
 * @returns {Object} Payment status object with isPaid and status properties
 */
export const calculateReceiptPaymentStatus = (receipt, userPayments = []) => {
  // All receipts before July 2025 are considered paid
  if (isReceiptBeforeJuly2025(receipt.name)) {
    return { isPaid: true, status: 'paid' };
  }
  
  if (!userPayments.length) return { isPaid: false, status: 'unpaid' };
  
  const receiptPayments = userPayments.filter(p => 
    p.receiptId === receipt.name && p.status === 'APPROVED'
  );
  
  const totalPaid = receiptPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const hasPending = userPayments.some(p => 
    p.receiptId === receipt.name && p.status === 'PENDING'
  );
  
  if (totalPaid >= receipt.total) {
    return { isPaid: true, status: 'paid' };
  } else if (hasPending) {
    return { isPaid: false, status: 'pending' };
  } else if (totalPaid > 0) {
    return { isPaid: false, status: 'partial' };
  } else {
    return { isPaid: false, status: 'unpaid' };
  }
};

/**
 * Get receipts that are eligible for payment upload (July 2025 onwards and unpaid/partial)
 * @param {Array} receipts - Array of receipt objects
 * @param {Array} userPayments - Array of user payments
 * @returns {Array} Filtered array of receipts available for payment
 */
export const getUnpaidEligibleReceipts = (receipts = [], userPayments = []) => {
  return receipts.filter(receipt => {
    // Skip receipts before July 2025 - they are automatically considered paid
    if (isReceiptBeforeJuly2025(receipt.name)) return false;
    
    const status = calculateReceiptPaymentStatus(receipt, userPayments);
    return status.status === 'unpaid' || status.status === 'partial';
  });
};