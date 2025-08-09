import {
  doc,
  getDocs,
  setDoc,
  collection,
  where,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  addDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { withErrorHandling, db, customAlert } from "./dbutils";
import { updateUser } from "./users";

// In-memory cache for debt calculations
const debtCache = new Map();
const START_MONTH = "07_2025"; // Only calculate debt from July 2025 onwards
const START_YEAR = 2025;
const START_MONTH_NUM = 7;

// Helper function to check if a receipt month is July 2025 or later
const isReceiptEligible = (receiptName) => {
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

// Clear cache for a specific user
export const invalidateDebtCache = (userId) => {
  if (userId) {
    debtCache.delete(userId);
  }
};

// Clear entire debt cache
export const invalidateAllDebtCache = () => {
  debtCache.clear();
};

// Calculate debt for a user (only from July 2025 onwards)
export const calculateUserDebt = async (userId) => {
  return await withErrorHandling(async () => {
    // Get user data
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("Usuario no encontrado");
    }
    
    const userData = userDoc.data();
    
    // Get eligible receipts (>= July 2025)
    let totalOwed = 0;
    if (userData.reciepts && Array.isArray(userData.reciepts)) {
      userData.reciepts.forEach(receipt => {
        // Only include receipts from July 2025 onwards
        if (isReceiptEligible(receipt.name) && receipt.total) {
          totalOwed += receipt.total;
        }
      });
    }
    
    // Get all payments for this user for eligible receipts
    let totalPaid = 0;
    try {
      const paymentsRef = collection(db, "payments");
      const q = query(paymentsRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);
      
      snapshot.docs.forEach((doc) => {
        const payment = doc.data();
        // Only include payments for receipts from July 2025 onwards
        if (isReceiptEligible(payment.monthYear) && payment.amountPaid) {
          totalPaid += payment.amountPaid;
        }
      });
    } catch (error) {
      console.warn('Error fetching payments for debt calculation:', error);
    }
    
    // Calculate debt (positive means user owes money, negative means credit)
    return totalOwed - totalPaid;
  }, 0); // Return 0 as default if error
};

// Get cached debt or calculate if not cached
export const getCachedUserDebt = async (userId) => {
  if (!userId) return 0;
  
  // Check if we have a cached value
  if (debtCache.has(userId)) {
    return debtCache.get(userId);
  }
  
  // Calculate and cache the debt
  const debt = await calculateUserDebt(userId);
  debtCache.set(userId, debt);
  return debt;
};

// Get all users with their calculated debt
export const getAllUsersWithDebt = async (users) => {
  return await withErrorHandling(async () => {
    const usersWithDebt = await Promise.all(
      users.map(async (user) => {
        const debt = await getCachedUserDebt(user.id);
        return { ...user, calculatedDebt: debt };
      })
    );
    return usersWithDebt;
  }, []);
};

// Register a new payment
export const registerPayment = async (paymentData) => {
  return await withErrorHandling(async () => {
    const paymentsRef = collection(db, "payments");
    
    // Add server timestamp
    const payment = {
      ...paymentData,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(paymentsRef, payment);
    
    // Update user's receipt paid status if fully paid
    if (paymentData.amountPaid >= paymentData.amountOwed) {
      await markReceiptAsPaid(paymentData.userId, paymentData.receiptId);
    }
    
    // Invalidate debt cache for this user
    invalidateDebtCache(paymentData.userId);
    
    customAlert(true, "Pago registrado exitosamente");
    return docRef.id;
  });
};

// Get all payments for a specific user
export const getPaymentsByUser = async (userId) => {
  return await withErrorHandling(async () => {
    const paymentsRef = collection(db, "payments");
    const q = query(
      paymentsRef, 
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const payments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Sort by createdAt in JavaScript instead of Firestore
    return payments.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime - aTime;
    });
  });
};

// Get all payments for a specific month
export const getPaymentsByMonth = async (monthYear) => {
  return await withErrorHandling(async () => {
    const paymentsRef = collection(db, "payments");
    const q = query(
      paymentsRef,
      where("monthYear", "==", monthYear)
    );
    const snapshot = await getDocs(q);
    const payments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Sort by createdAt in JavaScript instead of Firestore
    return payments.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime - aTime;
    });
  });
};

