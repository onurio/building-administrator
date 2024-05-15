import React, { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import { getUserFromEmail } from "../../utils/dbRequests";
import Dashboard from "../Admin/Dashboard";
import Laundry from "./Laundry";
import ListReciepts from "./ListReciepts.tsx";
import General from "./General";
import SignIn from "./SignIn";
import LocalLaundryServiceIcon from "@material-ui/icons/LocalLaundryService";
import PersonIcon from "@material-ui/icons/Person";
import ReceiptIcon from "@material-ui/icons/Receipt";
import { Route, Routes } from "react-router";
import { signInWithEmailAndPassword } from "firebase/auth";

let sideItems = [
  {
    key: "general",
    text: "General",
    link: "/",
    icon: <PersonIcon />,
  },
  {
    key: "reciepts",
    text: "Recibos",
    link: "/reciepts",
    icon: <ReceiptIcon />,
  },

  {
    key: "laundry",
    text: "Lavanderia",
    link: "/laundry",
    icon: <LocalLaundryServiceIcon />,
  },
];

export default function MainView({ auth, children }) {
  const [isAuthenticated, setIsAuthenticaited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState();

  const logout = () => {
    auth
      .signOut()
      .then(function () {
        // Sign-out successful.
        setIsAuthenticaited(false);
        setLoading(false);
      })
      .catch(function (error) {
        // An error happened.
        alert(error);
      });
  };

  const login = (email, password) => {
    setLoading(true);

    signInWithEmailAndPassword(auth, email, password).catch(function (error) {
      setLoading(false);
      alert(error.message);
    });
  };

  useEffect(() => {
    if (auth) {
      auth.onAuthStateChanged((user) => {
        if (user) {
          getUserFromEmail(user.email).then((data) => {
            setUserData(data);
            setIsAuthenticaited(true);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
    }
  }, [auth]);

  const resetPass = () => {
    let email = prompt("Escribe tu correo aqui, para resetear tu cuenta");
    if (email) {
      auth.sendPasswordResetEmail(email);
    }
  };

  if (loading)
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loader />
      </div>
    );

  let enableLaundry = true;

  if (userData) {
    if (userData.services.indexOf("laundry") === -1) {
      enableLaundry = false;
      sideItems = sideItems.filter((item) => item.key !== "laundry");
    }
  }

  if (isAuthenticated && userData) {
    return (
      <Dashboard
        sideItems={sideItems}
        title={`Edificio Juan del Carpio Dashboard - ${userData.name} (${
          userData.apartment?.name || "Sin departamento"
        })`}
        path="/*"
        logout={logout}
      >
        <Routes>
          <Route path="/" element={<General user={userData} />} />
          <Route path="/reciepts" element={<ListReciepts user={userData} />} />
          {enableLaundry && (
            <Route path="/laundry" element={<Laundry userData={userData} />} />
          )}
        </Routes>
      </Dashboard>
    );
  } else {
    return (
      <div>
        <SignIn resetPassword={resetPass} login={login} />
      </div>
    );
  }
}
