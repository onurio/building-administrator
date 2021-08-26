import { Button, Checkbox, FormControlLabel } from '@material-ui/core';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

const mapListToDict = (list) => {
  let dict = {};
  list.forEach((item) => {
    dict[item] = true;
  });
  return dict;
};

export default function SelectFromList({ list = [], label, onSave }) {
  const [dict, setDict] = useState({});

  const handleSave = () => {
    const newList = [];
    Object.keys(dict).forEach((item) => {
      if (dict[item]) {
        newList.push(item);
      }
    });
    onSave(newList);
  };

  useEffect(() => {
    setDict(mapListToDict(list));
  }, [list]);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      <h2 style={{ margin: '20px 0', width: '100%' }}>{label}</h2>
      {Object.keys(dict).map((item) => (
        <FormControlLabel
          style={{ width: 80, padding: 5, margin: 5 }}
          control={
            <Checkbox
              checked={dict[item]}
              onChange={(e) =>
                setDict((s) => ({ ...s, [item]: e.target.checked }))
              }
              color='primary'
            />
          }
          label={item}
        />
      ))}
      <Button
        style={{ width: '100%', margin: '20px 0' }}
        color='primary'
        variant='contained'
        onClick={handleSave}
      >
        Save
      </Button>
    </div>
  );
}
