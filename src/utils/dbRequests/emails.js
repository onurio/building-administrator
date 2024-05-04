import { setDoc,collection } from "firebase/firestore";
import { withErrorHandling,db,customAlert } from "./dbutils";

export const sendEmail = async (info) => {
    await withErrorHandling(async () => {
      await setDoc(collection(db, "reciept_email"), {
        ...info,
        date_time: new Date().toISOString(),
      });
      customAlert(true, "Emails processing");
    });
  };
  
  export const createReminderEmail = async (emails) => {
    await withErrorHandling(async () => {
      await setDoc(collection(db, "reminder_email"), {
        emails: emails,
        date_time: new Date().toISOString(),
      });
      customAlert(true, "Emails processing");
    });
  };
  