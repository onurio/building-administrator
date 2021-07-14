import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormControl,
  Grid,
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
    width: '90%',
    margin: '0 5%',
  },
  formControl: {
    minWidth: '100%',
    // maxWidth: 300,
  },
}));

const initialApartment = {
  name: '',
  bills: 0,
  rent: 0,
  municipality: 0,
};

export default function ApartmentEdit({
  apartment,
  users = [],
  onCancel,
  onSave,
}) {
  const classes = useStyles();
  const [isEdit, setIsEdit] = useState(apartment !== undefined);
  const [apartmentInfo, setApartmentInfo] = useState(
    apartment || initialApartment
  );
  const [userLabels, setUserLabels] = useState(
    users.map((user) => ({ label: user.name, value: user.id }))
  );

  const handleChange = (e) => {
    setApartmentInfo((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  return (
    <Grid className={classes.container} container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4'>
          {isEdit ? 'Edit apartment info' : 'Add apartment'}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <TextField
          className={classes.input}
          variant='outlined'
          placeholder='Name'
          value={apartmentInfo.name || ''}
          label='Name'
          name='name'
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={4}>
        <TextField
          className={classes.input}
          variant='outlined'
          type='number'
          label='Rent'
          value={apartmentInfo.rent}
          name='rent'
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          className={classes.input}
          variant='outlined'
          type='number'
          label='Bills'
          value={apartmentInfo.bills}
          name='bills'
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          className={classes.input}
          variant='outlined'
          type='number'
          label='Municipality Tax'
          value={apartmentInfo.municipality}
          name='municipality'
          onChange={handleChange}
        />
      </Grid>
      {isEdit && (
        <Grid item xs={4}>
          <FormControl className={classes.formControl}>
            <InputLabel id='tenant'>Tenant</InputLabel>
            <Select
              labelId='tenant'
              id='tenant'
              onChange={(e) => {
                setApartmentInfo((s) => ({ ...s, tenant: e.target.value }));
              }}
              variant='outlined'
              value={apartmentInfo.tenant?.id || ''}
            >
              {userLabels.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}

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
          onClick={() => onSave(apartmentInfo, isEdit)}
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

ApartmentEdit.propTypes = {
  apartment: PropTypes.object,
};

ApartmentEdit.defaultProps = {
  apartment: undefined,
};
