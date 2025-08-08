import React, { useEffect, useState } from 'react';
import { addDays, format } from 'date-fns';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import {
  Button,
  makeStyles,
  Paper,
  TextField,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Avatar,
} from '@material-ui/core';
import {
  LocalLaundryService,
  Event,
  Delete,
  Save,
  CalendarToday,
  Assignment,
  TrendingUp,
} from '@material-ui/icons';
import {
  deleteReservation,
  getLaundryUser,
  getReservedDates,
  reserveLaundryDay,
  saveLaundryUse,
} from '../../utils/dbRequests';
import {
  calculateLaundryUsage,
  dateToLocalString,
  getMonthYear,
  isDateBiggerOrEqual,
} from '../../utils/util';
import Loader from '../../components/Loader';
import { useContext } from 'react';
import { ModalContext } from '../Admin/components/SimpleModal';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';

const monthYear = getMonthYear(new Date());

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(0.5),
    },
  },
  pageTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(4),
    color: '#1a202c',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(2),
      fontSize: '2rem',
    },
  },
  laundryIcon: {
    fontSize: '3rem !important',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  gridContainer: {
    gap: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(1.5),
    },
  },
  sectionCard: {
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    background: '#ffffff',
    height: 'fit-content',
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    padding: theme.spacing(2.5),
  },
  cardTitle: {
    fontWeight: 600,
    color: '#1a202c',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontSize: '1.25rem',
  },
  cardContent: {
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  reserveSection: {
    minHeight: '450px',
  },
  reservedNotice: {
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    color: 'white',
    borderRadius: theme.spacing(1.5),
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(5, 150, 105, 0.3)',
  },
  reservedTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    color: 'white',
  },
  reservedDate: {
    fontSize: '0.95rem',
    opacity: 0.9,
    marginBottom: theme.spacing(2),
    color: 'white',
  },
  buttonGroup: {
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: 'white',
    fontWeight: 500,
    padding: '10px 24px',
    borderRadius: theme.spacing(1),
    textTransform: 'none',
    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
      boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
    },
    '&:disabled': {
      background: '#e5e7eb',
      color: '#9ca3af',
      boxShadow: 'none',
    },
    transition: 'all 0.3s ease',
  },
  secondaryButton: {
    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    color: 'white',
    fontWeight: 500,
    padding: '10px 24px',
    borderRadius: theme.spacing(1),
    textTransform: 'none',
    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
      boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4)',
    },
    transition: 'all 0.3s ease',
  },
  outlineButton: {
    border: '2px solid #2563eb',
    color: '#2563eb',
    fontWeight: 500,
    padding: '10px 24px',
    borderRadius: theme.spacing(1),
    textTransform: 'none',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'rgba(37, 99, 235, 0.05)',
      borderColor: '#1d4ed8',
    },
    transition: 'all 0.3s ease',
  },
  inputContainer: {
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  inputField: {
    flex: 1,
    '& .MuiInputBase-root': {
      borderRadius: theme.spacing(1),
    },
    '& .MuiInputLabel-root': {
      color: '#6b7280',
    },
    '& .MuiInputBase-input': {
      padding: '16px 14px',
    },
  },
  usageContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: theme.spacing(1.5),
    padding: theme.spacing(2.5),
    border: '1px solid #e2e8f0',
  },
  usageTitle: {
    fontWeight: 600,
    color: '#1a202c',
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  usageItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 0),
    borderBottom: '1px solid #e5e7eb',
    '&:last-child': {
      borderBottom: 'none',
      fontWeight: 600,
      color: '#1a202c',
    },
  },
  usageLabel: {
    color: '#4b5563',
    fontSize: '0.9rem',
  },
  usageValue: {
    fontWeight: 500,
    color: '#1a202c',
  },
  totalValue: {
    fontWeight: 700,
    fontSize: '1.1rem',
    color: '#2563eb',
  },
  noUsageMessage: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    padding: theme.spacing(3, 0),
  },
  datePickerContainer: {
    '& .MuiPickersDay-root': {
      '&:hover': {
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
      },
    },
    '& .Mui-selected': {
      backgroundColor: '#2563eb !important',
      '&:hover': {
        backgroundColor: '#1d4ed8 !important',
      },
    },
  },
}));

const initialWashDry = { wash: 0, dry: 0 };

