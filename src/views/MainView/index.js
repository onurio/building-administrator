import { Router } from '@reach/router';
import React, { useEffect, useState } from 'react';
import Loader from '../../components/Loader';
import { getUserFromEmail } from '../../utils/dbRequests';
import Dashboard from '../Admin/Dashboard';
import Laundry from './Laundry';
import Reciepts from './Reciepts';
import General from './General';
import SignIn from './SignIn';
import LocalLaundryServiceIcon from '@material-ui/icons/LocalLaundryService';
import PersonIcon from '@material-ui/icons/Person';
import ReceiptIcon from '@material-ui/icons/Receipt';

let sideItems = [
  {
    key: 'general',
    text: 'General',
    link: '/',
    icon: <PersonIcon />,
  },
  {
    key: 'reciepts',
    text: 'Recibos',
    link: '/reciepts',
    icon: <ReceiptIcon />,
  },

  {
    key: 'laundry',
    text: 'Lavanderia',
    link: '/laundry',
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
    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        // console.log(usr);
        // setIsAuthenticaited(true);
        // localStorage.setItem('jdcEmail',email);
      })
      .catch(function (error) {
        setLoading(false);

        // Handle Errors here.
        // var errorCode = error.code;
        // var errorMessage = error.message;
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
    let email = prompt('Escribe tu correo aqui, para resetear tu cuenta');
    if (email) {
      auth.sendPasswordResetEmail(email);
    }
  };

  if (loading) return <Loader />;

  let enableLaundry = true;

  if (userData) {
    if (userData.services.indexOf('laundry') === -1) {
      enableLaundry = false;
      sideItems = sideItems.filter((item) => item.key !== 'laundry');
    }
  }

  if (isAuthenticated && userData) {
    return (
      <Dashboard
        sideItems={sideItems}
        title={`Edificio Juan del Carpio Dashboard - ${userData.name} (${
          userData.apt || 'Sin departamento'
        })`}
        path='/*'
        logout={logout}
      >
        <Router>
          <General userData={userData} path='/' />
          <Reciepts
            userData={userData}
            reciepts={userData.reciepts}
            path='/reciepts'
          />
          {enableLaundry && <Laundry userData={userData} path='/laundry' />}
        </Router>
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
