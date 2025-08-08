import React, { useMemo } from 'react';
import {
  Line,
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  makeStyles,
} from '@material-ui/core';
import {
  Opacity as WaterIcon,
  FlashOn as ElectricityIcon,
  TrendingUp as TrendingUpIcon,
} from '@material-ui/icons';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const useStyles = makeStyles((theme) => ({
  chartCard: {
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    marginBottom: theme.spacing(3),
  },
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderBottom: '1px solid #e2e8f0',
  },
  chartIcon: {
    marginRight: theme.spacing(1),
    color: '#667eea',
    fontSize: '1.5rem',
  },
  chartTitle: {
    fontWeight: 600,
    color: '#1a202c',
    fontSize: '1.25rem',
  },
  summaryContainer: {
    marginBottom: theme.spacing(3),
  },
  summaryItem: {
    textAlign: 'center',
    padding: theme.spacing(1),
  },
  summaryValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: theme.spacing(0.5),
  },
  summaryLabel: {
    fontSize: '0.875rem',
    color: '#718096',
    fontWeight: 500,
  },
  waterSummary: {
    color: '#3182ce',
  },
  electricitySummary: {
    color: '#f6ad55',
  },
  totalSummary: {
    color: '#667eea',
  },
  chartContainer: {
    position: 'relative',
    height: '400px',
    [theme.breakpoints.down('sm')]: {
      height: '300px',
    },
  },
  noDataMessage: {
    textAlign: 'center',
    color: '#718096',
    padding: theme.spacing(4),
    fontSize: '1rem',
  },
}));

export default function UtilityUsageChart({ monthlyReports = [] }) {
  const classes = useStyles();

  // Process and aggregate the data
  const chartData = useMemo(() => {
    if (!monthlyReports || monthlyReports.length === 0) {
      return null;
    }

    // Sort reports by date (oldest first for proper chart display)
    const sortedReports = [...monthlyReports].sort((a, b) => {
      const [monthA, yearA] = a.id.split('_');
      const [monthB, yearB] = b.id.split('_');
      const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1);
      const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1);
      return dateA.getTime() - dateB.getTime();
    });

    // Take last 12 months or all available data
    const recentReports = sortedReports.slice(-12);

    const labels = recentReports.map(report => {
      const [month, year] = report.id.split('_');
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    });

    const waterData = recentReports.map(report => parseFloat(report.water) || 0);
    const electricityData = recentReports.map(report => parseFloat(report.electricity) || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Agua (S/.)',
          data: waterData,
          borderColor: '#3182ce',
          backgroundColor: 'rgba(49, 130, 206, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3182ce',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
        {
          label: 'Electricidad (S/.)',
          data: electricityData,
          borderColor: '#f6ad55',
          backgroundColor: 'rgba(246, 173, 85, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#f6ad55',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };
  }, [monthlyReports]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!chartData) return null;

    const waterData = chartData.datasets[0].data;
    const electricityData = chartData.datasets[1].data;

    const totalWater = waterData.reduce((sum, val) => sum + val, 0);
    const totalElectricity = electricityData.reduce((sum, val) => sum + val, 0);
    const avgWater = waterData.length > 0 ? totalWater / waterData.length : 0;
    const avgElectricity = electricityData.length > 0 ? totalElectricity / electricityData.length : 0;

    // Get latest month's data
    const latestWater = waterData[waterData.length - 1] || 0;
    const latestElectricity = electricityData[electricityData.length - 1] || 0;

    return {
      totalWater,
      totalElectricity,
      avgWater,
      avgElectricity,
      latestWater,
      latestElectricity,
      grandTotal: totalWater + totalElectricity,
      latestTotal: latestWater + latestElectricity,
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
            size: 14,
            weight: '500',
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(102, 126, 234, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: S/. ${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.06)',
        },
        ticks: {
          color: '#718096',
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.06)',
        },
        ticks: {
          color: '#718096',
          font: {
            size: 12,
          },
          callback: function(value) {
            return `S/. ${value}`;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  if (!chartData) {
    return (
      <Card className={classes.chartCard}>
        <CardContent>
          <Box className={classes.chartHeader}>
            <TrendingUpIcon className={classes.chartIcon} />
            <Typography className={classes.chartTitle}>
              Consumo de Servicios Básicos
            </Typography>
          </Box>
          <Typography className={classes.noDataMessage}>
            No hay datos disponibles para mostrar el gráfico de consumo.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={classes.chartCard}>
      <CardContent>
        <Box className={classes.chartHeader}>
          <TrendingUpIcon className={classes.chartIcon} />
          <Typography className={classes.chartTitle}>
            Consumo de Servicios Básicos (Últimos 12 meses)
          </Typography>
        </Box>

        {/* Summary Statistics */}
        {summaryStats && (
          <Grid container spacing={2} className={classes.summaryContainer}>
            <Grid item xs={12} sm={4}>
              <Box className={classes.summaryItem}>
                <Box className={`${classes.summaryValue} ${classes.waterSummary}`}>
                  <WaterIcon style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  S/. {summaryStats.latestWater.toFixed(2)}
                </Box>
                <Typography className={classes.summaryLabel}>
                  Agua (Último mes)
                </Typography>
                <Chip
                  size="small"
                  label={`Promedio: S/. ${summaryStats.avgWater.toFixed(2)}`}
                  style={{ backgroundColor: '#e0f2fe', color: '#01579b', fontSize: '0.75rem' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box className={classes.summaryItem}>
                <Box className={`${classes.summaryValue} ${classes.electricitySummary}`}>
                  <ElectricityIcon style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  S/. {summaryStats.latestElectricity.toFixed(2)}
                </Box>
                <Typography className={classes.summaryLabel}>
                  Electricidad (Último mes)
                </Typography>
                <Chip
                  size="small"
                  label={`Promedio: S/. ${summaryStats.avgElectricity.toFixed(2)}`}
                  style={{ backgroundColor: '#fff3e0', color: '#ef6c00', fontSize: '0.75rem' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box className={classes.summaryItem}>
                <Box className={`${classes.summaryValue} ${classes.totalSummary}`}>
                  S/. {summaryStats.latestTotal.toFixed(2)}
                </Box>
                <Typography className={classes.summaryLabel}>
                  Total (Último mes)
                </Typography>
                <Chip
                  size="small"
                  label={`Total período: S/. ${summaryStats.grandTotal.toFixed(2)}`}
                  style={{ backgroundColor: '#f3e5f5', color: '#4a148c', fontSize: '0.75rem' }}
                />
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Chart */}
        <Box className={classes.chartContainer}>
          <Line data={chartData} options={chartOptions} />
        </Box>
      </CardContent>
    </Card>
  );
}