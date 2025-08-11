import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  makeStyles,
} from '@material-ui/core';
import {
  Assessment as AnalyticsIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Computer as ComputerIcon,
} from '@material-ui/icons';
import analytics from '../../utils/analytics';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },
  header: {
    marginBottom: theme.spacing(4),
  },
  title: {
    fontWeight: 600,
    color: "#1a202c",
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    color: "#718096",
    marginBottom: theme.spacing(3),
  },
  statsCard: {
    borderRadius: theme.spacing(2),
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: '1px solid #e2e8f0',
    height: '100%',
  },
  statsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  statsIcon: {
    backgroundColor: '#667eea',
    color: 'white',
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1),
    fontSize: '1.5rem',
  },
  statsValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: theme.spacing(0.5),
  },
  statsLabel: {
    color: '#718096',
    fontSize: '0.9rem',
  },
  tableCard: {
    borderRadius: theme.spacing(2),
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: '1px solid #e2e8f0',
    marginTop: theme.spacing(3),
  },
  tableContainer: {
    maxHeight: 400,
  },
  onlineStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#48bb78',
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#ed8936',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  formControl: {
    minWidth: 120,
    marginBottom: theme.spacing(2),
  },
}));

export default function Analytics() {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalActiveUsers: 0,
    uniquePlatforms: [],
    pageViews: {},
    recentActivity: [],
    totalEvents: 0
  });
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const analyticsData = await analytics.getUserStats();
      setStats(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastSeen = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 5) return 'Activo ahora';
    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    return `Hace ${diffDays} días`;
  };

  const getTopPages = () => {
    const pages = Object.entries(stats.pageViews)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    return pages;
  };

  const getPlatformsList = () => {
    return stats.uniquePlatforms || [];
  };

  if (loading) {
    return (
      <Box className={classes.root}>
        <Box className={classes.loadingContainer}>
          <CircularProgress size={50} />
        </Box>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      {/* Header */}
      <Box className={classes.header}>
        <Typography variant="h4" className={classes.title}>
          Analytics del Usuario
        </Typography>
        <Typography variant="subtitle1" className={classes.subtitle}>
          Monitoreo de actividad y uso de la aplicación
        </Typography>
        
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel>Período</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Período"
          >
            <MenuItem value={7}>Últimos 7 días</MenuItem>
            <MenuItem value={30}>Últimos 30 días</MenuItem>
            <MenuItem value={90}>Últimos 90 días</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statsCard}>
            <CardContent>
              <Box className={classes.statsHeader}>
                <PeopleIcon className={classes.statsIcon} />
                <Box>
                  <Typography className={classes.statsValue}>
                    {stats.totalActiveUsers}
                  </Typography>
                  <Typography className={classes.statsLabel}>
                    Usuarios Activos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statsCard}>
            <CardContent>
              <Box className={classes.statsHeader}>
                <VisibilityIcon className={classes.statsIcon} />
                <Box>
                  <Typography className={classes.statsValue}>
                    {Object.values(stats.pageViews).reduce((a, b) => a + b, 0)}
                  </Typography>
                  <Typography className={classes.statsLabel}>
                    Vistas de Página
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statsCard}>
            <CardContent>
              <Box className={classes.statsHeader}>
                <ScheduleIcon className={classes.statsIcon} />
                <Box>
                  <Typography className={classes.statsValue}>
                    {stats.totalEvents}
                  </Typography>
                  <Typography className={classes.statsLabel}>
                    Total Eventos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statsCard}>
            <CardContent>
              <Box className={classes.statsHeader}>
                <ComputerIcon className={classes.statsIcon} />
                <Box>
                  <Typography className={classes.statsValue}>
                    {stats.uniquePlatforms.length}
                  </Typography>
                  <Typography className={classes.statsLabel}>
                    Plataformas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity Table */}
      <Card className={classes.tableCard}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Actividad Reciente de Usuarios
          </Typography>
          <TableContainer component={Paper} className={classes.tableContainer}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Última Actividad</TableCell>
                  <TableCell>Plataforma</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.recentActivity.map((activity) => (
                  <TableRow key={activity.userId}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" style={{ fontWeight: 500 }}>
                          {activity.userName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {activity.userEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box className={classes.onlineStatus}>
                        <Box 
                          className={
                            formatLastSeen(activity.lastActive) === 'Activo ahora' 
                              ? classes.onlineDot 
                              : classes.offlineDot
                          } 
                        />
                        <Typography variant="body2">
                          {formatLastSeen(activity.lastActive) === 'Activo ahora' 
                            ? 'En línea' 
                            : 'Desconectado'
                          }
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatLastSeen(activity.lastActive)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={activity.platform || 'Desconocido'} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {stats.recentActivity.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="textSecondary">
                        No hay actividad reciente
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <Grid container spacing={3} style={{ marginTop: 16 }}>
        <Grid item xs={12} md={6}>
          <Card className={classes.tableCard}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Páginas Más Visitadas
              </Typography>
              {getTopPages().map(([page, views], index) => (
                <Box key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Typography variant="body2">{page}</Typography>
                  <Chip label={views} size="small" />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className={classes.tableCard}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Plataformas Detectadas
              </Typography>
              {getPlatformsList().map((platform, index) => (
                <Box key={index} style={{ marginBottom: 8 }}>
                  <Chip 
                    label={platform} 
                    size="small" 
                    variant="outlined"
                    style={{ marginRight: 8 }}
                  />
                </Box>
              ))}
              {getPlatformsList().length === 0 && (
                <Typography variant="body2" color="textSecondary">
                  No hay plataformas detectadas
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}