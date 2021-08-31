import firebase from 'firebase';
import { getMonthYear, isDateBiggerOrEqual } from './util';

let db, storage;
let customAlert = () => {};
const todayMonthYear = getMonthYear(new Date());

export const initDB = () => {
  db = firebase.firestore();
};

export const setStorage = (stg) => {
  storage = stg;
};

export const setAlert = (cAlert) => {
  customAlert = cAlert;
};

const withErrorHandling = async (func) => {
  try {
    return await func();
  } catch (error) {
    customAlert(false, error.toString());
    console.error(error);
    return false;
  }
};

export const deleteAllRecieptsFromMonth = async (month) => {
  return withErrorHandling(async () => {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    const users = snapshot.docs.map((doc) => doc.data());

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
      return await usersRef
        .doc(usr.id)
        .update({ ...usr, reciepts: filteredReciepts });
    });
    await Promise.all(updatePromises);
    customAlert(true, 'deleted succesfully');
  });
};

export const getAllRecieptsMonths = () => {
  return withErrorHandling(async () => {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map((doc) => doc.data());

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
    customAlert(true, 'Reciept deleted');
  });
};

const logLaundryAction = (actionDetails) => {
  withErrorHandling(async () => {
    await db
      .collection('laundry')
      .doc('log')
      .update({
        [todayMonthYear]:
          firebase.firestore.FieldValue.arrayUnion(actionDetails),
      });
  });
};

export const getServices = async () => {
  return await withErrorHandling(async () => {
    const doc = await db.collection('general').doc('services').get();
    return doc.data();
  });
};

export const getLaundry = async (users) => {
  return await withErrorHandling(async () => {
    const collection = await db.collection('laundry').get();
    let laundry = {};
    collection.forEach((doc) => {
      laundry[doc.id] = doc.data();
    });

    Object.keys(laundry.log).forEach((mY) => {
      laundry.log[mY] = laundry.log[mY].map((log, index) => ({
        ...log,
        id: index + log.userId,
        name: users.find((usr) => usr.id === log.userId)?.name,
      }));
    });
    return laundry;
  });
};

export const updateServices = async (servicesUpdated) => {
  return await withErrorHandling(async () => {
    await db
      .collection('general')
      .doc('services')
      .update({ ...servicesUpdated });
    customAlert(true, 'Updated prices');
  });
};

export const getApartment = async (id) => {
  await withErrorHandling(async () => {
    const doc = await db.collection('apartments').doc(id).get();
    return doc.data();
  });
};

export const getApartments = async () => {
  return await withErrorHandling(async () => {
    const snapshot = await db.collection('apartments').get();
    const array = snapshot.docs.map((apartment) => {
      const processed = apartment.data();
      processed.id = apartment.id;
      return processed;
    });
    return array;
  });
};