// Get all payments
export const getAllPayments = async () => {
  return await withErrorHandling(async () => {
    const paymentsRef = collection(db, "payments");
    const snapshot = await getDocs(paymentsRef);
    const payments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Sort by createdAt in JavaScript instead of Firestore
    return payments.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime - aTime;
    });
  });
};

// Mark a receipt as paid
export const markReceiptAsPaid = async (userId, receiptId) => {
  return await withErrorHandling(async () => {
    // Get the user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("Usuario no encontrado");
    }
    
    const userData = userDoc.data();
    const updatedReceipts = userData.reciepts.map(receipt => {
      if (receipt.name === receiptId || receipt.url === receiptId) {
        return { ...receipt, paid: true };
      }
      return receipt;
    });
    
    await updateDoc(userRef, {
      reciepts: updatedReceipts,
    });
  });
};


// Get payment summary for a user and specific receipt
export const getPaymentSummaryForReceipt = async (userId, receiptId) => {
  return await withErrorHandling(async () => {
    const paymentsRef = collection(db, "payments");
    const q = query(
      paymentsRef,
      where("userId", "==", userId),
      where("receiptId", "==", receiptId)
    );
    const snapshot = await getDocs(q);
    
    let totalPaid = 0;
    const payments = [];
    
    snapshot.docs.forEach((doc) => {
      const payment = { id: doc.id, ...doc.data() };
      totalPaid += payment.amountPaid;
      payments.push(payment);
    });
    
    return {
      payments,
      totalPaid,
    };
  });
};

// Update an existing payment
export const updatePayment = async (paymentId, paymentData) => {
  return await withErrorHandling(async () => {
    const paymentRef = doc(db, "payments", paymentId);
    
    // Add updated timestamp
    const updatedPayment = {
      ...paymentData,
      updatedAt: serverTimestamp(),
    };
    
    // Update the payment document
    await updateDoc(paymentRef, updatedPayment);
    
    // Update user's receipt paid status if fully paid
    if (paymentData.amountPaid >= paymentData.amountOwed) {
      await markReceiptAsPaid(paymentData.userId, paymentData.receiptId);
    } else {
      // If no longer fully paid, mark receipt as unpaid
      await markReceiptAsUnpaid(paymentData.userId, paymentData.receiptId);
    }
    
    // Invalidate debt cache for this user
    invalidateDebtCache(paymentData.userId);
    
    customAlert(true, "Pago actualizado exitosamente");
    return paymentId;
  });
};

// Delete a payment
export const deletePayment = async (paymentId) => {
  return await withErrorHandling(async () => {
    // Get the payment data first to update user debt after deletion
    const paymentRef = doc(db, "payments", paymentId);
    const paymentDoc = await getDoc(paymentRef);
    
    if (!paymentDoc.exists()) {
      throw new Error("Pago no encontrado");
    }
    
    const paymentData = paymentDoc.data();
    
    // Delete the payment document
    await deleteDoc(paymentRef);
    
    // Mark receipt as unpaid (since we deleted a payment)
    await markReceiptAsUnpaid(paymentData.userId, paymentData.receiptId);
    
    // Invalidate debt cache for this user
    invalidateDebtCache(paymentData.userId);
    
    customAlert(true, "Pago eliminado exitosamente");
    return paymentId;
  });
};

// Mark a receipt as unpaid
export const markReceiptAsUnpaid = async (userId, receiptId) => {
  return await withErrorHandling(async () => {
    // Get the user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("Usuario no encontrado");
    }
    
    const userData = userDoc.data();
    const updatedReceipts = userData.reciepts.map(receipt => {
      if (receipt.name === receiptId || receipt.url === receiptId) {
        return { ...receipt, paid: false };
      }
      return receipt;
    });
    
    await updateDoc(userRef, {
      reciepts: updatedReceipts,
    });
  });
};