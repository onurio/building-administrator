import React, { useEffect, useState } from 'react';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { isEqual, addDays, format } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  Button,
  makeStyles,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core';
import {
  deleteReservation,
  getLaundryUser,
  getReservedDates,
  reserveLaundryDay,
  saveLaundryUse,
} from '../../utils/dbRequests';
import { getMonthYear } from '../../utils/util';

const monthYear = getMonthYear(new Date());

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: 20,
    marginTop: 40,
    backgroundColor: 'cadetblue',
  },
  reserveSection: {
    position: 'relative',
    width: 360,
    padding: 20,
  },
  reservedNotice: {
    height: '100%',
    width: '100%',
    top: 0,
    left: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
  },
  useContainer: {
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
      marginTop: 20,
      width: '100%',
    },
    padding: 20,
    marginLeft: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: 250,
    height: 'fit-content',
    alignItems: 'flex-start',
  },
  logInput: {
    width: '45%',
  },
}));

const initialWashDry = { wash: 0, dry: 0 };

export default function Laundry({ userData }) {
  const [selectedDate, handleDateSelect] = useState();
  const [disabledDates, setDisabledDates] = useState([]);
  const [userReservations, setUserReservations] = useState();
  const [closestReservation, setClosestReservation] = useState();
  const [washDry, setWashDry] = useState({ ...initialWashDry });
  const classes = useStyles();

  const refresh = async () => {
    getReservedDates(monthYear).then(setDisabledDates);
    getLaundryUser(userData.id).then((laundryUser) => {
      let closest;
      let monthReserves = laundryUser.reservations[monthYear];

      if (!monthReserves.length) {
        setClosestReservation();
        return [];
      }
      monthReserves = monthReserves.sort();

      let today = new Date().toLocaleDateString();
      monthReserves.every(function (reserve) {
        if (today <= reserve) {
          closest = reserve;
          return false;
        } else return true;
      });

      closest =
        new Date(closest).toLocaleDateString() >= today ? closest : undefined;
      setClosestReservation(closest);
      setUserReservations(laundryUser.reservations[monthYear]);
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  const reserve = async () => {
    await reserveLaundryDay(userData.id, userData.name, selectedDate);
    setTimeout(() => {
      refresh();
    }, 500);

    handleDateSelect(undefined);
  };

  const addToCalendar = (date) => {
    let formattedDate = format(new Date(date), 'yyyyMMdd');
    let oneMore = format(addDays(new Date(date), 1), 'yyyyMMdd');
    window.open(
      `https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${formattedDate}%2F${oneMore}e&text=Lavanderia`,
      '_blank'
    );
  };

  const onDeleteReservation = async () => {
    await deleteReservation(
      userData.id,
      monthYear,
      disabledDates,
      userReservations,
      closestReservation
    );
    setTimeout(() => {
      refresh();
    }, 500);
  };

  const handleWashDry = (e) => {
    setWashDry((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const onSaveLaundryUse = async () => {
    await saveLaundryUse(washDry, userData.id, monthYear);
    setWashDry({ ...initialWashDry });
    setTimeout(() => {
      refresh();
    }, 500);
  };

  return (
    <div>
      <Typography variant='h3'>Lavanderia</Typography>

      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Paper className={classes.root}>
          <Paper className={classes.reserveSection}>
            <h2 style={{ marginBottom: 20 }}>Reservar dia para lavar</h2>

            {closestReservation && (
              <Paper className={classes.reservedNotice}>
                <h2>Proxima cita: {closestReservation}</h2>
                <Button
                  style={{ marginTop: 20 }}
                  onClick={onDeleteReservation}
                  color='secondary'
                  variant='contained'
                >
                  Borrar
                </Button>
                <Button
                  style={{ marginTop: 20 }}
                  onClick={() => {
                    addToCalendar(closestReservation);
                  }}
                  color='primary'
                  variant='contained'
                >
                  Agregar a google calendar
                </Button>
              </Paper>
            )}
            <KeyboardDatePicker
              margin='normal'
              id='date-picker-dialog'
              label='Date picker dialog'
              format='MM/dd/yyyy'
              variant='static'
              value={selectedDate}
              onChange={handleDateSelect}
              disablePast={true}
              shouldDisableDate={(day) => {
                const compareDate = new Date(day).toLocaleDateString();
                const isFree = disabledDates.every((disDate) => {
                  return disDate.date !== compareDate;
                });
                return !isFree;
              }}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
            <Button
              style={{ marginTop: 20 }}
              onClick={reserve}
              color='primary'
              disabled={!selectedDate}
              variant='contained'
            >
              Reservar dia
            </Button>
          </Paper>
          <Paper className={classes.useContainer}>
            <h2>Guardar uso</h2>
            <div
              style={{
                display: 'flex',
                margin: '20px 0',
                justifyContent: 'space-between',
              }}
            >
              <TextField
                className={classes.logInput}
                variant='filled'
                type='number'
                label='Lavadas'
                value={washDry.wash}
                name='wash'
                onChange={handleWashDry}
              />
              <TextField
                className={classes.logInput}
                variant='filled'
                type='number'
                label='Secadas'
                value={washDry.dry}
                name='dry'
                onChange={handleWashDry}
              />
            </div>

            <Button
              style={{ marginTop: 20 }}
              onClick={onSaveLaundryUse}
              color='primary'
              disabled={washDry.dry <= 0 && washDry.wash <= 0}
              variant='contained'
            >
              Guardar uso
            </Button>
          </Paper>
        </Paper>
      </MuiPickersUtilsProvider>
    </div>
  );
}
