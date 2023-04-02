import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from "@material-ui/core";
import React, { useState, useContext } from "react";
import { createReminderEmail, sendEmail } from "../../utils/dbRequests";
import SelectFromList from "./components/SelectFromList";
import { ModalContext } from "./components/SimpleModal";
import PromptModal from "./components/PromptModal";

export default function SendReminderEmail({ apartments, users }) {
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
        actionTitle="SEND"
        title={`Are you sure you want to send ${emailsToSendTo.length} emails`}
      />
    );
  };

  const openSelectApts = () => {
    handleModal(
      <div style={{ width: 500 }}>
        <SelectFromList
          label="Select Apartments"
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

  return (
    <Paper
      style={{
        width: "100%",
        minWidth: 400,
        marginLeft: 20,
        maxWidth: 300,
        padding: 20,
      }}
    >
      <h2 style={{ marginBottom: 50 }}>Send Reminder Emails</h2>
      <Grid spacing={3} xs={12} container>
        <Grid xs={12}>
          <Button
            onClick={openSelectApts}
            style={{ margin: 20 }}
            variant="contained"
            color="primary"
          >
            Select Apartments
          </Button>
          <div>
            {selectedApts.length}/{apartments.length} apartments selected
          </div>
        </Grid>

        <Grid xs={12}>
          <Button
            disabled={selectedApts.length === 0}
            onClick={sendEmails}
            style={{ margin: 20 }}
            variant="contained"
            color="primary"
          >
            SendEmails
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
