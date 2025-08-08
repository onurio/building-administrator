import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  Box,
  makeStyles,
} from "@material-ui/core";
import {
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from "@material-ui/icons";
import React, { useState, useContext } from "react";
import Loader from "../../components/Loader";
import { deleteAllRecieptsFromMonth } from "../../utils/dbRequests";
import DeleteModal from "./components/DeleteModal";
import { ModalContext } from "./components/SimpleModal";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
    minHeight: '300px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  headerIcon: {
    marginRight: theme.spacing(1),
    color: '#e53e3e',
    fontSize: '1.5rem',
  },
  title: {
    fontWeight: 600,
    color: '#2d3748',
    margin: 0,
  },
  description: {
    color: '#718096',
    marginBottom: theme.spacing(3),
    fontSize: '0.875rem',
  },
  warningBox: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    backgroundColor: '#fed7d7',
    borderLeft: '4px solid #e53e3e',
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
  warningIcon: {
    marginRight: theme.spacing(1),
    color: '#e53e3e',
  },
  warningText: {
    color: '#742a2a',
    fontSize: '0.875rem',
  },
  formControl: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  deleteButton: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5, 4),
    fontWeight: 600,
    backgroundColor: '#e53e3e',
    '&:hover': {
      backgroundColor: '#c53030',
    },
  },
}));

export default function EliminarRecibosMes({
  refreshAll,
  recieptsMonths,
  refreshMonths,
}) {
  const classes = useStyles();
  const [selectedMonth, setSelectedMonth] = useState('');
  const handleModal = useContext(ModalContext);

  const onDelete = () => {
    const onSave = async () => {
      handleModal(<Loader />, { hideExit: true });
      await deleteAllRecieptsFromMonth(selectedMonth);
      setTimeout(() => {
        refreshMonths();
        refreshAll();
        handleModal();
      }, 500);
    };
    handleModal(<DeleteModal onCancel={() => handleModal()} onSave={onSave} />);
  };

  if (!recieptsMonths || recieptsMonths?.length === 0) {
    return (
      <Box className={classes.container}>
        <Box className={classes.header}>
          <DeleteIcon className={classes.headerIcon} />
          <Typography variant="h5" className={classes.title}>
            Eliminar Recibos por Mes
          </Typography>
        </Box>
        <Typography color="textSecondary">
          No hay períodos de recibos disponibles para eliminar.
        </Typography>
      </Box>
    );
  }

  const isFormValid = selectedMonth !== '';

  return (
    <Box className={classes.container}>
      <Box className={classes.header}>
        <DeleteIcon className={classes.headerIcon} />
        <Typography variant="h5" className={classes.title}>
          Eliminar Recibos por Mes
        </Typography>
      </Box>
      
      <Typography className={classes.description}>
        Elimina permanentemente todos los recibos de un mes específico.
      </Typography>
      
      <Box className={classes.warningBox}>
        <WarningIcon className={classes.warningIcon} />
        <Typography className={classes.warningText}>
          Esta acción es irreversible. Todos los recibos del mes seleccionado serán eliminados permanentemente.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl className={classes.formControl}>
            <InputLabel id="months-label">Seleccionar Mes</InputLabel>
            <Select
              labelId="months-label"
              id="months-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              variant="outlined"
            >
              {recieptsMonths
                .sort((a, b) => {
                  const [monthA, yearA] = a.split('_');
                  const [monthB, yearB] = b.split('_');
                  const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1);
                  const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1);
                  return dateB.getTime() - dateA.getTime();
                })
                .map((option) => (
                  <MenuItem key={option} value={option}>
                    {option.replace('_', '/')}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <Button
            disabled={!isFormValid}
            onClick={onDelete}
            variant="contained"
            size="large"
            className={classes.deleteButton}
            fullWidth
            startIcon={<DeleteIcon />}
          >
            Eliminar Todos los Recibos del Mes
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
