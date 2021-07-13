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
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

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
    width: '90%',
    margin: '0 5%',
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
  tel: '',
  telEmergency: '',
  deposito: '',
  dni_ruc: '',
  contract_start: '',
  contract_end: '',
  debt: 0,
  deposit: 0,
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

  const handleDate = (date, type) => {
    handleChange({
      target: { name: type, value: new Date(date).toLocaleDateString() },
    });
  };

  return (
    <Grid className={classes.container} container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4'>
          {isEdit ? 'Edit user info' : 'Add user'}
        </Typography>
      </Grid>
      <Grid item xs={4}>
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

      <Grid item xs={4}>
        <TextField
          className={classes.input}
          variant='outlined'
          label='Email'
          value={userInfo.email}
          name='email'
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          className={classes.input}
          variant='outlined'
          label='Dni/Ruc'
          value={userInfo.dni_ruc}
          name='dni_ruc'
          onChange={handleChange}
        />
      </Grid>

      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Grid item xs={6}>
          <KeyboardDatePicker
            value={userInfo.contract_start}
            className={classes.input}
            onChange={(val) => handleDate(val, 'contract_start')}
            label='Contract start'
          />
          <KeyboardDatePicker
            value={userInfo.contract_end}
            className={classes.input}
            label='Contract end'
            onChange={(val) => handleDate(val, 'contract_end')}
          />
        </Grid>
      </MuiPickersUtilsProvider>

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

      <Grid item xs={4}>
        <TextField
          className={classes.input}
          variant='outlined'
          type='number'
          placeholder='Phone'
          value={userInfo.tel || ''}
          label='Phone'
          name='tel'
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          className={classes.input}
          variant='outlined'
          type='number'
          placeholder='Phone Emergency'
          value={userInfo.telEmergency || ''}
          label='Phone Emergency'
          name='telEmergency'
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={2}>
        <TextField
          className={classes.input}
          variant='outlined'
          type='number'
          placeholder='Debt'
          value={userInfo.debt || ''}
          label='Debt'
          name='debt'
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={2}>
        <TextField
          className={classes.input}
          variant='outlined'
          type='number'
          placeholder='Deposit'
          value={userInfo.deposit || ''}
          label='Deposit'
          name='deposit'
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={6} />
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
          onClick={() => onSave(userInfo, isEdit)}
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
