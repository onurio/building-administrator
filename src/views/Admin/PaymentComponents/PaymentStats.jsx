import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  makeStyles,
} from '@material-ui/core';
import {
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  TrendingDown as DebtIcon,
} from '@material-ui/icons';
import { formatCurrency } from './utils';

const useStyles = makeStyles((theme) => ({
  statCard: {
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1)',
    },
  },
  statCardContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statIcon: {
    fontSize: '2.5rem',
    opacity: 0.8,
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    marginBottom: theme.spacing(0.5),
  },
  statLabel: {
    color: '#718096',
    fontSize: '0.875rem',
  },
  statsContainer: {
    marginBottom: theme.spacing(3),
  },
}));

export default function PaymentStats({ stats }) {
  const classes = useStyles();

  return (
    <Grid container spacing={3} className={classes.statsContainer}>
      <Grid item xs={12} md={4}>
        <Card className={classes.statCard}>
          <CardContent className={classes.statCardContent}>
            <Box>
              <Typography className={classes.statValue}>
                {formatCurrency(stats.totalCollected)}
              </Typography>
              <Typography className={classes.statLabel}>
                Total Recaudado (este año)
              </Typography>
            </Box>
            <MoneyIcon className={classes.statIcon} style={{ color: '#48bb78' }} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card className={classes.statCard}>
          <CardContent className={classes.statCardContent}>
            <Box>
              <Typography className={classes.statValue}>
                {stats.pendingPayments}
              </Typography>
              <Typography className={classes.statLabel}>
                Pagos Pendientes
              </Typography>
            </Box>
            <WarningIcon className={classes.statIcon} style={{ color: '#f6ad55' }} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card className={classes.statCard}>
          <CardContent className={classes.statCardContent}>
            <Box>
              <Typography className={classes.statValue}>
                {formatCurrency(stats.totalDebt)}
              </Typography>
              <Typography className={classes.statLabel}>
                Deuda Total
              </Typography>
            </Box>
            <DebtIcon className={classes.statIcon} style={{ color: '#fc8181' }} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}