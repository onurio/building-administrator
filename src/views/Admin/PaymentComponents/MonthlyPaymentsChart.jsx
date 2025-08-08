import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  makeStyles,
  Box,
} from '@material-ui/core';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency, safeNumber } from './utils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

const useStyles = makeStyles((theme) => ({
  chartCard: {
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  chartContainer: {
    height: 400,
    position: 'relative',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#1a202c',
    marginBottom: theme.spacing(2),
  },
  subtitle: {
    color: '#718096',
    marginBottom: theme.spacing(3),
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
    paddingTop: theme.spacing(2),
  },
  statItem: {
    textAlign: 'center',
  },
  statValue: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#718096',
  },
}));

export default function MonthlyPaymentsChart({ users, payments = [] }) {
  const classes = useStyles();

  const chartData = useMemo(() => {
    if (!users || !Array.isArray(users)) {
      return { labels: [], datasets: [] };
    }

    // Create a map to store monthly totals
    const monthlyData = new Map();

    // Process all users and their receipts to get expected amounts
    users.forEach(user => {
      if (!user.reciepts || !Array.isArray(user.reciepts)) return;

      user.reciepts.forEach(receipt => {
        if (!receipt.name || !receipt.total) return;

        // Parse month from receipt name (format: MM_YYYY)
        const [month, year] = receipt.name.split('_');
        if (!month || !year) return;

        const monthKey = `${month}/${year}`;
        const receiptDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const receiptTotal = safeNumber(receipt.total);

        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            date: receiptDate,
            totalExpected: 0,
            totalPaid: 0,
            receiptCount: 0,
          });
        }

        const monthData = monthlyData.get(monthKey);
        monthData.totalExpected += receiptTotal;
        monthData.receiptCount += 1;
      });
    });

    // Process actual payments to get paid amounts
    if (Array.isArray(payments)) {
      payments.forEach(payment => {
        if (!payment.monthYear || !payment.amountPaid) return;

        const monthKey = payment.monthYear.replace('_', '/');
        
        if (monthlyData.has(monthKey)) {
          monthlyData.get(monthKey).totalPaid += safeNumber(payment.amountPaid);
        }
      });
    }

    // Sort by date and create chart data
    const sortedEntries = Array.from(monthlyData.entries())
      .sort(([, a], [, b]) => a.date - b.date)
      .slice(-12); // Show last 12 months

    const labels = sortedEntries.map(([monthKey, data]) =>
      format(data.date, 'MMM yyyy', { locale: es })
    );

    const expectedData = sortedEntries.map(([, data]) => data.totalExpected);
    const paidData = sortedEntries.map(([, data]) => data.totalPaid);

    return {
      labels,
      datasets: [
        {
          label: 'Total Esperado',
          data: expectedData,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          borderRadius: 4,
        },
        {
          label: 'Total Pagado',
          data: paidData,
          backgroundColor: 'rgba(34, 197, 94, 0.6)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          borderRadius: 4,
        },
      ],
    };
  }, [users, payments]);

  const chartStats = useMemo(() => {
    if (!chartData.datasets[0] || !chartData.labels) return { totalExpected: 0, totalPaid: 0, pendingAmount: 0 };

    const currentYear = new Date().getFullYear();
    
    // Filter data for current year only
    let yearlyExpected = 0;
    let yearlyPaid = 0;
    
    chartData.labels.forEach((label, index) => {
      // Extract year from label (format: "MMM yyyy")
      const labelYear = parseInt(label.split(' ')[1]);
      if (labelYear === currentYear) {
        yearlyExpected += chartData.datasets[0].data[index] || 0;
        yearlyPaid += chartData.datasets[1].data[index] || 0;
      }
    });

    const pendingAmount = yearlyExpected - yearlyPaid;

    return { 
      totalExpected: yearlyExpected, 
      totalPaid: yearlyPaid, 
      pendingAmount 
    };
  }, [chartData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function(value) {
            return formatCurrency(value);
          },
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <Card className={classes.chartCard}>
      <CardContent>
        <Typography className={classes.title}>
          Ingresos Mensuales Esperados vs Recaudados
        </Typography>
        <Typography className={classes.subtitle}>
          Comparación de ingresos esperados y recaudados por mes (últimos 12 meses)
        </Typography>
        
        <Box className={classes.chartContainer}>
          <Bar data={chartData} options={chartOptions} />
        </Box>

        <Box className={classes.statsRow}>
          <Box className={classes.statItem}>
            <Typography className={classes.statValue}>
              {formatCurrency(chartStats.totalExpected)}
            </Typography>
            <Typography className={classes.statLabel}>
              Total Esperado (este año)
            </Typography>
          </Box>
          <Box className={classes.statItem}>
            <Typography className={classes.statValue} style={{ color: '#22c55e' }}>
              {formatCurrency(chartStats.totalPaid)}
            </Typography>
            <Typography className={classes.statLabel}>
              Total Recaudado (este año)
            </Typography>
          </Box>
          <Box className={classes.statItem}>
            <Typography className={classes.statValue} style={{ color: '#ef4444' }}>
              {formatCurrency(chartStats.pendingAmount)}
            </Typography>
            <Typography className={classes.statLabel}>
              Pendiente (este año)
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}