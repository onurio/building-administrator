import { SettingsInputComponent } from '@material-ui/icons';
import { Router } from '@reach/router';
import React, { useEffect, useState } from 'react';
import Loader from '../../components/Loader';
import { getUserFromEmail } from '../../utils/dbRequests';
import Dashboard from '../Admin/Dashboard';
import Laundry from './Laundry';
import Reciepts from './Reciepts';
import Settings from './Settings';
import SignIn from './SignIn';

// const userData = {
//   name: 'Paulo',
//   email: 'paulo@gmail.com',

//   apt: '1',
//   reciepts: [
//     {
//       id: 'ASDJ24',
//       name: 'Paulo - Deciembre 2021',
//       date: '12/12/21',
//       link: 'https://google.com',
//     },
//   ],
//   services: [],
//   laundry: {
//     log: [],
//   },
// };

let sideItems = [
  {
    key: 'reciepts',
    text: 'Recibos',
    link: '/reciepts',
    icon: <SettingsInputComponent />,
  },
  {
    key: 'settings',
    text: 'Ajustes',
    link: '/settings',
    icon: <SettingsInputComponent />,
  },
  {
    key: 'laundry',
    text: 'Lavanderia',
    link: '/laundry',
    icon: <SettingsInputComponent />,
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
      })
      .catch(function (error) {
        // An error happened.
        alert(error);
      });
  };

  const login = (email, password) => {
    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        setIsAuthenticaited(true);
        // localStorage.setItem('jdcEmail',email);
      })
      .catch(function (error) {
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
          });
        }
        setLoading(false);
      });
    }
  }, [auth]);

  const resetPass = () => {
    let email = prompt('Escribe tu correo aqui, para resetear tu cuenta');
    if (email) {
      auth.sendPasswordResetEmail(email);
    }
  };

  if (loading && !userData) return <Loader />;

  if (isAuthenticated) {
    return (
      <Dashboard
        sideItems={sideItems}
        title={`Edificio Juan del Carpio Dashboard - ${userData.name} (${userData.apt})`}
        path='/*'
        logout={logout}
      >
        <Router>
          <Reciepts reciepts={userData.reciepts} path='/reciepts' />
          <Settings userData={userData} path='/settings' />
          <Laundry userData={userData} path='/laundry' />
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
