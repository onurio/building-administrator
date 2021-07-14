import React from 'react';
import './Loader.css';
const Loader = () => (
  <div
    style={{
      height: '100%',
      minHeight: '85vh',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <div className='lds-ring'>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
);

export default Loader;
