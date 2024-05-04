import { doc, getDoc, getDocs, setDoc,collection, deleteDoc } from "firebase/firestore";
import { withErrorHandling, db,customAlert } from "./dbutils";

export const saveApartment = async (apartment) => {
    await withErrorHandling(async () => {
        if (!apartment.id) apartment.id = apartment.name.toLowerCase().replace(" ", "_") + Date.now().toString();
        const docRef = doc(db, "apartments", apartment.id);
        await setDoc(docRef, apartment);
        customAlert(true, "Apartment updated");
    });
};

export const deleteApartment = async (apartmentId) => {
    await withErrorHandling(async () => {
        await deleteDoc(doc(db, "apartments", apartmentId));
        customAlert(true, "Apartment deleted");
    });
};



export const getApartmentFromUserId = async (userId) => {
    return await withErrorHandling(async () => {
        const res = await db
            .collection("apartments")
            .where("tenant.id", "==", userId)
            .get();
        return res.docs[0].data();
    });
};


export const getApartment = async (id) => {
    await withErrorHandling(async () => {
        const doc = await getDoc(doc(db, "apartments", id));
        return doc.data();
    });
};

export const getApartments = async () => {
    return await withErrorHandling(async () => {
        const snapshot = await getDocs(collection(db, "apartments"));
        const array = snapshot.docs.map((apartment, index) => {
            const processed = apartment.data();
            return {
                ...processed,
                id: apartment.id,
                edit: index,
            };
        });
        return array;
    });
};