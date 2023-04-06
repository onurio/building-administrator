/* eslint-disable react/display-name */
import {
  debounce,
  Divider,
  makeStyles,
  Paper,
  Slider,
  Typography,
} from "@material-ui/core";
import React, { useState } from "react";

import { saveApartment } from "../../utils/dbRequests";
import Loader from "../../components/Loader";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexGrow: 1,

    flexDirection: "column",
    alignContent: "center",
    justifyContent: "flex-start",
  },
  button: {
    maxWidth: 200,
  },
  controlsContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  apt: {
    padding: "10px 20px",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    justifyContent: "center",
  },
  hideShow: {
    marginLeft: 10,
    padding: "0 10px",
  },
}));

export default function WaterAndElectricityEditor({ apartments, refresh }) {
  const classes = useStyles();
  const [isCalculating, setIsCalculating] = useState(false);

  const updateApartment = debounce(async (apt) => {
    setIsCalculating(true);
    await saveApartment(apt);
    refresh();
    setIsCalculating(false);
  }, 2000);

  return (
    <div>
      <Typography variant="h3">Water and Electricity Editor</Typography>
      <Divider />
      {isCalculating ? (
        <Loader />
      ) : (
        <Typography variant="h5">
          Water:{" "}
          {apartments
            .reduce((a, b) => a + Number(b.water_percentage), 0)
            .toFixed(2)}
          % <br />
          Electricity:{" "}
          {apartments
            .reduce((a, b) => a + Number(b.electricity_percentage), 0)
            .toFixed(2)}
          %
        </Typography>
      )}
      <Divider />
      <div className={classes.root}>
        <div className={classes.controlsContainer}>
          {apartments.map((apt) => {
            return (
              <Paper className={classes.apt}>
                <Typography variant="h5">
                  {apt.name} - {apt?.tenant?.name}
                </Typography>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: 350,
                    justifyContent: "center",
                  }}
                >
                  Water: {apt.water_percentage}%
                  <Slider
                    key={apt.id + "water"}
                    style={{ width: 300 }}
                    defaultValue={apt.water_percentage}
                    marks
                    min={0}
                    step={0.1}
                    max={20}
                    valueLabelDisplay="auto"
                    onChange={(e, value) => {
                      updateApartment({
                        ...apt,
                        water_percentage: value,
                      });
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: 300,
                  }}
                >
                  Electricity: {apt.electricity_percentage}%
                  <Slider
                    key={apt.id + "electricity"}
                    style={{ width: 300 }}
                    defaultValue={apt.electricity_percentage}
                    marks
                    min={0}
                    step={0.1}
                    max={20}
                    valueLabelDisplay="auto"
                    onChange={(e, value) => {
                      updateApartment({
                        ...apt,
                        electricity_percentage: value,
                      });
                    }}
                  />
                </div>
              </Paper>
            );
          })}
        </div>
      </div>
    </div>
  );
}
