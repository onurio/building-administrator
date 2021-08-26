import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from '@material-ui/core';
import format from 'date-fns/format';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { getMonthlyReports } from '../../utils/dbRequests';
import { getMonthYear } from '../../utils/util';
import DataTable from './components/DataTable';

export default function MonthlyReports() {
  const [monthYear, setMonthYear] = useState(getMonthYear(new Date()));
  const [monthlyReports, setMonthlyReports] = useState();

  useEffect(() => {
    getMonthlyReports().then(setMonthlyReports);
  }, []);

  console.log(monthlyReports);

  if (!monthlyReports) return null;
  const columns = [
    {
      field: 'id',
      headerName: 'Month/Year',
      width: 150,
    },
    {
      field: 'water',
      headerName: 'Water',
      width: 120,
    },
    {
      field: 'electricity',
      headerName: 'Electricity',
      width: 120,
    },
    {
      field: 'laundryIncome',
      headerName: 'Laundry Income',
      width: 200,
    },
    {
      field: 'expectedIncome',
      headerName: 'Expected Income',
      width: 200,
    },
  ];

  return (
    <Paper style={{ padding: 20, marginRight: 20, width: '100%' }}>
      <h1>Monthly Reports</h1>
      <DataTable columns={columns} rows={monthlyReports || []} />
    </Paper>
  );
}
