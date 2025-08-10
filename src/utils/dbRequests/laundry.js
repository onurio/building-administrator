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

// Admin function to delete any reservation
export const adminDeleteReservation = async (reservationToDelete, monthYear) => {
    return await withErrorHandling(async () => {
        const reservationsOfMonth = await getReservedDates(monthYear);
        const newTotalReservationsOfMonth = reservationsOfMonth.filter(
            (reservation) => {
                return new Date(reservationToDelete).getTime() !== new Date(reservation.date).getTime();
            }
        );

        await updateDoc(doc(db, 'laundry', 'calendar'), {
            [monthYear]: newTotalReservationsOfMonth,
        });

        // Also remove from user's reservations if found
        const userReservation = reservationsOfMonth.find(res => 
            new Date(res.date).getTime() === new Date(reservationToDelete).getTime()
        );
        
        if (userReservation && userReservation.userId) {
            const userDoc = await getDoc(doc(db, 'laundry', 'users'));
            const userData = userDoc.data();
            const userReservations = userData[userReservation.userId]?.reservations?.[monthYear] || [];
            const newUserReservations = userReservations.filter(
                (date) => new Date(date).getTime() !== new Date(reservationToDelete).getTime()
            );

            await updateDoc(doc(db, 'laundry', 'users'), {
                [`${userReservation.userId}.reservations.${monthYear}`]: newUserReservations,
            });
        }

        logLaundryAction({
            date: new Date().toISOString(),
            userId: "admin",
            message: `Admin deleted reservation for ${reservationToDelete}`,
            type: "Admin Reservation Delete",
        });
        customAlert(true, "Reserva eliminada por el administrador");
    });
};

// Admin function to add reservation for any user
export const adminAddReservation = async (userId, userName, date) => {
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
            [`${userId}.reservations.${monthYear}`]: arrayUnion(formattedDate),
        });

        logLaundryAction({
            date: new Date().toISOString(),
            userId: "admin",
            message: `Admin added reservation for ${userName} on ${formattedDate}`,
            type: "Admin Reservation Add",
        });
        customAlert(true, "Reserva añadida por el administrador");
        return true;
    });
};

// Admin function to edit laundry usage for any user
export const adminEditLaundryUsage = async (userId, monthYear, washDry, logId = null) => {
    return await withErrorHandling(async () => {
        const userDoc = await getDoc(doc(db, 'laundry', 'users'));
        const userData = userDoc.data();
        const currentUsage = userData[userId]?.use?.[monthYear] || [];
        
        if (logId !== null && currentUsage[logId]) {
            // Edit existing usage
            currentUsage[logId] = {
                ...currentUsage[logId],
                ...washDry,
                editedBy: "admin",
                editedAt: new Date().toISOString(),
            };
        } else {
            // Add new usage
            currentUsage.push({
                ...washDry,
                date: new Date().toISOString(),
                addedBy: "admin",
            });
        }

        await updateDoc(doc(db, 'laundry', 'users'), {
            [`${userId}.use.${monthYear}`]: currentUsage,
        });

        logLaundryAction({
            date: new Date().toISOString(),
            userId: "admin",
            message: `Admin ${logId !== null ? 'edited' : 'added'} usage for user ${userId}: ${washDry.wash} washes, ${washDry.dry} dries`,
            type: "Admin Usage Edit",
        });
        
        customAlert(true, logId !== null ? "Uso editado por el administrador" : "Uso añadido por el administrador");
    });
};

// Admin function to delete laundry usage
export const adminDeleteLaundryUsage = async (userId, monthYear, logId) => {
    return await withErrorHandling(async () => {
        const userDoc = await getDoc(doc(db, 'laundry', 'users'));
        const userData = userDoc.data();
        const currentUsage = userData[userId]?.use?.[monthYear] || [];
        
        if (currentUsage[logId]) {
            currentUsage.splice(logId, 1);
            
            await updateDoc(doc(db, 'laundry', 'users'), {
                [`${userId}.use.${monthYear}`]: currentUsage,
            });

            logLaundryAction({
                date: new Date().toISOString(),
                userId: "admin",
                message: `Admin deleted usage entry for user ${userId}`,
                type: "Admin Usage Delete",
            });
            
            customAlert(true, "Uso eliminado por el administrador");
        }
    });
};
