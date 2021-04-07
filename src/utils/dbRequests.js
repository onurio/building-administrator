export const getCategories = async (db) => {
  try {
    const doc = await db.collection('generalData').doc('artCategories').get();

    if (doc.exists) {
      const categories = doc
        .data()
        .data.map((cat) => ({ value: cat, label: cat }));
      return categories;
    } else {
      console.log('No such document!');
      return [];
    }
  } catch (error) {
    throw Error(error);
  }
};

export const getApartment = async (db, id) => {
  try {
    const doc = await db.collection('apartments').doc(id).get();
    return doc.data();
  } catch (error) {
    throw Error(error);
  }
};

export const getApartments = async (db) => {
  try {
    const snapshot = await db.collection('apartments').get();
    const array = snapshot.docs.map((apartment) => {
      const processed = apartment.data();
      processed.id = apartment.id;
      return processed;
    });
    return array;
  } catch (error) {
    throw Error(error);
  }
};

export const sendMessage = async (db, info) => {
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

export const saveApartment = async (db, apartment) => {
  const res = await db
    .collection('apartments')
    .doc(apartment.id)
    .set(apartment);
};

export const deleteApartment = async (db, apartmentId) => {
  const res = await db.collection('apartments').doc(apartmentId).delete();
};

export const deleteUser = async (db, userId) => {
  const res = await db.collection('users').doc(userId).delete();
};

export const getHours = async (db) => {
  const doc = await db.collection('generalData').doc('openingHours').get();
  return doc.data().data;
};

export const getUsers = async (db) => {
  try {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    throw Error(error);
  }
};

export const saveUser = async (db, expo) => {
  const ref = await db.collection('users').doc(expo.id);
  expo.id = ref.id;
  ref.set(expo);
};
