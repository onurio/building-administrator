import {
  Button,
  Grid,
  LinearProgress,
  TextField,
  Typography,
} from '@material-ui/core';
import React, { useState } from 'react';

export default function GenerateReciepts({ apartments, users, services }) {
  const [progress, setProgress] = useState(40);
  const [generating, setGenerating] = useState(false);
  const [water, setWater] = useState();
  const [electricity, setElectricity] = useState();

  console.log(services);

  const generate = () => {
    const date = new Date();
    const reciepts = [];

    apartments.forEach((apt) => {
      const { bills, rent, tenant } = apt;
      const { maintenance, administration, municipality } = services;
      if (!tenant) return;
      const user = users.find((usr) => usr.id === tenant.id);

      const reciept = {
        rent: Number(rent),
        water: (water * Number(bills)) / 100,
        electricity: (electricity * Number(bills)) / 100,
        debt: Number(user.debt) || 0,
        maintenance,
        administration,
        municipality,
      };

      if (user.services.indexOf('internet') !== -1) reciept.internet = 50;
      if (user.services.indexOf('cable') !== -1) reciept.cable = 50;

      reciepts.push(reciept);
    });
    console.log(reciepts);
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
    <>
      <Grid container>
        <Grid xs={4}>
          <TextField
            onChange={(e) => setWater(e.target.value)}
            type='number'
            name='water'
            label='Water bill (./S)'
          />
        </Grid>
        <Grid xs={4}>
          <TextField
            onChange={(e) => setElectricity(e.target.value)}
            type='number'
            name='electricity'
            label='Electricity bill (./S)'
          />
        </Grid>
        <Grid xs={4}>
          <Button
            disabled={electricity && water ? false : true}
            onClick={generate}
            variant='contained'
            color='primary'
          >
            Generate Reciepts
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