export default function Laundry({ userData }) {
  const handleModal = useContext(ModalContext);
  const [selectedDate, handleDateSelect] = useState();
  const [disabledDates, setDisabledDates] = useState([]);
  const [userReservations, setUserReservations] = useState();
  const [closestReservation, setClosestReservation] = useState();
  const [userMonthlyUsage, setUserMonthlyUsage] = useState();
  const [washDry, setWashDry] = useState({ ...initialWashDry });
  const [loading, setLoading] = useState(true);
  const classes = useStyles();

  const refresh = async () => {
    const reservedDates = await getReservedDates();
    setDisabledDates(reservedDates);
    const laundryUser = await getLaundryUser(userData.id);
    let closest;

    let userReserves = reservedDates.filter((r) => {
      return r.userId === userData.id;
    });
    userReserves = userReserves.map((r) => r.date);

    const usage = calculateLaundryUsage(laundryUser, monthYear);
    setUserMonthlyUsage(usage);

    if (!userReserves?.length) {
      setClosestReservation();
      setLoading(false);
    }
    userReserves = userReserves.sort();

    if (userReserves.length > 0) {
      closest = userReserves[0];
    }

    setClosestReservation(closest);
    setUserReservations(userReserves);

    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const reserve = async () => {
    handleModal(<Loader />, { hideExit: true });
    await reserveLaundryDay(userData.id, userData.name, selectedDate);
    setTimeout(() => {
      refresh();
      handleModal();
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
    handleModal(<Loader />, { hideExit: true });
    await deleteReservation(userData.id, userReservations, closestReservation);
    setTimeout(() => {
      refresh();
      handleModal();
    }, 500);
  };

  const handleWashDry = (e) => {
    setWashDry((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const onSaveLaundryUse = async () => {
    handleModal(<Loader />, { hideExit: true });
    await saveLaundryUse(washDry, userData.id, monthYear);
    setWashDry({ ...initialWashDry });
    setTimeout(() => {
      refresh();
      handleModal();
    }, 500);
  };

  if (loading) return <Loader />;

  return (
    <Box className={classes.root}>
      <Typography variant='h3' className={classes.pageTitle}>
        <LocalLaundryService className={classes.laundryIcon} />
        Lavandería
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid container spacing={3} className={classes.gridContainer}>
          {/* Reservation Section */}
          <Grid item xs={12} md={6} lg={4}>
            <Card className={classes.sectionCard}>
              <Box className={classes.cardHeader}>
                <Typography className={classes.cardTitle}>
                  <Event />
                  Reservar Turno
                </Typography>
              </Box>
              <CardContent className={classes.cardContent}>
                {closestReservation && (
                  <Box className={classes.reservedNotice}>
                    <Typography className={classes.reservedTitle}>
                      🎯 Próxima Reserva
                    </Typography>
                    <Typography className={classes.reservedDate}>
                      {new Date(closestReservation).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Typography>
                    <Box className={classes.buttonGroup}>
                      <Button
                        onClick={onDeleteReservation}
                        className={classes.secondaryButton}
                        startIcon={<Delete />}
                        size="small"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => addToCalendar(closestReservation)}
                        className={classes.outlineButton}
                        startIcon={<CalendarToday />}
                        size="small"
                      >
                        + Calendario
                      </Button>
                    </Box>
                  </Box>
                )}
                
                <Box className={classes.datePickerContainer}>
                  <DatePicker
                    label='Seleccionar fecha'
                    value={selectedDate}
                    onChange={handleDateSelect}
                    disablePast={true}
                    shouldDisableDate={(day) => {
                      const compareDate = dateToLocalString(day);
                      const isFree = disabledDates.every((disDate) => {
                        return (
                          dateToLocalString(new Date(disDate.date)) !== compareDate
                        );
                      });
                      return !isFree;
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: 'normal',
                        variant: 'outlined',
                      },
                    }}
                  />
                </Box>
                
                <Button
                  onClick={reserve}
                  disabled={!selectedDate}
                  className={classes.primaryButton}
                  startIcon={<Event />}
                  fullWidth
                >
                  Reservar Turno
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Usage Logging Section */}
          <Grid item xs={12} md={6} lg={4}>
            <Card className={classes.sectionCard}>
              <Box className={classes.cardHeader}>
                <Typography className={classes.cardTitle}>
                  <Assignment />
                  Registrar Uso
                </Typography>
              </Box>
              <CardContent className={classes.cardContent}>
                <Box className={classes.inputContainer}>
                  <TextField
                    className={classes.inputField}
                    variant='outlined'
                    type='number'
                    label='Lavadas'
                    value={washDry.wash}
                    name='wash'
                    onChange={handleWashDry}
                    inputProps={{ min: 0 }}
                  />
                  <TextField
                    className={classes.inputField}
                    variant='outlined'
                    type='number'
                    label='Secadas'
                    value={washDry.dry}
                    name='dry'
                    onChange={handleWashDry}
                    inputProps={{ min: 0 }}
                  />
                </Box>

                <Button
                  onClick={onSaveLaundryUse}
                  disabled={washDry.dry <= 0 && washDry.wash <= 0}
                  className={classes.primaryButton}
                  startIcon={<Save />}
                  fullWidth
                >
                  Guardar Uso
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Monthly Usage Statistics */}
          <Grid item xs={12} md={12} lg={4}>
            <Card className={classes.sectionCard}>
              <Box className={classes.cardHeader}>
                <Typography className={classes.cardTitle}>
                  <TrendingUp />
                  Uso Mensual - {format(new Date(), 'MMMM yyyy')}
                </Typography>
              </Box>
              <CardContent className={classes.cardContent}>
                {userMonthlyUsage ? (
                  <Box className={classes.usageContainer}>
                    <Box className={classes.usageItem}>
                      <Typography className={classes.usageLabel}>
                        Lavadas:
                      </Typography>
                      <Typography className={classes.usageValue}>
                        {userMonthlyUsage.wash} × S/{userMonthlyUsage.washTotal || 0}
                      </Typography>
                    </Box>
                    <Box className={classes.usageItem}>
                      <Typography className={classes.usageLabel}>
                        Secadas:
                      </Typography>
                      <Typography className={classes.usageValue}>
                        {userMonthlyUsage.dry} × S/{userMonthlyUsage.dryTotal || 0}
                      </Typography>
                    </Box>
                    <Divider style={{ margin: '12px 0' }} />
                    <Box className={classes.usageItem}>
                      <Typography className={classes.usageLabel}>
                        <strong>Total:</strong>
                      </Typography>
                      <Typography className={classes.totalValue}>
                        S/{userMonthlyUsage.total || 0}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography className={classes.noUsageMessage}>
                    📊 No hay uso registrado este mes
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </LocalizationProvider>
    </Box>
  );
}
