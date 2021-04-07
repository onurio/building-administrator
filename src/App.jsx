import React, { useEffect, useRef, useState } from 'react';
import './App.scss';
import { Redirect, Router } from '@reach/router';
import Admin from './views/Admin/Admin';
import firebase from 'firebase';
import firebaseConfig from './firebaseCred';
// import GeneralSettings from './views/Admin/GeneralSettings';
// import Artists from './views/Admin/Artists';
// import ArtistArtworks from './views/Admin/ArtistArtworks';
// import MainView from './views/MainView';
import {
  getArtists,
  getCategories,
  getExpos,
  getHours,
} from './utils/dbRequests';
import logo from './assets/images/logo.png';
import MainView from './views/MainView';
import Apartments from './views/Admin/Apartments';
import Users from './views/Admin/Users';
// import Expositions from './views/Admin/Expositions';

function App() {
  const auth = useRef();
  const db = useRef();
  const storage = useRef();
  const app = useRef();
  const [isLoaded, setIsLoaded] = useState(false);
  const [data, setData] = useState();

  const getData = async () => {
    try {
      // let newData = {
      //   openingHours: await getHours(db.current),
      //   categories: await getCategories(db.current),
      //   expos: await getExpos(db.current),
      //   artists: await getArtists(db.current),
      // };
      // setData(newData);
      setData({});
      setIsLoaded(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!app.current) {
      app.current = firebase.initializeApp(firebaseConfig);
      firebase.analytics();
      auth.current = firebase.auth();
      db.current = firebase.firestore();
      storage.current = firebase.storage();
    }
    getData();
  }, []);

  if (!isLoaded || !data)
    return (
      <div className='loader'>
        loading...
        {/* <div className='loader-wrapper'>
          <img width='100px' src={logo} alt='Logo' />
          <div className='lds-ripple'>
            <div></div>
            <div></div>
          </div>
        </div> */}
      </div>
    );

  return (
    <div className='App'>
      <Router>
        <MainView auth={auth.current} path='/' />
        <Admin auth={auth.current} path='admin'>
          {/* <GeneralSettings path='/' db={db.current} />
          <Artists path='artists' storage={storage.current} db={db.current} />
          <ArtistArtworks
            path='artists/:id'
            storage={storage.current}
            db={db.current}
          />
          <Expositions
            path='expositions'
            storage={storage.current}
            db={db.current}
          /> */}
          <Users path='users' db={db.current} />
          <Apartments path='apartments' db={db.current} />
        </Admin>
      </Router>
    </div>
  );
}

export default App;
