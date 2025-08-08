import React, { useState } from "react";
import { useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  makeStyles,
  Paper,
} from "@material-ui/core";
import {
  Receipt as ReceiptIcon,
  Email as EmailIcon,
  Delete as DeleteIcon,
  NotificationsActive as ReminderIcon,
} from "@material-ui/icons";
import { getAllRecieptsMonths } from "../../utils/dbRequests";

import DeleteRecieptMonth from "./DeleteRecieptMonth";
import GenerateReciepts from "./GenerateReciepts";
import SendRecieptsEmail from "./SendRecieptsEmail";
import SendReminderEmail from "./SendReminderEmail";

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
    marginBottom: theme.spacing(4),
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
  sectionTitle: {
    fontWeight: 600,
    color: '#2d3748',
    marginBottom: theme.spacing(2),
    fontSize: '1.25rem',
  },
  primarySection: {
    marginBottom: theme.spacing(4),
  },
  managementSection: {
    marginTop: theme.spacing(2),
  },
  primaryCard: {
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '2px solid #e6fffa',
    },
  },
  managementCard: {
    borderRadius: theme.spacing(2),
    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    border: '1px solid #e2e8f0',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #cbd5e0',
    },
  },
}));

export default function Recibos({
  apartments,
  users,
  refresh,
  services,
  storage,
}) {
  const classes = useStyles();
  const [recieptsMonths, setRecieptsMonths] = useState([]);

  const refreshMonths = () => {
    getAllRecieptsMonths().then(setRecieptsMonths);
  };

  const refreshAll = () => {
    refresh();
    getAllRecieptsMonths().then(setRecieptsMonths);
  };

  useEffect(() => {
    refreshMonths();
  }, []);

  return (
    <Box className={classes.root}>
      {/* Header Section */}
      <Box className={classes.header}>
        <Typography variant="h4" className={classes.title}>
          Gestión de Recibos
        </Typography>
        <Typography variant="subtitle1" className={classes.subtitle}>
          Genera, administra y envía recibos a los residentes del edificio
        </Typography>
      </Box>

      {/* Stats Card */}
      <Card className={classes.statsCard}>
        <Box className={classes.statsContent}>
          <ReceiptIcon className={classes.statsIcon} />
          <Box className={classes.statsText}>
            <Typography className={classes.statsValue}>
              {recieptsMonths.length}
            </Typography>
            <Typography className={classes.statsLabel}>
              Períodos de Recibos Generados
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Primary Operations Section */}
      <Box className={classes.primarySection}>
        <Typography className={classes.sectionTitle}>
          Operaciones Principales
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Paper className={classes.primaryCard}>
              <GenerateReciepts
                users={users}
                services={services}
                storage={storage}
                apartments={apartments}
                refresh={refreshAll}
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12} lg={6}>
            <Paper className={classes.primaryCard}>
              <SendRecieptsEmail
                users={users}
                recieptsMonths={recieptsMonths}
                apartments={apartments}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Management Operations Section */}
      <Box className={classes.managementSection}>
        <Typography className={classes.sectionTitle}>
          Gestión y Mantenimiento
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper className={classes.managementCard}>
              <SendReminderEmail
                users={users}
                recieptsMonths={recieptsMonths}
                apartments={apartments}
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper className={classes.managementCard}>
              <DeleteRecieptMonth
                refreshMonths={refreshMonths}
                recieptsMonths={recieptsMonths}
                refreshAll={refresh}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
