import React, { useEffect, useRef, useState } from 'react';
import './App.scss';
import Admin from './views/Admin/Admin';
import firebaseConfig from './firebaseConfig';
import MainView from './views/MainView';
import Loader from './components/Loader';
import { initDB, setAlert, setStorage } from './utils/dbRequests';
import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { initializeApp } from 'firebase/app';
import { initializeAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { Route, Router, Routes } from 'react-router';

function Alert(props) {
  return <MuiAlert elevation={6} variant='filled' {...props} />;
}

function App() {
  const auth = useRef();
  const storage = useRef();
  const app = useRef();
  const [loading, setLoading] = useState(true);
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
      auth.current = getAuth(app.current)

      initDB();
      setAlert(triggerSnack);
      storage.current = getStorage(app.current);
      setStorage(storage.current);
      setLoading(false);
    }
  }, []);

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
        <Route path='/*' element={<MainView auth={auth.current} />} />
        <Route path='/admin/*' element={<Admin auth={auth.current} storage={storage.current} />} />
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
