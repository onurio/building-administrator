import React, { useEffect, useRef, useState } from 'react';
import './App.scss';
import { Router } from '@reach/router';
import Admin from './views/Admin/Admin';
import firebase from 'firebase';
import firebaseConfig from './firebaseCred';
import MainView from './views/MainView';
import Apartments from './views/Admin/Apartments';
import Users from './views/Admin/Users';
import Loader from './components/Loader';
import { initDB, setAlert } from './utils/dbRequests';
import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import GenerateReciepts from './views/Admin/GenerateReciepts';

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
      app.current = firebase.initializeApp(firebaseConfig);

      firebase.analytics();
      auth.current = firebase.auth();

      initDB();
      setAlert(triggerSnack);
      storage.current = firebase.storage();
      setLoading(false);
    }
  }, []);

  const handleCloseSnack = () => {
    setSnackProps((s) => ({ ...s, open: false }));
  };

  if (loading) return <Loader />;

  return (
    <div className='App'>
      <Router>
        <MainView auth={auth.current} path='/*' />
        <Admin auth={auth.current} path='admin/*' />
      </Router>
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
