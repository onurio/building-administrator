import * as React from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { makeStyles, useTheme, useMediaQuery } from '@material-ui/core';

const defaultColumns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'firstName', headerName: 'First name', width: 130 },
  { field: 'lastName', headerName: 'Last name', width: 130 },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 90,
  },
  {
    field: 'fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: (params) =>
      `${params.getValue('firstName') || ''} ${
        params.getValue('lastName') || ''
      }`,
  },
];

const defaultRows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiDataGrid-colCell, .MuiDataGrid-cell': {
      borderRight: `1px solid ${
        theme.palette.type === 'light' ? '#f0f0f0' : '#303030'
      }`,
    },
    '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
      borderBottom: `1px solid ${
        theme.palette.type === 'light' ? '#f0f0f0' : '#303030'
      }`,
    },
    '& .MuiDataGrid-cell': {
      color:
        theme.palette.type === 'light'
          ? 'rgba(0,0,0,.85)'
          : 'rgba(255,255,255,0.65)',
    },
    // Mobile-specific improvements
    [theme.breakpoints.down('sm')]: {
      '& .MuiDataGrid-colCell': {
        fontSize: '0.875rem',
        padding: theme.spacing(0.5, 1),
      },
      '& .MuiDataGrid-cell': {
        fontSize: '0.875rem',
        padding: theme.spacing(0.5, 1),
      },
    },
    // Improve horizontal scrolling on mobile
    '& .MuiDataGrid-virtualScroller': {
      // Ensure smooth scrolling
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
    },
    '& .MuiDataGrid-row': {
      minHeight: '48px !important', // Ensure adequate touch targets
    },
  },
  container: {
    width: '100%',
    overflowX: 'auto',
    // Improve scrollbar appearance
    '&::-webkit-scrollbar': {
      height: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#c1c1c1',
      borderRadius: '4px',
      '&:hover': {
        background: '#a8a8a8',
      },
    },
  },
}));

export default function DataTable({
  columns = defaultColumns,
  rows,
  customStyles = {},
  pageSize = 20,
}) {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Define proper page size options to prevent console warnings
  const pageSizeOptions = [5, 10, 20, 25, 50, 100];
  
  // Adjust page size for mobile
  const mobilePageSize = isMobile ? Math.min(pageSize, 10) : pageSize;
  
  // Ensure all rows have unique IDs
  const processedRows = React.useMemo(() => {
    if (!rows) return [];
    
    return rows.map((row, index) => {
      // If row already has a unique ID, use it
      if (row.id && typeof row.id === 'string' && row.id !== '0') {
        return row;
      }
      
      // Generate unique ID based on available properties
      let uniqueId;
      if (row.userId) {
        uniqueId = row.userId;
      } else if (row.edit !== undefined) {
        uniqueId = `row_${row.edit}_${index}`;
      } else {
        uniqueId = `row_${index}_${Date.now()}`;
      }
      
      return {
        ...row,
        id: uniqueId,
      };
    });
  }, [rows]);
  
  return (
    <div className={classes.container}>
      <div
        style={{
          height: isMobile ? 'auto' : '75vh',
          minHeight: isMobile ? '400px' : '75vh',
          width: '100%',
          ...customStyles,
        }}
      >
        <DataGrid
          className={classes.root}
          rows={processedRows}
          columns={columns}
          pageSize={mobilePageSize}
          rowsPerPageOptions={pageSizeOptions}
          pagination
          disableSelectionOnClick
          autoHeight={isMobile}
          density={isMobile ? 'compact' : 'standard'}
          hideFooterSelectedRowCount={isMobile}
          aria-label="Data table with paginated results"
          components={{
            Pagination: isMobile ? undefined : undefined, // Keep default pagination
          }}
          sx={{
            // Additional responsive styling
            '& .MuiDataGrid-main': {
              minHeight: isMobile ? '400px' : 'auto',
            },
            // Improve focus states for accessibility
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-colCell:focus': {
              outline: '2px solid #667eea',
              outlineOffset: '-2px',
            },
            // Ensure proper contrast for selected rows
            '& .MuiDataGrid-row.Mui-selected': {
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
              },
            },
          }}
        />
      </div>
    </div>
  );
}
