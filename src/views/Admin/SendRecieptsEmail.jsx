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
  Chip,
  makeStyles,
} from "@material-ui/core";
import {
  Email as EmailIcon,
  Send as SendIcon,
} from "@material-ui/icons";
import React, { useState, useContext } from "react";
import { customAlert, sendEmail } from "../../utils/dbRequests";
import SelectFromList from "./components/SelectFromList";
import { ModalContext } from "./components/SimpleModal";
import PromptModal from "./components/PromptModal";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
    minHeight: '400px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  headerIcon: {
    marginRight: theme.spacing(1),
    color: '#38b2ac',
    fontSize: '1.5rem',
  },
  title: {
    fontWeight: 600,
    color: '#2d3748',
    margin: 0,
  },
  formControl: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  selectionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  selectionInfo: {
    color: '#718096',
    fontSize: '0.875rem',
  },
  sendButton: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(1.5, 4),
    fontWeight: 600,
  },
}));

export default function EnviarRecibosEmail({
  recieptsMonths,
  apartments,
  users,
}) {
  const classes = useStyles();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedApts, setSelectedApts] = useState(
    apartments.map((apt) => apt.name)
  );
  const handleModal = useContext(ModalContext);

  const getRecieptsFromApartments = () => {
    const filteredApts = apartments.filter(
      (apt) => selectedApts.find((sApt) => sApt === apt.name) !== undefined
    );

    const tenantIds = filteredApts.map((apt) => apt.tenant.id);
    const filteredUsers = users.filter(
      (usr) => usr.id === tenantIds.find((id) => id === usr.id)
    );

    const emailsToSend = [];

    filteredUsers.forEach((usr) => {
      // usr.reciepts
      const recieptToSend = usr.reciepts.find(
        (reciept) => reciept.name === selectedMonth
      );
      if (recieptToSend) {
        emailsToSend.push({ userInfo: { ...usr }, reciept: recieptToSend });
      }
    });

    return emailsToSend;
  };

  const sendEmails = () => {
    const emailsToSend = getRecieptsFromApartments();

    const onSave = async () => {
      emailsToSend.map(async (info) => sendEmail(info));
      const responses = await Promise.all(emailsToSend);
      console.log(responses);
      customAlert(true, "Emails enviados exitosamente");
      handleModal();
    };

    handleModal(
      <PromptModal
        onSave={onSave}
        onCancel={handleModal}
        actionTitle="ENVIAR"
        title={`¿Estás seguro de que quieres enviar ${emailsToSend.length} emails?`}
      />
    );
  };

  const openSelectApts = () => {
    handleModal(
      <div style={{ width: 500 }}>
        <SelectFromList
          label="Seleccionar Apartamentos"
          onSave={(apts) => {
            setSelectedApts(apts);
            handleModal();
          }}
          list={apartments.map((apt) => apt.name)}
        />
      </div>
    );
  };

  const getEmailCount = () => {
    if (!selectedMonth) return 0;
    return getRecieptsFromApartments().length;
  };

  if (!recieptsMonths || recieptsMonths?.length === 0) {
    return (
      <Box className={classes.container}>
        <Box className={classes.header}>
          <EmailIcon className={classes.headerIcon} />
          <Typography variant="h5" className={classes.title}>
            Enviar Recibos por Email
          </Typography>
        </Box>
        <Typography color="textSecondary">
          No hay períodos de recibos disponibles para enviar.
        </Typography>
      </Box>
    );
  }

  const emailCount = getEmailCount();
  const isFormValid = selectedMonth && emailCount > 0;

  return (
    <Box className={classes.container}>
      <Box className={classes.header}>
        <EmailIcon className={classes.headerIcon} />
        <Typography variant="h5" className={classes.title}>
          Enviar Recibos por Email
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
          <Box className={classes.selectionRow}>
            <Button
              onClick={openSelectApts}
              variant="outlined"
              color="primary"
            >
              Seleccionar Apartamentos
            </Button>
            <Box className={classes.selectionInfo}>
              <Chip 
                label={`${selectedApts.length}/${apartments.length} seleccionados`}
                color={selectedApts.length === apartments.length ? 'primary' : 'default'}
                size="small"
              />
            </Box>
          </Box>
          {selectedMonth && (
            <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
              {emailCount} emails listos para enviar
            </Typography>
          )}
        </Grid>

        <Grid item xs={12}>
          <Button
            disabled={!isFormValid}
            onClick={sendEmails}
            variant="contained"
            color="primary"
            size="large"
            className={classes.sendButton}
            fullWidth
            startIcon={<SendIcon />}
          >
            Enviar Emails ({emailCount})
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
