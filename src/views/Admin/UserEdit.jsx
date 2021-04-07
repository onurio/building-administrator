import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Chip,
  FormControl,
  Grid,
  Input,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
    maxWidth: 700,
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  input: {
    width: '100%',
  },
  formControl: {
    minWidth: '100%',
    // maxWidth: 300,
  },
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 100,
    },
  },
};

const initialUser = {
  name: '',
  email: '',
  reciepts: [],
  services: [],
};

let services = [
  { label: 'Internet', value: 'internet' },
  { label: 'Cable', value: 'cable' },
  { label: 'Laundry', value: 'laundry' },
];

export default function UserEdit({ user, apartments = [], onCancel, onSave }) {
  const classes = useStyles();
  const [isEdit, setIsEdit] = useState(user !== undefined);
  const [userInfo, setUserInfo] = useState(user || initialUser);

  useEffect(() => {}, []);

  const handleChange = (e) => {
    setUserInfo((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  return (
    <Grid className={classes.container} container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4'>
          {isEdit ? 'Edit user info' : 'Add user'}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <TextField
          className={classes.input}
          variant='outlined'
          placeholder='Name'
          value={userInfo.name || ''}
          label='Name'
          name='name'
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={6}>
        <TextField
          className={classes.input}
          variant='outlined'
          label='Email'
          value={userInfo.email}
          name='email'
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={6}>
        <FormControl className={classes.formControl}>
          <InputLabel id='apartment'>Apartment</InputLabel>
          <Select
            labelId='apartment'
            id='apartment'
            onChange={(e) => {
              setUserInfo((s) => ({ ...s, artCategory: e.target.value }));
            }}
            variant='outlined'
            value={userInfo.apartment || ''}
          >
            {apartments.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <FormControl className={classes.formControl}>
          <InputLabel id='services'>Services</InputLabel>
          <Select
            labelId='services'
            id='services'
            multiple
            onChange={(e) => {
              setUserInfo((s) => ({ ...s, services: e.target.value }));
            }}
            variant='outlined'
            value={userInfo.services || []}
            input={<Input id='select-multiple-chip' />}
            renderValue={(selected) => (
              <div className={classes.chips}>
                {selected.map((value) => (
                  <Chip key={value} label={value} className={classes.chip} />
                ))}
              </div>
            )}
            MenuProps={MenuProps}
          >
            {services.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={6}></Grid>
      <Grid item xs={3}>
        <Button
          onClick={onCancel}
          className={classes.input}
          variant='contained'
        >
          Cancel
        </Button>
      </Grid>
      <Grid item xs={3}>
        <Button
          onClick={() => onSave(userInfo)}
          className={classes.input}
          variant='contained'
          color='primary'
        >
          Save
        </Button>
      </Grid>
    </Grid>
  );
}

UserEdit.propTypes = {
  user: PropTypes.object,
};

UserEdit.defaultProps = {
  user: undefined,
};
