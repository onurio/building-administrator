import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  makeStyles,
} from "@material-ui/core";
import {
  LocalLaundryService as LaundryIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
} from "@material-ui/icons";
import format from "date-fns/format";
import React, { useState } from "react";
import { useEffect } from "react";
import Loader from "../../components/Loader";
import { getLaundry } from "../../utils/dbRequests";
import { getMonthYear } from "../../utils/util";
import DataTable from "./components/DataTable";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  header: {
    marginBottom: theme.spacing(4),
  },
  title: {
    fontWeight: 600,
    color: '#1a202c',
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    color: '#718096',
    marginBottom: theme.spacing(3),
  },
  statsCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  statsContent: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      textAlign: 'center',
    },
  },
  statsIcon: {
    fontSize: '3rem',
    marginRight: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      marginRight: 0,
      marginBottom: theme.spacing(1),
    },
  },
  statsText: {
    flex: 1,
  },
  statsValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white',
  },
  statsLabel: {
    fontSize: '1rem',
    opacity: 0.9,
    color: 'white',
  },
  controlsCard: {
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  controlsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      gap: theme.spacing(2),
      alignItems: 'stretch',
    },
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    fontWeight: 600,
    color: '#1a202c',
    fontSize: '1.25rem',
  },
  sectionIcon: {
    marginRight: theme.spacing(1),
    color: '#667eea',
  },
  dataTableCard: {
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    marginBottom: theme.spacing(3),
  },
  monthSelector: {
    minWidth: '200px',
    '& .MuiOutlinedInput-root': {
      borderRadius: theme.spacing(1),
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#667eea',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#667eea',
      },
    },
    '& .MuiInputLabel-outlined': {
      color: '#718096',
      '&.Mui-focused': {
        color: '#667eea',
      },
    },
  },
}));

export default function LaundryUseView({ users }) {
  const classes = useStyles();
  const [monthYear, setMonthYear] = useState(getMonthYear(new Date()));
  const [laundry, setLaundry] = useState();

  useEffect(() => {
    getLaundry(users).then(setLaundry);
  }, []);

  if (!laundry) return <Loader />;

  const columns = [
    {
      field: "name",
      headerName: "Usuario",
      width: 200,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <PersonIcon style={{ marginRight: 8, color: '#667eea' }} />
          {params.value}
        </Box>
      ),
    },
    {
      field: "date",
      headerName: "Fecha y Hora",
      width: 180,
      renderCell: (params) => (
        <Chip
          label={format(new Date(params.value), "dd MMM yyyy, HH:mm")}
          size="small"
          style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}
        />
      ),
    },
    {
      field: "type",
      headerName: "Tipo",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'reserved' ? 'primary' : 'default'}
        />
      ),
    },
    {
      field: "message",
      headerName: "Mensaje",
      width: 350,
      flex: 1,
    },
  ];

  const reservationColumns = [
    {
      field: "userName",
      headerName: "Usuario",
      width: 200,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <PersonIcon style={{ marginRight: 8, color: '#667eea' }} />
          {params.value}
        </Box>
      ),
    },
    {
      field: "date",
      headerName: "Fecha Reservada",
      width: 250,
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={format(new Date(params.value), "dd MMM yyyy, HH:mm")}
          size="small"
          style={{ backgroundColor: '#dcfce7', color: '#166534' }}
        />
      ),
    },
  ];

  let reservationsRows = [];
  let totalUsage = 0;
  let currentMonthUsage = 0;

  if (laundry.calendar[monthYear]) {
    reservationsRows = laundry.calendar[monthYear].map((res, index) => ({
      ...res,
      id: index,
    }));
  }

  // Calculate usage statistics
  Object.keys(laundry.log).forEach(month => {
    if (laundry.log[month]) {
      totalUsage += laundry.log[month].length;
      if (month === monthYear) {
        currentMonthUsage = laundry.log[month].length;
      }
    }
  });

  return (
    <Box className={classes.root}>
      {/* Header Section */}
      <Box className={classes.header}>
        <Typography variant="h4" className={classes.title}>
          Gestión de Lavandería
        </Typography>
        <Typography variant="subtitle1" className={classes.subtitle}>
          Monitorea el uso y reservas de la lavandería del edificio
        </Typography>
      </Box>

      {/* Stats Card */}
      <Card className={classes.statsCard}>
        <Box className={classes.statsContent}>
          <LaundryIcon className={classes.statsIcon} />
          <Box className={classes.statsText}>
            <Typography className={classes.statsValue}>
              {currentMonthUsage}
            </Typography>
            <Typography className={classes.statsLabel}>
              Usos en {monthYear} • {totalUsage} Total
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Controls Card */}
      <Card className={classes.controlsCard}>
        <Box className={classes.controlsContainer}>
          <Typography className={classes.sectionTitle}>
            <ScheduleIcon className={classes.sectionIcon} />
            Historial de Uso
          </Typography>
          
          <FormControl className={classes.monthSelector}>
            <InputLabel id="monthYear-label">Mes - Año</InputLabel>
            <Select
              labelId="monthYear-label"
              id="monthYear"
              onChange={(e) => {
                setMonthYear(e.target.value);
              }}
              variant="outlined"
              value={monthYear}
            >
              {Object.keys(laundry.log)
                .sort((a, b) => {
                  const [monthA, yearA] = a.split('_');
                  const [monthB, yearB] = b.split('_');
                  const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1);
                  const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1);
                  return dateB.getTime() - dateA.getTime(); // Newest first
                })
                .map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Usage History Table */}
      <Card className={classes.dataTableCard}>
        <DataTable columns={columns} rows={laundry.log[monthYear] || []} />
      </Card>

      {/* Active Reservations Table */}
      <Card className={classes.dataTableCard}>
        <CardContent>
          <Typography className={classes.sectionTitle}>
            <CalendarIcon className={classes.sectionIcon} />
            Reservas Activas
          </Typography>
        </CardContent>
        <DataTable columns={reservationColumns} rows={reservationsRows} />
      </Card>
    </Box>
  );
}
