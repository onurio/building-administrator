import { Checkbox, FormControlLabel } from '@material-ui/core';
import React from 'react';
import { useState } from 'react';

export default function SimpleCheckBox({
  defaultChecked,
  onChange,
  editable = false,
  label,
}) {
  const [checked, setChecked] = useState(defaultChecked);

  const handleChange = (e) => {
    const val = e.target.checked;
    setChecked(val);
    onChange(val);
  };

  return (
    <FormControlLabel
      style={{
        pointerEvents: editable ? 'all' : 'none',
        padding: 5,
        margin: 5,
      }}
      control={
        <Checkbox checked={checked} onChange={handleChange} color='primary' />
      }
      label={label}
    />
  );
}
