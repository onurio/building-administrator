import {
  doc,
  getDocs,
  setDoc,
  collection,
  where,
  updateDoc,
  query,
  deleteDoc,
} from "firebase/firestore";
import { withErrorHandling, db, customAlert } from "./dbutils";

export const getUserFromEmail = async (email) => {
  return await withErrorHandling(async () => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const res = await getDocs(q);
    return res.docs?.[0]?.data();
  });
};

export const deleteUser = async (userId) => {
  await withErrorHandling(async () => {
    await deleteDoc(doc(db, "users", userId));
    customAlert(true, "User deleted");
  });
};

export const getUsers = async () => {
  return await withErrorHandling(async () => {
    const snapRef = collection(db, "users");
    const snapshot = await getDocs(snapRef);
    return snapshot.docs.map((doc, index) => {
      return {
        ...doc.data(),
        id: doc.id,
        edit: index,
      };
    });
  });
};

export const saveUser = async (user) => {
  await withErrorHandling(async () => {
    const id =
      user.name.toLowerCase().replace(/ /g, "_") + Date.now().toString();
    user.id = id;
    await setDoc(doc(db, "users", id), user);
    customAlert(true, "User saved");
  });
};

export const updateUser = async (user) => {
  await withErrorHandling(async () => {
    await updateDoc(doc(db, "users", user.id), user);
    customAlert(true, "User updated");
  });
};
