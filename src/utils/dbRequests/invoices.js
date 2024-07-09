import { getDocs, collection } from "firebase/firestore";
import { withErrorHandling, db, customAlert, storage } from "./dbutils";
import { getUsers, updateUser } from "./users";
import { deleteObject, ref } from "firebase/storage";

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
            await ref(storage, reciept.url).delete();
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
    const snapshot = collection(db, "users");
    const snapshotData = await getDocs(snapshot);
    const users = snapshotData.docs.map((doc) => doc.data());

    const recieptMonths = new Set();

    users.forEach((usr) =>
      usr.reciepts.forEach((reciept) => {
        recieptMonths.add(reciept.name);
      })
    );
    const sorted = Array.from(recieptMonths).sort((a, b) => {
      const aDate = new Date(a.split("_")[1] + "-" + a.split("_")[0] + "-01");
      const bDate = new Date(b.split("_")[1] + "-" + b.split("_")[0] + "-01");
      return bDate - aDate;
    });
    return sorted;
  });
};

export const deleteReciept = async (user, reciept) => {
  withErrorHandling(async () => {
    user.reciepts = user.reciepts.filter((r) => r.url !== reciept.url);
    await updateUser(user);
    await deleteObject(ref(storage, reciept.url));
    customAlert(true, "Reciept deleted");
  });
};
