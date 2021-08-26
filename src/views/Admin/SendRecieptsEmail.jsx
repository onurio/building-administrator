import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from '@material-ui/core';
import React, { useState, useContext } from 'react';
import { sendEmail } from '../../utils/dbRequests';
import SelectFromList from './components/SelectFromList';
import { ModalContext } from './components/SimpleModal';
import PromptModal from './components/PromptModal';

export default function SendRecieptsEmail({
  recieptsMonths,
  apartments,
  users,
}) {
  const [selectedMonth, setSelectedMonth] = useState();
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

    const onSave = () => {
      emailsToSend.forEach((info) => {
        sendEmail(info);
      });
      handleModal();
    };

    handleModal(
      <PromptModal
        onSave={onSave}
        onCancel={handleModal}
        actionTitle='SEND'
        title={`Are you sure you want to send ${emailsToSend.length} emails`}
      />
    );
  };

  const openSelectApts = () => {
    handleModal(
      <div style={{ width: 500 }}>
        <SelectFromList
          label='Select Apartments'
          onSave={(apts) => {
            setSelectedApts(apts);
            handleModal();
          }}
          list={apartments.map((apt) => apt.name)}
        />
      </div>
    );
  };

  if (!recieptsMonths || recieptsMonths?.length === 0) return null;

  return (
    <Paper
      style={{ width: '100%', marginLeft: 20, maxWidth: 300, padding: 20 }}
    >
      <h2 style={{ marginBottom: 50 }}>Send Emails with Reciept</h2>
      <Grid spacing={3} xs={12} container>
        <Grid style={{ margin: '20px 0' }} xs={12}>
          <FormControl style={{ width: 200 }}>
            <InputLabel id='months'>Months</InputLabel>
            <Select
              labelId='months'
              id='months'
              onChange={(e) => setSelectedMonth(e.target.value)}
              variant='outlined'
              value={selectedMonth}
            >
              {recieptsMonths.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid xs={12}>
          <Button
            onClick={openSelectApts}
            style={{ margin: 20 }}
            variant='contained'
            color='primary'
          >
            Select Apartments
          </Button>
          <div>
            {selectedApts.length}/{apartments.length} apartments selected
          </div>
        </Grid>

        <Grid xs={12}>
          <Button
            disabled={!selectedMonth}
            onClick={sendEmails}
            style={{ margin: 20 }}
            variant='contained'
            color='primary'
          >
            SendEmails
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