export const sendMessage = async (info) => {
  if (!info.subject) delete info.subject;
  try {
    await db
      .collection('contact_info')
      .doc()
      .set({
        ...info,
        date_time: new Date().toISOString(),
      });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const saveApartment = async (apartment) => {
  await withErrorHandling(async () => {
    await db.collection('apartments').doc(apartment.id).set(apartment);
    customAlert(true, 'Apartment updated');
  });
};

export const deleteApartment = async (apartmentId) => {
  await withErrorHandling(async () => {
    await db.collection('apartments').doc(apartmentId).delete();
    customAlert(true, 'Apartment deleted');
  });
};

export const getUserFromEmail = async (email) => {
  return await withErrorHandling(async () => {
    const res = await db.collection('users').where('email', '==', email).get();
    return res.docs[0].data();
  });
};

export const getApartmentFromUserId = async (userId) => {
  return await withErrorHandling(async () => {
    const res = await db
      .collection('apartments')
      .where('tenant.id', '==', userId)
      .get();
    return res.docs[0].data();
  });
};

export const deleteUser = async (userId) => {
  await withErrorHandling(async () => {
    await db.collection('users').doc(userId).delete();
    customAlert(true, 'User deleted');
  });
};

export const getReservedDates = async (monthYear) => {
  return await withErrorHandling(async () => {
    const doc = await db.collection('laundry').doc('calendar').get();
    const calendar = doc.data();
    let reserves = [];
    if (monthYear) {
      return calendar[monthYear] || [];
    } else {
      Object.keys(calendar).forEach((mY) => {
        reserves = reserves.concat(calendar[mY]);
      });
      reserves = reserves.filter((r) => {
        return isDateBiggerOrEqual(new Date(r.date));
      });
      return reserves || [];
    }
  });
};

export const reserveLaundryDay = async (userId, userName, date) => {
  return await withErrorHandling(async () => {
    const monthYear = getMonthYear(new Date(date));
    const laundryRef = await db.collection('laundry');
    const formattedDate = date.toISOString();
    laundryRef.doc('calendar').update({
      [monthYear]: firebase.firestore.FieldValue.arrayUnion({
        userId,
        userName,
        date: formattedDate,
      }),
    });

    laundryRef.doc('users').update({
      [`${userId}.reservations.${monthYear}`]:
        firebase.firestore.FieldValue.arrayUnion(formattedDate),
    });

    logLaundryAction({
      date: new Date().toISOString(),
      userId,
      message: `User reserved for ${formattedDate}`,
    });
    customAlert(true, 'Reservado');
    return true;
  });
};

export const saveLaundryUse = async (washDry, userId, monthYear) => {
  return await withErrorHandling(async () => {
    let todayISO = new Date().toUTCString();
    await db
      .collection('laundry')
      .doc('users')
      .update({
        [`${userId}.use.${monthYear}`]:
          firebase.firestore.FieldValue.arrayUnion({
            ...washDry,
            date: todayISO,
          }),
      });
    logLaundryAction({
      date: todayISO,
      userId,
      message: `User registered ${washDry.wash} washes, ${washDry.dry} dries`,
    });
    customAlert(true, 'Guardado');
  });
};

export const getLaundryUser = async (userId) => {
  return await withErrorHandling(async () => {
    const doc = await db.collection('laundry').doc('users').get();
    return doc.exists ? doc.data()[userId] : {};
  });
};

export const deleteReservation = async (
  userId,
  currentUserReservations,
  reservationToDelete
) => {
  return await withErrorHandling(async () => {
    const toDeleteMonthYear = getMonthYear(new Date(reservationToDelete));
    const reservationsOfMonth = await getReservedDates(toDeleteMonthYear);
    const newTotalReservationsOfMonth = reservationsOfMonth.filter(
      (reservation) => {
        return (
          new Date(reservationToDelete).setHours(0, 0, 0) !==
            new Date(reservation.date).setHours(0, 0, 0) &&
          isDateBiggerOrEqual(new Date(reservation.date))
        );
      }
    );

    const newUserReservations = currentUserReservations.filter(
      (date) => reservationToDelete !== date
    );

    let userPath = `${userId}.reservations.${toDeleteMonthYear}`;

    await db
      .collection('laundry')
      .doc('users')
      .update({
        [userPath]: newUserReservations,
      });
    await db
      .collection('laundry')
      .doc('calendar')
      .update({
        [toDeleteMonthYear]: newTotalReservationsOfMonth,
      });
    logLaundryAction({
      date: new Date().toISOString(),
      userId,
      message: `User deleted  reservation for ${reservationToDelete}`,
    });
    customAlert(true, 'Borrado');
  });
};

export const getUsers = async () => {
  return await withErrorHandling(async () => {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map((doc) => doc.data());
  });
};

export const getMonthlyReports = async () => {
  return await withErrorHandling(async () => {
    const snapshot = await db.collection('monthlyReports').get();
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  });
};

export const saveUser = async (user) => {
  await withErrorHandling(async () => {
    const ref = await db.collection('users').doc(user.id);
    user.id = ref.id;
    ref.set(user);
    customAlert(true, 'User saved');
  });
};

export const updateUser = async (user) => {
  await withErrorHandling(async () => {
    await db.collection('users').doc(user.id).update(user);
    customAlert(true, 'User updated');
  });
};

export const createMonthlyReport = async (report, monthYear) => {
  await withErrorHandling(async () => {
    await db.collection('monthlyReports').doc(monthYear).set(report);
  });
};

export const sendEmail = async (info) => {
  await withErrorHandling(async () => {
    await db
      .collection('reciept_email')
      .doc()
      .set({
        ...info,
        date_time: new Date().toISOString(),
      });
  });
};
