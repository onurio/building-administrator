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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
} from "@material-ui/core";
import {
  LocalLaundryService as LaundryIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@material-ui/icons";
import format from "date-fns/format";
import React, { useState } from "react";
import { useEffect } from "react";
import Loader from "../../components/Loader";
import { 
  getLaundry, 
  adminDeleteReservation, 
  adminAddReservation, 
  adminEditLaundryUsage, 
  adminDeleteLaundryUsage 
} from "../../utils/dbRequests";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'reservation', 'usage'
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const refreshLaundry = async () => {
    const updatedLaundry = await getLaundry(users);
    setLaundry(updatedLaundry);
  };

  useEffect(() => {
    getLaundry(users).then(setLaundry);
  }, []);

  const handleDeleteReservation = async (reservation) => {
    if (window.confirm(`¿Eliminar reserva del ${format(new Date(reservation.date), "dd MMM yyyy, HH:mm")}?`)) {
      await adminDeleteReservation(reservation.date, monthYear);
      refreshLaundry();
    }
  };

  const handleDeleteUsage = async (usage, index) => {
    if (window.confirm(`¿Eliminar uso de ${usage.name}?`)) {
      const user = users.find(u => u.name === usage.name);
      if (user) {
        await adminDeleteLaundryUsage(user.id, monthYear, index);
        refreshLaundry();
      }
    }
  };

  const openDialog = (type, item = null) => {
    setDialogType(type);
    setEditingItem(item);
    
    if (type === 'reservation') {
      setFormData({
        userId: item?.userId || '',
        userName: item?.userName || '',
        date: item?.date ? format(new Date(item.date), "yyyy-MM-dd'T'HH:mm") : '',
      });
    } else if (type === 'usage') {
      setFormData({
        userId: item?.userId || '',
        wash: item?.wash || 0,
        dry: item?.dry || 0,
      });
    }
    
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogType('');
    setEditingItem(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      if (dialogType === 'reservation') {
        const selectedUser = users.find(u => u.id === formData.userId);
        await adminAddReservation(formData.userId, selectedUser?.name || '', new Date(formData.date));
      } else if (dialogType === 'usage') {
        await adminEditLaundryUsage(
          formData.userId,
          monthYear,
          { wash: parseInt(formData.wash), dry: parseInt(formData.dry) },
          editingItem?.index
        );
      }
      
      closeDialog();
      refreshLaundry();
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  if (!laundry) return <Loader />;

  const columns = [
    {
      field: "name",
      headerName: "Usuario",
      width: 180,
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
      width: 160,
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
      width: 280,
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 100,
      renderCell: (params) => (
        <Box>
          {params.row.type === 'Use register' && (
            <IconButton
              size="small"
              onClick={() => handleDeleteUsage(params.row, params.row.index)}
              title="Eliminar uso"
            >
              <DeleteIcon style={{ color: '#e53e3e' }} />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  const reservationColumns = [
    {
      field: "userName",
      headerName: "Usuario",
      width: 180,
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
      width: 200,
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={format(new Date(params.value), "dd MMM yyyy, HH:mm")}
          size="small"
          style={{ backgroundColor: '#dcfce7', color: '#166534' }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 100,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleDeleteReservation(params.row)}
            title="Eliminar reserva"
          >
            <DeleteIcon style={{ color: '#e53e3e' }} />
          </IconButton>
        </Box>
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
          <Box display="flex" alignItems="center" gap={2}>
            <Typography className={classes.sectionTitle}>
              <ScheduleIcon className={classes.sectionIcon} />
              Historial de Uso
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => openDialog('usage')}
              size="small"
            >
              Añadir Uso
            </Button>
          </Box>
          
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
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography className={classes.sectionTitle}>
              <CalendarIcon className={classes.sectionIcon} />
              Reservas Activas
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => openDialog('reservation')}
              size="small"
            >
              Añadir Reserva
            </Button>
          </Box>
        </CardContent>
        <DataTable columns={reservationColumns} rows={reservationsRows} />
      </Card>

      {/* Admin Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'reservation' 
            ? (editingItem ? 'Editar Reserva' : 'Añadir Reserva')
            : (editingItem ? 'Editar Uso' : 'Añadir Uso')
          }
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} style={{ paddingTop: 10 }}>
            {dialogType === 'reservation' && (
              <>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Usuario</InputLabel>
                    <Select
                      value={formData.userId || ''}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    >
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Fecha y Hora"
                    type="datetime-local"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
            
            {dialogType === 'usage' && (
              <>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Usuario</InputLabel>
                    <Select
                      value={formData.userId || ''}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    >
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Lavadas"
                    type="number"
                    value={formData.wash || 0}
                    onChange={(e) => setFormData({ ...formData, wash: e.target.value })}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Secadas"
                    type="number"
                    value={formData.dry || 0}
                    onChange={(e) => setFormData({ ...formData, dry: e.target.value })}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="default">
            Cancelar
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
