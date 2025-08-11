import React, { useEffect, useRef, useState } from 'react';
import './App.scss';
import Admin from './views/Admin/Admin';
import firebaseConfig from './firebaseConfig';
import MainView from './views/MainView';
import Loader from './components/Loader';
import { initDB, setAlert, setStorage } from './utils/dbRequests';
import { setGlobalAuth } from './utils/authUtils';
import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { initializeApp } from 'firebase/app';
import { initializeAnalytics } from 'firebase/analytics';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { Route, Router, Routes } from 'react-router';
import analytics from './utils/analytics';

function Alert(props) {
  return <MuiAlert elevation={6} variant='filled' {...props} />;
}

function App() {
  const auth = useRef();
  const storage = useRef();
  const app = useRef();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [snackProps, setSnackProps] = useState({
    open: false,
    isSuccess: true,
    text: '',
  });

  const triggerSnack = (isSuccess = true, text) => {
    setSnackProps({ isSuccess, text, open: true });
  };

  useEffect(() => {
    if (!app.current) {
      app.current = initializeApp(firebaseConfig);

      initializeAnalytics(app.current);
      auth.current = getAuth(app.current);

      initDB();
      setAlert(triggerSnack);
      storage.current = getStorage(app.current);
      setStorage(storage.current);
      setGlobalAuth(auth.current); // Set global auth for utility functions

      // Set up auth state listener for analytics
      onAuthStateChanged(auth.current, (user) => {
        setCurrentUser(user);
        if (user) {
          // Track user login
          analytics.trackUserLogin(user);
          // Update user activity every 5 minutes while active
          const activityInterval = setInterval(() => {
            analytics.updateUserActivity(user);
          }, 5 * 60 * 1000); // 5 minutes

          // Clean up interval when user logs out
          return () => clearInterval(activityInterval);
        }
      });

      setLoading(false);
    }
  }, []);

  // Track session end when user leaves the app
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUser) {
        analytics.trackSessionEnd(currentUser);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (currentUser) {
        analytics.trackSessionEnd(currentUser);
      }
    };
  }, [currentUser]);

  const handleCloseSnack = () => {
    setSnackProps((s) => ({ ...s, open: false }));
  };

  if (loading)
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Loader />
      </div>
    );

  return (
    <div className='App'>
      <Routes>
        <Route path='/*' element={<MainView auth={auth.current} currentUser={currentUser} />} />
        <Route path='/admin/*' element={<Admin auth={auth.current} storage={storage.current} currentUser={currentUser} />} />
      </Routes>
      <Snackbar
        open={snackProps.open}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={6000}
        onClose={handleCloseSnack}
      >
        <Alert
          onClose={handleCloseSnack}
          severity={snackProps.isSuccess ? 'success' : 'error'}
        >
          {snackProps.text}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
