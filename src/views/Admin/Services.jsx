import {
  Box,
  Button,
  makeStyles,
  Paper,
  Grid,
  TextField,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import ChipsArray from './components/ChipArray';
import PropTypes from 'prop-types';
import {
  getLaundry,
  getMonthlyReports,
  getServices,
  updateCategories,
  updateServices,
} from '../../utils/dbRequests';
import Loader from '../../components/Loader';
import LaundryUseView from './LaundryUseView';
import MonthlyReports from './MonthlyReports';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    display: 'flex',
  },
  fullWidth: {
    width: '100%',
    margin: 10,
  },
  tables: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0 20px',
    width: '100%',
  },
  title: {
    marginBottom: 15,
  },
}));

export default function Services({ users }) {
  const classes = useStyles();
  const [services, setServices] = useState();

  const refresh = async () => {
    const fetchedServices = await getServices();
    setServices(fetchedServices);
  };
  useEffect(() => {
    if (users) {
      refresh();
    }
  }, [users]);

  const handleChange = (e) => {
    setServices((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const onSaveServices = async () => {
    await updateServices(services);
    setTimeout(() => {
      refresh();
    }, 500);
  };

  if (!services) return <Loader />;

  return (
    <div className={classes.root}>
      <div className={classes.tables}>
        <MonthlyReports />
      </div>

      <Paper
        style={{
          width: 'min-content',
          height: 'fit-content',
          minWidth: 400,
          padding: 20,
        }}
      >
        <Grid container xs={12} spacing={3}>
          <Grid item xs={12}>
            <h2>General Prices</h2>
          </Grid>
          <Grid item xs={6}>
            <TextField
              className={classes.input}
              variant='outlined'
              type='number'
              label='Internet price'
              value={services.internet}
              name='internet'
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              className={classes.input}
              variant='outlined'
              type='number'
              label='Maintenance price'
              value={services.maintenance}
              name='maintenance'
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              className={classes.input}
              variant='outlined'
              type='number'
              label='Administration price'
              value={services.administration}
              name='administration'
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              className={classes.input}
              variant='outlined'
              type='number'
              label='Cable price'
              value={services.cable}
              name='cable'
              onChange={handleChange}
            />
          </Grid>
          <Grid item alignItems='center' xs={12}>
            <Button
              onClick={onSaveServices}
              variant='contained'
              color='primary'
            >
              Update prices
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}

Services.propTypes = {};
