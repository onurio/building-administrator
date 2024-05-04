import {  getFirestore} from "firebase/firestore";
import { getMonthYear } from "../util";

export let db, storage;
export let customAlert = () => {};
export const todayMonthYear = getMonthYear(new Date());

export const initDB = () => {
  db = getFirestore();
};

export const setStorage = (stg) => {
  storage = stg;
};

export const setAlert = (cAlert) => {
  customAlert = cAlert;
};

export const withErrorHandling = async (func) => {
  try {
    return await func();
  } catch (error) {
    customAlert(false, error.toString());
    console.error(error);
    return false;
  }
};
