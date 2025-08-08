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
    
    // Update user's debt
    await updateUserDebt(paymentData.userId);
    
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

// Calculate and update user's debt
export const updateUserDebt = async (userId) => {
  return await withErrorHandling(async () => {
    // Get user data
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("Usuario no encontrado");
    }
    
    const userData = userDoc.data();
    
    // Get all payments for this user
    let payments = [];
    try {
      const paymentsResult = await getPaymentsByUser(userId);
      payments = Array.isArray(paymentsResult) ? paymentsResult : [];
    } catch (error) {
      console.warn('Error fetching payments for user:', error);
      payments = [];
    }
    
    // Calculate total owed from all receipts
    let totalOwed = 0;
    if (userData.reciepts && Array.isArray(userData.reciepts)) {
      userData.reciepts.forEach(receipt => {
        if (receipt.total) {
          totalOwed += receipt.total;
        }
      });
    }
    
    // Calculate total paid
    let totalPaid = 0;
    if (Array.isArray(payments)) {
      payments.forEach(payment => {
        if (payment.amountPaid) {
          totalPaid += payment.amountPaid;
        }
      });
    }
    
    // Calculate debt (positive means user owes money, negative means credit)
    const debt = totalOwed - totalPaid;
    
    // Update user document with new debt
    await updateDoc(userRef, {
      debt: debt,
      lastDebtUpdate: serverTimestamp(),
    });
    
    return debt;
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
    
    // Update user's debt
    await updateUserDebt(paymentData.userId);
    
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
    
    // Update user's debt
    await updateUserDebt(paymentData.userId);
    
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