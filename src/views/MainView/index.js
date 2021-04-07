import React, { useEffect, useState } from 'react';
import Dashboard from '../Admin/Dashboard';
import SignIn from '../Admin/SignIn';
export default function MainView({ auth, children }) {
  const [isAuthenticated, setIsAuthenticaited] = useState(false);

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
    auth.onAuthStateChanged(function (user) {
      if (user) {
        if (
          user.email === 'omrinuri@gmail.com' ||
          user.email === 'edificio.juandelcarpio@gmail.com' ||
          user.email === 'alborde86@gmail.com'
        ) {
          setIsAuthenticaited(false);
        } else {
          // User is signed in.

          setIsAuthenticaited(true);
        }
      } else {
        // No user is signed in.
        setIsAuthenticaited(false);
      }
    });
  }, [auth]);

  const login = (email, password) => {
    auth.signInWithEmailAndPassword(email, password).catch(function (error) {
      // Handle Errors here.
      // var errorCode = error.code;
      // var errorMessage = error.message;
      alert(error.message);
    });
  };

  if (isAuthenticated) {
    return (
      <Dashboard title='Edificio Juan del Carpio' path='/' logout={logout}>
        {children}
      </Dashboard>
    );
  } else {
    return (
      <div>
        <SignIn login={login} />
      </div>
    );
  }
}
