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
    // Enhanced row highlighting
    '& .MuiDataGrid-row': {
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(102, 126, 234, 0.08) !important',
      },
    },
    // Add clicked state that persists
    '& .MuiDataGrid-row.row-selected': {
      backgroundColor: 'rgba(102, 126, 234, 0.12) !important',
      '&:hover': {
        backgroundColor: 'rgba(102, 126, 234, 0.16) !important',
      },
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
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
    },
    '& .MuiDataGrid-row': {
      minHeight: '48px !important',
    },
  },
  container: {
    width: '100%',
    overflowX: 'auto',
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
  const [selectedRowId, setSelectedRowId] = React.useState(null);
  
  // Define proper page size options to prevent console warnings
  const pageSizeOptions = [5, 10, 20, 25, 50, 100];
  
  // Calculate minimum width based on content and header
  const calculateMinWidth = (column) => {
    const headerLength = column.headerName?.length || 0;
    
    // Base width calculation: ~10px per character + generous padding for headers
    const headerWidth = Math.max(headerLength * 10 + 40, 80);
    
    // For action columns with buttons
    if (column.renderCell && (column.field === 'edit' || column.field === 'id' || column.field === 'actions' ||
        column.headerName === 'Eliminar' || column.headerName === 'Acciones' ||
        column.headerName === 'Archivos' || column.headerName === 'Recibos')) {
      return Math.max(headerWidth, column.field === 'actions' ? 160 : 110); // More generous for action buttons
    }
    
    // For chip/badge columns (apartment, debt)
    if (column.renderCell && (column.field === 'apartment' || column.field === 'debt' || column.field === 'deposit')) {
      return Math.max(headerWidth, 120); // More space for chips
    }
    
    // For date columns
    if (column.field.includes('contract') || column.field.includes('date')) {
      return Math.max(headerWidth, 140); // More space for date format
    }
    
    // For email columns
    if (column.field === 'email') {
      return Math.max(headerWidth, 200); // More space for emails
    }
    
    // For name columns
    if (column.field === 'name') {
      return Math.max(headerWidth, 160); // More space for names
    }
    
    // For specific problematic fields we see in the screenshot
    if (column.field === 'services' || column.headerName === 'Servicios') {
      return Math.max(headerWidth, 100); // "Servicios" needs full space
    }
    
    if (column.field === 'dni_ruc' || column.headerName === 'DNI/RUC') {
      return Math.max(headerWidth, 100); // "DNI/RUC" needs full space  
    }
    
    if (column.field === 'tel' || column.field === 'telEmergency') {
      return Math.max(headerWidth, 110); // Phone numbers need space
    }
    
    // Default: header width or reasonable minimum
    return Math.max(headerWidth, 100);
  };

  // Process columns to make them auto-size better
  const processedColumns = React.useMemo(() => {
    const totalColumns = columns.length;
    const isWideTable = totalColumns > 8; // Tables with many columns need different handling
    
    return columns.map(col => {
      const minWidth = calculateMinWidth(col);
      
      // Keep action columns (edit, delete, actions) and button columns with fixed small widths
      if (col.field === 'edit' || col.field === 'id' || col.field === 'actions' || 
          col.headerName === 'Eliminar' || col.headerName === 'Acciones') {
        return {
          ...col,
          width: Math.max(minWidth, col.width || 100),
          flex: undefined
        };
      }
      
      // For wide tables, use more conservative flex values
      if (isWideTable) {
        if (col.width <= 120) {
          return { ...col, flex: 0.8, width: undefined, minWidth };
        } else if (col.width <= 180) {
          return { ...col, flex: 1.2, width: undefined, minWidth };
        } else {
          return { ...col, flex: 1.5, width: undefined, minWidth };
        }
      }
      
      // For narrow tables, use the original logic
      return {
        ...col,
        ...(col.width && col.width < 200 ? { flex: 0.8, width: undefined, minWidth } : {}),
        ...(col.width && col.width >= 200 && col.width < 300 ? { flex: 1.2, width: undefined, minWidth } : {}),
        ...(col.width && col.width >= 300 ? { flex: 1.5, width: undefined, minWidth } : {}),
      };
    });
  }, [columns]);
  
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

  const handleRowClick = (params) => {
    setSelectedRowId(params.id);
    
    // Remove previous selection
    const previousSelected = document.querySelector('.row-selected');
    if (previousSelected) {
      previousSelected.classList.remove('row-selected');
    }
    
    // Add selection to clicked row
    const clickedRow = document.querySelector(`[data-id="${params.id}"]`);
    if (clickedRow) {
      clickedRow.classList.add('row-selected');
    }
  };
  
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
          columns={processedColumns}
          pageSize={mobilePageSize}
          rowsPerPageOptions={pageSizeOptions}
          pagination
          disableSelectionOnClick
          onRowClick={handleRowClick}
          autoHeight={isMobile}
          density={isMobile ? 'compact' : 'standard'}
          hideFooterSelectedRowCount={isMobile}
          aria-label="Data table with paginated results"
          components={{
            Pagination: isMobile ? undefined : undefined,
          }}
        />
      </div>
    </div>
  );
}
