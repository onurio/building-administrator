import React, { useEffect, useState } from 'react';
import firebase from 'firebase';
import Dashboard from './Dashboard';
import SettingsIcon from '@material-ui/icons/Settings';
import Users from './Users';
import Apartments from './Apartments';
import GenerateReciepts from './GenerateReciepts';
import { Redirect, Router } from '@reach/router';
import { getApartments, getServices, getUsers } from '../../utils/dbRequests';
import Services from './Services';
import PeopleIcon from '@material-ui/icons/People';
import ApartmentIcon from '@material-ui/icons/Apartment';
import ReceiptIcon from '@material-ui/icons/Receipt';
let sideItems = [
  {
    key: 'services',
    text: 'Services',
    link: 'services',
    icon: <SettingsIcon />,
  },
  {
    key: 'users',
    text: 'Users',
    link: 'users',
    icon: <PeopleIcon />,
  },
  {
    key: 'apartments',
    text: 'Apartments',
    link: 'apartments',
    icon: <ApartmentIcon />,
  },

  {
    key: 'generate_recieptes',
    text: 'Generate Reciepts',
    link: 'generate-reciepts',
    icon: <ReceiptIcon />,
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
            user.email === 'omrinuri@gmail.com' ||
            user.email === 'edificio.juandelcarpio@gmail.com' ||
            user.email === 'alborde86@gmail.com'
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
      return arr.map((item, index) => {
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
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        if (
          user.email === 'omrinuri@gmail.com' ||
          user.email === 'edificio.juandelcarpio@gmail.com' ||
          user.email === 'alborde86@gmail.com'
        ) {
          setIsAuthenticaited(true);
        } else {
          alert('Your google account is unauthorized to use this page.');
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
        title='Admin Juan del Carpio 104'
        path='/*'
        logout={logout}
      >
        <Router>
          <Redirect noThrow={true} from='/' to='services' />
          <Services users={users} path='/services' />
          <Users
            users={users}
            refresh={refresh}
            path='/users'
            auth={auth}
            storage={storage}
          />
          <Apartments
            apartments={apartments}
            users={users}
            refresh={refresh}
            path='/apartments'
          />
          <GenerateReciepts
            apartments={apartments}
            users={users}
            storage={storage}
            services={services}
            refresh={refresh}
            path='/generate-reciepts'
          />
        </Router>
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
