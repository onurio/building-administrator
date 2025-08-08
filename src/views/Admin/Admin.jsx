import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import SettingsIcon from "@material-ui/icons/Settings";
import Users from "./Users";
import Apartments from "./Apartments";
import Recibos from "./Reciepts";
import Payments from "./Payments";
import { getApartments, getServices, getUsers } from "../../utils/dbRequests";
import Services from "./Services";
import PeopleIcon from "@material-ui/icons/People";
import ApartmentIcon from "@material-ui/icons/Apartment";
import ReceiptIcon from "@material-ui/icons/Receipt";
import PaymentIcon from "@material-ui/icons/Payment";
import LocalLaundryServiceIcon from "@material-ui/icons/LocalLaundryService";
import LaundryUseView from "./LaundryUseView";
import WaterAndElectricityEditor from "./WaterAndElectricityEditor";
import { Equalizer, GraphicEq } from "@material-ui/icons";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { Route, Router, Routes } from "react-router";
import AdminLogin from "./AdminLogin";

let ADMIN_EMAILS = process.env.REACT_APP_ADMIN_EMAILS ?? "";
ADMIN_EMAILS = ADMIN_EMAILS.split(",");
let sideItems = [
  {
    key: "services",
    text: "Servicios",
    link: "services",
    icon: <SettingsIcon />,
  },
  {
    key: "laundry",
    text: "Lavandería",
    link: "laundry",
    icon: <LocalLaundryServiceIcon />,
  },
  {
    key: "users",
    text: "Usuarios",
    link: "users",
    icon: <PeopleIcon />,
  },
  {
    key: "apartments",
    text: "Apartamentos",
    link: "apartments",
    icon: <ApartmentIcon />,
  },
  {
    key: "reciepts",
    text: "Recibos",
    link: "reciepts",
    icon: <ReceiptIcon />,
  },
  {
    key: "payments",
    text: "Pagos",
    link: "payments",
    icon: <PaymentIcon />,
  },
  {
    key: "waterAndElectricity",
    text: "Agua y Electricidad",
    link: "waterandelectricity",
    icon: <Equalizer />,
  },
];

export default function Admin({ auth, storage }) {
  const [isAuthenticaited, setIsAuthenticaited] = useState(false);
  const [apartments, setApartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState();

  const logout = () => {
    auth
      .signOut()
      .then(function () {
        // Sign-out successful.
        setIsAuthenticaited(false);
      })
      .catch(function (error) {
        // An error happened.
        alert(error);
      });
  };

  useEffect(() => {
    if (auth) {
      auth.onAuthStateChanged(function (user) {
        if (user) {
          if (
            ADMIN_EMAILS.includes(user.email)
          ) {
            setIsAuthenticaited(true);
          } else {
            setIsAuthenticaited(false);
          }
          // User is signed in.
        } else {
          // No user is signed in.
          setIsAuthenticaited(false);
        }
      });
    }
  }, [auth]);

  const refresh = async () => {
    const addIndexes = (arr) => {
      return arr ?? [].map((item, index) => {
        return { ...item, edit: index };
      });
    };
    setApartments(addIndexes(await getApartments()));
    setUsers(addIndexes(await getUsers()));
    setServices(await getServices());
  };

  useEffect(() => {
    if (isAuthenticaited) {
      refresh();
    }
  }, [isAuthenticaited]);

  const handleLoginSuccess = () => {
    setIsAuthenticaited(true);
  };

  if (isAuthenticaited) {
    return (
      <Dashboard
        sideItems={sideItems}
        title="Admin Juan del Carpio 104"
        path="/*"
        logout={logout}
      >
        <Routes>
          <Route path="/" element={<Services users={users} path="/services" />} />
          <Route path="/services" element={<Services users={users} path="/services" />} />
          <Route path="/laundry" element={<LaundryUseView users={users} path="/laundry" />} />
          <Route path="/users" element={<Users users={users} refresh={refresh} path="/users" auth={auth} storage={storage} />} />
          <Route path="/apartments" element={<Apartments apartments={apartments} users={users} refresh={refresh} path="/apartments" />} />
          <Route path="/reciepts" element={<Recibos apartments={apartments} users={users} storage={storage} services={services} refresh={refresh} path="/reciepts" />} />
          <Route path="/payments" element={<Payments apartments={apartments} users={users} services={services} storage={storage} refresh={refresh} path="/payments" />} />
          <Route path="/waterandelectricity" element={<WaterAndElectricityEditor apartments={apartments} users={users} services={services} refresh={refresh} path="/waterandelectricity" />} />
        </Routes>
      </Dashboard>
    );
  } else {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }
}
