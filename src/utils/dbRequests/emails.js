import { setDoc, doc } from "firebase/firestore";
import { withErrorHandling, db, customAlert } from "./dbutils";

const apiUrl = process.env.REACT_APP_API_URL;

export const sendEmail = async (info) => {
  await withErrorHandling(async () => {
    const res = await fetch(`${apiUrl}/email/receipt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    const res = await fetch(`${apiUrl}/email/reminder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emails }),
    });
    if (!res.ok)
      throw new Error("Error sending email to: " + info.userInfo.email);
  });
  customAlert(true, "Emails sent successfully");
};
