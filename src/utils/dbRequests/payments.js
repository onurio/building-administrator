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
import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { withErrorHandling, db, customAlert } from "./dbutils";
import { updateUser } from "./users";
import { isReceiptEligible, START_YEAR, START_MONTH_NUM } from "../receiptUtils";
import { sendPaymentPendingEmail, sendPaymentApprovedEmail, sendPaymentDeclinedEmail } from "./emails";
import { formatMonthYear } from "../../views/Admin/PaymentComponents/utils";

// In-memory cache for debt calculations
const debtCache = new Map();

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
        // Count payment if:
        // 1. It has no status (admin-created, automatically approved)
        // 2. It has status === 'APPROVED' (user-created and approved)
        // Don't count if status === 'PENDING' or 'DECLINED'
        const isApproved = !payment.status || payment.status === 'APPROVED';
        
        if (isReceiptEligible(payment.monthYear) && payment.amountPaid && isApproved) {
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
    
    // Add server timestamp and ensure admin payments are marked as APPROVED
    const payment = {
      ...paymentData,
      status: 'APPROVED', // Admin payments are automatically approved
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

// Upload payment voucher with file
export const uploadPaymentVoucher = async (paymentData, file, storage) => {
  return await withErrorHandling(async () => {
    // Create unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `${timestamp}-${paymentData.receiptId}.${fileExtension}`;
    const filePath = `payment-vouchers/${paymentData.userId}/${paymentData.receiptId}/${filename}`;
    
    // Upload file to Firebase Storage
    const fileRef = storageRef(storage, filePath);
    const uploadResult = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    // Create payment record with PENDING status
    const paymentsRef = collection(db, "payments");
    const payment = {
      ...paymentData,
      status: 'PENDING',
      voucherUrl: downloadURL,
      voucherFilename: file.name,
      voucherStoragePath: filePath,
      createdAt: serverTimestamp(),
      uploadDate: serverTimestamp(),
    };
    
    const docRef = await addDoc(paymentsRef, payment);
    
    // Send email notification to admin
    try {
      await sendPaymentPendingEmail({
        ...paymentData,
        monthYear: formatMonthYear(paymentData.monthYear),
      });
    } catch (error) {
      console.warn('Failed to send admin notification email:', error);
      // Don't fail the payment upload if email fails
    }
    
    // Don't invalidate debt cache yet - only when approved
    
    customAlert(true, "Comprobante subido exitosamente");
    return docRef.id;
  });
};

// Get all pending payments for admin approval
export const getPendingPayments = async () => {
  return await withErrorHandling(async () => {
    const paymentsRef = collection(db, "payments");
    const q = query(
      paymentsRef,
      where("status", "==", "PENDING"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const payments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return payments;
  }, []);
};

// Get count of pending payments for admin notifications
export const getPendingPaymentCount = async () => {
  return await withErrorHandling(async () => {
    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("status", "==", "PENDING"));
    const snapshot = await getDocs(q);
    return snapshot.size;
  }, 0);
};

// Approve a payment
export const approvePayment = async (paymentId, adminId, notes = '') => {
  return await withErrorHandling(async () => {
    const paymentRef = doc(db, "payments", paymentId);
    const paymentDoc = await getDoc(paymentRef);
    
    if (!paymentDoc.exists()) {
      throw new Error("Pago no encontrado");
    }
    
    const paymentData = paymentDoc.data();
    
    // Get user data for email
    const userRef = doc(db, "users", paymentData.userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.exists() ? userDoc.data() : null;
    
    // Update payment status to APPROVED
    await updateDoc(paymentRef, {
      status: 'APPROVED',
      reviewedBy: adminId,
      reviewDate: serverTimestamp(),
      reviewNotes: notes,
      updatedAt: serverTimestamp(),
    });
    
    // Update user's receipt paid status if fully paid
    if (paymentData.amountPaid >= paymentData.amountOwed) {
      await markReceiptAsPaid(paymentData.userId, paymentData.receiptId);
    }
    
    // Send email notification to user
    try {
      if (userData?.email) {
        await sendPaymentApprovedEmail(
          {
            ...paymentData,
            userName: userData.name,
            monthYear: formatMonthYear(paymentData.monthYear),
            reviewNotes: notes,
          },
          userData.email
        );
      }
    } catch (error) {
      console.warn('Failed to send user approval notification email:', error);
      // Don't fail the approval if email fails
    }
    
    // Invalidate debt cache for this user (now that payment is approved)
    invalidateDebtCache(paymentData.userId);
    
    customAlert(true, "Pago aprobado exitosamente");
    return paymentId;
  });
};

// Decline a payment
export const declinePayment = async (paymentId, adminId, notes = '') => {
  return await withErrorHandling(async () => {
    const paymentRef = doc(db, "payments", paymentId);
    const paymentDoc = await getDoc(paymentRef);
    
    if (!paymentDoc.exists()) {
      throw new Error("Pago no encontrado");
    }
    
    const paymentData = paymentDoc.data();
    
    // Get user data for email
    const userRef = doc(db, "users", paymentData.userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.exists() ? userDoc.data() : null;
    
    // Update payment status to DECLINED
    await updateDoc(paymentRef, {
      status: 'DECLINED',
      reviewedBy: adminId,
      reviewDate: serverTimestamp(),
      reviewNotes: notes,
      updatedAt: serverTimestamp(),
    });
    
    // Mark receipt as unpaid (since payment was declined)
    await markReceiptAsUnpaid(paymentData.userId, paymentData.receiptId);
    
    // Send email notification to user
    try {
      if (userData?.email) {
        await sendPaymentDeclinedEmail(
          {
            ...paymentData,
            userName: userData.name,
            monthYear: formatMonthYear(paymentData.monthYear),
            reviewNotes: notes,
          },
          userData.email
        );
      }
    } catch (error) {
      console.warn('Failed to send user decline notification email:', error);
      // Don't fail the decline if email fails
    }
    
    // No need to invalidate cache since declined payments don't count
    
    customAlert(true, "Pago rechazado");
    return paymentId;
  });
};

// Get payments by user with status filtering
export const getPaymentsByUserWithStatus = async (userId, status = null) => {
  return await withErrorHandling(async () => {
    const paymentsRef = collection(db, "payments");
    let q;
    
    if (status) {
      q = query(
        paymentsRef, 
        where("userId", "==", userId),
        where("status", "==", status)
      );
    } else {
      q = query(paymentsRef, where("userId", "==", userId));
    }
    
    const snapshot = await getDocs(q);
    const payments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Sort by createdAt in JavaScript
    return payments.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime - aTime;
    });
  }, []);
};