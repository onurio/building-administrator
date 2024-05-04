import { doc, getDocs, setDoc,collection } from "firebase/firestore";
import { withErrorHandling,db } from "./dbutils";

export const getMonthlyReports = async () => {
    return await withErrorHandling(async () => {
      const snapRef = collection(db,"monthlyReports");
      const snapshot = await getDocs(snapRef)
      return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    });
  };
  
  
  export const createMonthlyReport = async (report, monthYear) => {
    await withErrorHandling(async () => {
      await setDoc(doc(db, "monthlyReports", monthYear), report);
    });
  };
  
  