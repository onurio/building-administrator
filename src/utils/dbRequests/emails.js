import { setDoc, doc } from "firebase/firestore";
import { withErrorHandling, db, customAlert } from "./dbutils";

export const sendEmail = async (info) => {
  await withErrorHandling(async () => {
    await setDoc(doc(db, "reciept_email", new Date().toISOString()), {
      ...info,
      date_time: new Date().toISOString(),
    });
    customAlert(true, "Emails processing");
  });
};

export const createReminderEmail = async (emails) => {
  await withErrorHandling(async () => {
    await setDoc(doc(db, "reminder_email", new Date().toISOString()), {
      emails: emails,
      date_time: new Date().toISOString(),
    });
    customAlert(true, "Emails processing");
  });
};
