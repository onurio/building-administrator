import firebase from 'firebase';
import { getMonthYear } from './util';

let db;
let customAlert = () => {};
const todayMonthYear = getMonthYear(new Date());

export const initDB = () => {
  db = firebase.firestore();
};

export const setAlert = (cAlert) => {
  customAlert = cAlert;
};

const withErrorHandling = async (func) => {
  try {
    return await func();
  } catch (error) {
    customAlert(false, error.toString());
    return false;
  }
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
    customAlert(true, 'Apartment created');
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

export const deleteUser = async (userId) => {
  await withErrorHandling(async () => {
    await db.collection('users').doc(userId).delete();
    customAlert(true, 'User deleted');
  });
};

export const getReservedDates = async (monthYear) => {
  return await withErrorHandling(async () => {
    const doc = await db.collection('laundry').doc('calendar').get();
    return doc.data()[monthYear] || [];
  });
};

export const reserveLaundryDay = async (userId, userName, date) => {
  return await withErrorHandling(async () => {
    const monthYear = getMonthYear(new Date(date));
    const laundryRef = await db.collection('laundry');
    laundryRef.doc('calendar').update({
      [monthYear]: firebase.firestore.FieldValue.arrayUnion({
        userId,
        userName,
        date: date.toLocaleDateString(),
      }),
    });

    laundryRef.doc('users').update({
      [`${userId}.reservations.${monthYear}`]:
        firebase.firestore.FieldValue.arrayUnion(date.toLocaleDateString()),
    });

    logLaundryAction({
      date: new Date().toISOString(),
      userId,
      message: `User reserved for ${date.toLocaleDateString()}`,
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
  monthYear,
  currentTotalReservations,
  currentUserReservations,
  closestReservation
) => {
  return await withErrorHandling(async () => {
    const newTotalReservations = currentTotalReservations.filter(
      (reservation) => closestReservation !== reservation.date
    );

    const newUserReservations = currentUserReservations.filter(
      (date) => closestReservation !== date
    );

    let userPath = `${userId}.reservations.${monthYear}`;

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
        [monthYear]: newTotalReservations,
      });
    logLaundryAction({
      date: new Date().toISOString(),
      userId,
      message: `User deleted  reservation for ${closestReservation}`,
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

export const saveUser = async (user) => {
  await withErrorHandling(async () => {
    const ref = await db.collection('users').doc(user.id);
    user.id = ref.id;
    ref.set(user);
    customAlert(true, 'User saved');
  });
};
