import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import SettingsIcon from "@material-ui/icons/Settings";
import Users from "./Users";
import Apartments from "./Apartments";
import Reciepts from "./Reciepts";
import { getApartments, getServices, getUsers } from "../../utils/dbRequests";
import Services from "./Services";
import PeopleIcon from "@material-ui/icons/People";
import ApartmentIcon from "@material-ui/icons/Apartment";
import ReceiptIcon from "@material-ui/icons/Receipt";
import LocalLaundryServiceIcon from "@material-ui/icons/LocalLaundryService";
import LaundryUseView from "./LaundryUseView";
import WaterAndElectricityEditor from "./WaterAndElectricityEditor";
import { Equalizer, GraphicEq } from "@material-ui/icons";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { Route, Router, Routes } from "react-router";

let ADMIN_EMAILS = process.env.REACT_APP_ADMIN_EMAILS ?? "";
ADMIN_EMAILS = ADMIN_EMAILS.split(",");
let sideItems = [
  {
    key: "services",
    text: "Services",
    link: "services",
    icon: <SettingsIcon />,
  },
  {
    key: "laundry",
    text: "Laundry",
    link: "laundry",
    icon: <LocalLaundryServiceIcon />,
  },
  {
    key: "users",
    text: "Users",
    link: "users",
    icon: <PeopleIcon />,
  },
  {
    key: "apartments",
    text: "Apartments",
    link: "apartments",
    icon: <ApartmentIcon />,
  },
  {
    key: "reciepts",
    text: "Reciepts",
    link: "reciepts",
    icon: <ReceiptIcon />,
  },
  {
    key: "waterAndElectricity",
    text: "Water and Electricity",
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

  const login = () => {
    if (isAuthenticaited) return;
    const auth = getAuth();
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        if (
          user.email === "omrinuri@gmail.com" ||
          user.email === "edificio.juandelcarpio@gmail.com" ||
          user.email === "alborde86@gmail.com"
        ) {
          setIsAuthenticaited(true);
        } else {
          alert("Your google account is unauthorized to use this page.");
          setIsAuthenticaited(false);
        }
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        alert(error.message);
      });
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
          <Route path="/reciepts" element={<Reciepts apartments={apartments} users={users} storage={storage} services={services} refresh={refresh} path="/reciepts" />} />
          <Route path="/waterandelectricity" element={<WaterAndElectricityEditor apartments={apartments} users={users} services={services} refresh={refresh} path="/waterandelectricity" />} />
        </Routes>
      </Dashboard>
    );
  } else {
    return (
      <div>
        <h1>You must log be an admin to view this page</h1>
        <button onClick={login}>Login using google</button>
      </div>
    );
  }
}
