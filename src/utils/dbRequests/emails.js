import { setDoc, doc } from "firebase/firestore";
import { withErrorHandling, db, customAlert } from "./dbutils";
import { getIdToken } from "../authUtils";

const apiUrl = process.env.REACT_APP_API_URL;

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const idToken = await getIdToken();
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${idToken}`,
  };
};

export const sendEmail = async (info) => {
  await withErrorHandling(async () => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${apiUrl}/email/receipt`, {
      method: "POST",
      headers,
      body: JSON.stringify(info),
    });
    if (!res.ok)
      throw new Error("Error sending email to: " + info.userInfo.email);
    return info.userInfo.email;
  });
  return info.userInfo.email;
};

export const createReminderEmail = async (emails) => {
  await withErrorHandling(async () => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${apiUrl}/email/reminder`, {
      method: "POST",
      headers,
      body: JSON.stringify({ emails }),
    });
    if (!res.ok)
      throw new Error("Error sending reminder emails");
  });
  customAlert(true, "Emails sent successfully");
};

export const sendPaymentPendingEmail = async (paymentData) => {
  await withErrorHandling(async () => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${apiUrl}/email/payment-pending`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...paymentData,
        uploadDate: new Date().toLocaleDateString('es-ES'),
      }),
    });
    if (!res.ok) {
      throw new Error("Error sending payment notification to admin");
    }
  });
};

export const sendPaymentApprovedEmail = async (paymentData, userEmail) => {
  await withErrorHandling(async () => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${apiUrl}/email/payment-approved`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...paymentData,
        userEmail,
        approvalDate: new Date().toLocaleDateString('es-ES'),
      }),
    });
    if (!res.ok) {
      throw new Error("Error sending approval notification to user");
    }
  });
};

export const sendPaymentDeclinedEmail = async (paymentData, userEmail) => {
  await withErrorHandling(async () => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${apiUrl}/email/payment-declined`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...paymentData,
        userEmail,
        reviewDate: new Date().toLocaleDateString('es-ES'),
      }),
    });
    if (!res.ok) {
      throw new Error("Error sending decline notification to user");
    }
  });
};
