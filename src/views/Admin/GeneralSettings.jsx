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

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  hoursContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    // maxWidth: 500,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  fullWidth: {
    width: '100%',
    margin: 10,
  },
  title: {
    marginBottom: 15,
  },
}));

export default function GeneralSettings({ db }) {
  const classes = useStyles();
  const [initialCategories, setInitialCategories] = useState();
  const [openingHours, setOpeningHours] = useState();

  const updateCategories = (categories) => {
    db.collection('generalData').doc('artCategories').set({
      data: categories,
    });
  };

  const onOpeningHoursSave = () => {
    db.collection('generalData').doc('openingHours').set({
      data: openingHours,
    });
  };

  const getOpeningHours = () => {
    db.collection('generalData')
      .doc('openingHours')
      .get()
      .then(function (doc) {
        if (doc.exists) {
          setOpeningHours(doc.data().data);
        } else {
          // doc.data() will be undefined in this case
          console.log('No such document!');
        }
      })
      .catch(function (error) {
        console.log('Error getting opening hours:', error);
      });
  };

  const getCategories = () => {
    db.collection('generalData')
      .doc('artCategories')
      .get()
      .then(function (doc) {
        if (doc.exists) {
          const categories = doc
            .data()
            .data.map((cat, index) => ({ key: index, label: cat }));
          setInitialCategories(categories);
        } else {
          // doc.data() will be undefined in this case
          console.log('No such document!');
        }
      })
      .catch(function (error) {
        console.log('Error getting categories:', error);
      });
  };

  useEffect(() => {
    getCategories();
    getOpeningHours();
  }, []);

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h2">General Settings</Typography>
        </Grid>
        <Grid item xs={6}>
          <Paper className={[classes.hoursContainer, classes.paper]}>
            <Typography className={classes.title} variant="h4">
              Opening Hours
            </Typography>
            <TextField
              variant="outlined"
              multiline
              onChange={(e) => setOpeningHours(e.target.value)}
              value={openingHours}
              placeholder="Opening Hours"
              className={classes.fullWidth}
            />
            <Button
              onClick={onOpeningHoursSave}
              color="primary"
              variant="contained"
            >
              Save
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <Typography className={classes.title} variant="h4">
              Art Categories
            </Typography>

            {initialCategories ? (
              <ChipsArray
                onChange={updateCategories}
                initialChips={initialCategories}
              />
            ) : (
              <div>Loading Categories...</div>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

GeneralSettings.propTypes = {
  db: PropTypes.object.isRequired,
};
