import DateFnsUtils from '@date-io/date-fns/build/index.esm';
import {
  Button,
  Grid,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import React, { useState } from 'react';
import { getLaundryUser, updateUser } from '../../utils/dbRequests';
import {
  calculateLaundryUsage,
  createPdfInvoice,
  generateRecieptInfo,
  getMonthYear,
} from '../../utils/util';

export default function GenerateReciepts({
  apartments,
  users,
  refresh,
  services,
  storage,
}) {
  const [progress, setProgress] = useState(40);
  const [generating, setGenerating] = useState(false);
  const [water, setWater] = useState();
  const [electricity, setElectricity] = useState();
  const [recieptDate, setRecieptDate] = useState(new Date());

  const uploadFile = (path, blob, onFinish = (url) => console.log(url)) => {
    var storageRef = storage.ref(path);

    //Upload file
    var task = storageRef.put(blob);

    //Update progress bar
    task.on(
      'state_changed',
      (snapshot) => {},
      function error(err) {
        console.log(err);
      },
      () => {
        task.snapshot.ref.getDownloadURL().then((url) => {
          onFinish(url);
        });
      }
    );
  };

  const generate = async () => {
    const date = recieptDate;

    const recieptPromises = apartments.map(async (apt) => {
      const user = users.find((usr) => usr.id === apt.tenant.id);
      const laundryUsage = await getLaundryUser(user.id);
      const reciept = generateRecieptInfo(
        apt,
        user,
        services,
        water,
        electricity,
        calculateLaundryUsage(laundryUsage, getMonthYear(date))
      );

      const doc = createPdfInvoice(reciept, date);
      const blobPDF = new Blob([doc.output()], { type: 'application/pdf' });

      return {
        blob: blobPDF,
        path: `${user.name.toLowerCase().replace(' ', '_')}_${
          user.id
        }/reciepts/${getMonthYear(date)}.pdf`,
        user,
      };
    });

    const reciepts = await Promise.all(recieptPromises);
    const amount = reciepts.length;

    setProgress(0);
    setGenerating(true);
    uploadFile(reciepts[0].path, reciepts[0].blob);
    reciepts.forEach((reciept) => {
      const onFinish = async (url) => {
        const newReciepts = [...reciept.user.reciepts];
        newReciepts.push({
          date: date.toISOString(),
          name: getMonthYear(date),
          url,
        });
        const updatedUser = { ...reciept.user, reciepts: newReciepts };
        await updateUser(updatedUser);
        // SEND EMAIL WITH INVOICE
        setProgress((s) => {
          if (s + 100 / amount === 100) {
            setGenerating(false);
            alert('Generated succefully');
            refresh();
          }
          return s + 100 / amount;
        });
      };
      uploadFile(reciept.path, reciept.blob, onFinish);
    });
    // setGenerating(true);
  };

  if (generating) {
    return (
      <>
        <Typography variant='subtitle1'>Generating reciepts</Typography>
        <LinearProgress variant='determinate' value={progress} />
      </>
    );
  }
  return (
    <Paper style={{ width: '100%', maxWidth: 500, padding: 20 }}>
      <h2 style={{ marginBottom: 50 }}>Generate Invoices</h2>
      <Grid spacing={3} xs={12} container>
        <Grid style={{ margin: '20px 0' }} xs={12}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DatePicker
              variant='dialog'
              openTo='year'
              views={['year', 'month']}
              label='Invoice Month && Year'
              value={recieptDate}
              onChange={setRecieptDate}
            />
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid xs={6}>
          <TextField
            onChange={(e) => setWater(e.target.value)}
            type='number'
            name='water'
            variant='outlined'
            label='Water bill (./S)'
          />
        </Grid>
        <Grid xs={6}>
          <TextField
            onChange={(e) => setElectricity(e.target.value)}
            type='number'
            name='electricity'
            variant='outlined'
            label='Electricity bill (./S)'
          />
        </Grid>

        <Grid xs={12}>
          <Button
            disabled={electricity && water ? false : true}
            onClick={generate}
            style={{ margin: 20 }}
            variant='contained'
            color='primary'
          >
            Generate Reciepts
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
