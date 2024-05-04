import { getDoc, getDocs, collection, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { withErrorHandling, db, customAlert, todayMonthYear } from "./dbutils";
import { getMonthYear, isDateBiggerOrEqual } from "../util";

export const getReservedDates = async (monthYear) => {
    return await withErrorHandling(async () => {
        const document = await getDoc(doc(db, "laundry", "calendar"));
        const calendar = document.data();
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
        const formattedDate = date.toISOString();
        await updateDoc(doc(db, 'laundry', 'calendar'), {
            [monthYear]: arrayUnion({
                userId,
                userName,
                date: formattedDate,
            }),
        });

        await updateDoc(doc(db, 'laundry', 'users'), {
            [`${userId}.reservations.${monthYear}`]:
                arrayUnion(formattedDate),
        });

        logLaundryAction({
            date: new Date().toISOString(),
            userId,
            message: `User reserved for ${formattedDate}`,
            type: "Reservation",
        });
        customAlert(true, "Reservado");
        return true;
    });
};

export const saveLaundryUse = async (washDry, userId, monthYear) => {
    return await withErrorHandling(async () => {
        let todayISO = new Date().toUTCString();
        await updateDoc(doc(db, 'laundry', 'users'), {
            [`${userId}.use.${monthYear}`]:
                arrayUnion({
                    ...washDry,
                    date: todayISO,
                }),
        });
        logLaundryAction({
            date: todayISO,
            userId,
            message: `User registered ${washDry.wash} washes, ${washDry.dry} dries`,
            type: "Use register",
        });
        customAlert(true, "Guardado");
    });
};

export const getLaundryUser = async (userId) => {
    return await withErrorHandling(async () => {
        const document = await getDoc(doc(db, "laundry", "users"));
        return document.exists ? document.data()[userId] : {};
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

        await updateDoc(doc(db, 'laundry', 'users'), {
            [userPath]: newUserReservations,
        });
        await updateDoc(doc(db, 'laundry', 'calendar'), {
            [toDeleteMonthYear]: newTotalReservationsOfMonth,
        });
        logLaundryAction({
            date: new Date().toISOString(),
            userId,
            message: `User deleted  reservation for ${reservationToDelete}`,
            type: "Reservation Delete",
        });
        customAlert(true, "Borrado");
    });
};

const logLaundryAction = (actionDetails) => {
    withErrorHandling(async () => {
        await updateDoc(doc(db, 'laundry', 'log'), {
            [todayMonthYear]:
                arrayUnion(actionDetails),
        });
    });
};


export const getLaundry = async (users) => {
    return await withErrorHandling(async () => {
        const docs = await getDocs(collection(db, "laundry"));
        let laundry = {};
        docs.forEach((doc) => {
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
