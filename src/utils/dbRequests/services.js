import { doc, getDoc, updateDoc } from "firebase/firestore";
import { withErrorHandling, db, customAlert } from "./dbutils";

export const getServices = async () => {
  return await withErrorHandling(async () => {
    const docRef = doc(db, "general", "services");
    const docSnap = await getDoc(docRef);
    return docSnap.data();
  });
};

export const updateServices = async (servicesUpdated) => {
  return await withErrorHandling(async () => {
    await updateDoc(doc(db, "general", "services"), { ...servicesUpdated });
    customAlert(true, "Updated prices");
  });
};
