import { getDocs, collection } from "firebase/firestore";
import { withErrorHandling,db,customAlert,storage } from "./dbutils";
import { updateUser } from "./users";


export const deleteAllRecieptsFromMonth = async (month) => {
    return withErrorHandling(async () => {
      const users = await getUsers();
      const updatePromises = users.map(async (usr) => {
        const filteredReciepts = usr.reciepts.filter(
          (reciept) => reciept.name !== month
        );
        const deletePromises = usr.reciepts.map(async (reciept) => {
          if (month === reciept.name) {
            withErrorHandling(async () => {
              await storage.refFromURL(reciept.url).delete();
            });
          }
        });
        await Promise.all(deletePromises);
        return await updateUser({ ...usr, reciepts: filteredReciepts });
      });
      await Promise.all(updatePromises);
      customAlert(true, "deleted succesfully");
    });
  };
  
  export const getAllRecieptsMonths = () => {
    return withErrorHandling(async () => {
      const snapshot = collection(db,"users");
      const snapshotData = await getDocs(snapshot);
      const users = snapshotData.docs.map((doc) => doc.data());
  
      const recieptMonths = new Set();
  
      users.forEach((usr) =>
        usr.reciepts.forEach((reciept) => {
          recieptMonths.add(reciept.name);
        })
      );
      return Array.from(recieptMonths);
    });
  };
  
  export const deleteReciept = async (user, reciept) => {
    withErrorHandling(async () => {
      user.reciepts = user.reciepts.filter((r) => r.url !== reciept.url);
      await updateUser(user);
      await storage.refFromURL(reciept.url).delete();
      customAlert(true, "Reciept deleted");
    });
  };
  