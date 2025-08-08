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
  NotificationsActive as ReminderIcon,
  Send as SendIcon,
} from "@material-ui/icons";
import React, { useState, useContext } from "react";
import { createReminderEmail, sendEmail } from "../../utils/dbRequests";
import SelectFromList from "./components/SelectFromList";
import { ModalContext } from "./components/SimpleModal";
import PromptModal from "./components/PromptModal";

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
    color: '#ed8936',
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
  selectionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  selectionInfo: {
    color: '#718096',
    fontSize: '0.875rem',
  },
  sendButton: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5, 4),
    fontWeight: 600,
  },
}));

export default function EnviarRecordatorios({ apartments, users }) {
  const classes = useStyles();
  const [selectedApts, setSelectedApts] = useState(
    apartments.map((apt) => apt.name)
  );
  const handleModal = useContext(ModalContext);

  const getEmailsFromApartments = () => {
    const filteredApts = apartments.filter(
      (apt) => selectedApts.find((sApt) => sApt === apt.name) !== undefined
    );

    const tenantIds = filteredApts.map((apt) => apt.tenant.id);
    const filteredUsers = users.filter(
      (usr) => usr.id === tenantIds.find((id) => id === usr.id)
    );

    return filteredUsers.map((user) => user.email);
  };

  const sendEmails = () => {
    const emailsToSendTo = getEmailsFromApartments();

    const onSave = () => {
      createReminderEmail(emailsToSendTo);
      handleModal();
    };

    handleModal(
      <PromptModal
        onSave={onSave}
        onCancel={handleModal}
        actionTitle="ENVIAR"
        title={`¿Estás seguro de que quieres enviar ${emailsToSendTo.length} recordatorios?`}
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

  if (!apartments) return null;

  const emailCount = getEmailsFromApartments().length;
  const isFormValid = selectedApts.length > 0;

  return (
    <Box className={classes.container}>
      <Box className={classes.header}>
        <ReminderIcon className={classes.headerIcon} />
        <Typography variant="h5" className={classes.title}>
          Enviar Recordatorios
        </Typography>
      </Box>
      
      <Typography className={classes.description}>
        Envía recordatorios de pago a los residentes seleccionados.
      </Typography>
      
      <Grid container spacing={3}>
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
          <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
            {emailCount} recordatorios listos para enviar
          </Typography>
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
            Enviar Recordatorios ({emailCount})
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
