import { Paper } from '@material-ui/core';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { getMonthlyReports } from '../../utils/dbRequests';
import DataTable from './components/DataTable';

export default function MonthlyReports() {
  const [monthlyReports, setMonthlyReports] = useState();

  useEffect(() => {
    getMonthlyReports().then((reports) => {
      // Sort reports by date (newest first)
      const sorted = reports.sort((a, b) => {
        const [monthA, yearA] = a.id.split('_');
        const [monthB, yearB] = b.id.split('_');
        const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1);
        const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1);
        return dateB.getTime() - dateA.getTime();
      });
      setMonthlyReports(sorted);
    });
  }, []);

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
