import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from "@material-ui/core";
import format from "date-fns/format";
import React, { useState } from "react";
import { useEffect } from "react";
import Loader from "../../components/Loader";
import { getLaundry } from "../../utils/dbRequests";
import { getMonthYear } from "../../utils/util";
import DataTable from "./components/DataTable";

export default function LaundryUseView({ users }) {
  const [monthYear, setMonthYear] = useState(getMonthYear(new Date()));
  const [laundry, setLaundry] = useState();

  useEffect(() => {
    getLaundry(users).then(setLaundry);
  }, []);

  if (!laundry) return <Loader />;

  const columns = [
    {
      field: "userId",
      headerName: "User Id",
      width: 100,
    },
    {
      field: "name",
      headerName: "Name",
      width: 150,
    },
    {
      field: "date",
      headerName: "Date",
      width: 180,
      renderCell: (params) =>
        format(new Date(params.value), "d MMM yyyy, hh:mm"),
    },
    {
      field: "type",
      headerName: "Type",
      width: 150,
    },
    {
      field: "message",
      headerName: "Message",
      width: 350,
    },
  ];

  const reservationColumns = [
    {
      field: "userName",
      headerName: "Name",
      width: 200,
    },
    {
      field: "date",
      headerName: "Date",
      width: 180,
      renderCell: (params) => params.value.substring(0, 10),
    },
  ];

  let reservationsRows = [];

  if (laundry.calendar[monthYear]) {
    reservationsRows = laundry.calendar[monthYear].map((res, index) => ({
      ...res,
      id: index,
    }));
  }

  return (
    <>
      <Paper style={{ padding: 20, marginRight: 20, width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h2 style={{ marginBottom: 20, marginRight: 20 }}>Laundry Use - </h2>
          <FormControl style={{ margin: "20px 0" }}>
            <InputLabel id="tenant">Month - Year</InputLabel>
            <Select
              labelId="monthYear"
              id="monthYear"
              onChange={(e) => {
                setMonthYear(e.target.value);
              }}
              variant="outlined"
              value={monthYear}
            >
              {Object.keys(laundry.log).map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <DataTable columns={columns} rows={laundry.log[monthYear] || []} />
      </Paper>

      <Paper style={{ padding: 20, marginRight: 20, width: "100%" }}>
        <h2>Active Reservations</h2>

        <DataTable columns={reservationColumns} rows={reservationsRows} />
      </Paper>
    </>
  );
}
