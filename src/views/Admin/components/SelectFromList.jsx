import { 
  Button, 
  Checkbox, 
  Typography, 
  Box, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  makeStyles
} from "@material-ui/core";
import { 
  Save as SaveIcon, 
  SelectAll as SelectAllIcon,
  Clear as ClearIcon
} from "@material-ui/icons";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";

const useStyles = makeStyles((theme) => ({
  container: {
    width: 400,
    maxWidth: '90vw',
    padding: theme.spacing(2),
  },
  title: {
    fontWeight: 600,
    color: '#2d3748',
    marginBottom: theme.spacing(2),
    fontSize: '1.1rem',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  bulkActions: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  bulkButton: {
    textTransform: 'none',
    fontSize: '0.8rem',
    minWidth: 'auto',
    padding: theme.spacing(0.5, 1.5),
  },
  tableContainer: {
    maxHeight: 300,
    marginBottom: theme.spacing(2),
    border: '1px solid #e2e8f0',
    borderRadius: theme.spacing(1),
  },
  tableRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: '#f8fafc',
    },
    '&:hover': {
      backgroundColor: '#edf2f7',
    },
  },
  checkbox: {
    padding: theme.spacing(0.5),
  },
  apartmentName: {
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
  },
  saveButton: {
    backgroundColor: '#38a169',
    color: 'white',
    fontWeight: 500,
    textTransform: 'none',
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(1, 2),
    '&:hover': {
      backgroundColor: '#2f855a',
    },
    '&:disabled': {
      backgroundColor: '#cbd5e0',
      color: '#a0aec0',
    },
  },
}));

const mapListToDict = (list) => {
  let dict = {};
  list.forEach((item) => {
    dict[item] = true;
  });
  return dict;
};

export default function SelectFromList({ list = [], label, onSave }) {
  const classes = useStyles();
  const [dict, setDict] = useState({});

  const handleSave = () => {
    const newList = [];
    Object.keys(dict).forEach((item) => {
      if (dict[item]) {
        newList.push(item);
      }
    });
    onSave(newList);
  };

  const handleBulk = (shouldSelect) => {
    const newDict = { ...dict };
    Object.keys(newDict).forEach((item) => {
      newDict[item] = shouldSelect;
    });
    setDict(newDict);
  };

  useEffect(() => {
    setDict(mapListToDict(list));
  }, [list]);

  const areAllSelected = () => {
    return Object.values(dict).every(value => value);
  };

  const getSelectedCount = () => {
    return Object.values(dict).filter(value => value).length;
  };

  const allSelected = areAllSelected();
  const selectedCount = getSelectedCount();
  const totalCount = Object.keys(dict).length;

  return (
    <Box className={classes.container}>
      <Typography className={classes.title}>
        {label || 'Seleccionar Apartamentos'}
      </Typography>

      {/* Stats and Bulk Actions */}
      <Box className={classes.statsRow}>
        <Chip
          label={`${selectedCount} / ${totalCount} seleccionados`}
          color={selectedCount === totalCount ? 'primary' : 'default'}
          size="small"
        />
        <Box className={classes.bulkActions}>
          <Button
            variant="outlined"
            size="small"
            className={classes.bulkButton}
            onClick={() => handleBulk(true)}
            startIcon={<SelectAllIcon />}
            disabled={allSelected}
          >
            Todos
          </Button>
          <Button
            variant="outlined"
            size="small"
            className={classes.bulkButton}
            onClick={() => handleBulk(false)}
            startIcon={<ClearIcon />}
            disabled={selectedCount === 0}
          >
            Ninguno
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedCount > 0 && selectedCount < totalCount}
                  checked={totalCount > 0 && allSelected}
                  onChange={(e) => handleBulk(e.target.checked)}
                  className={classes.checkbox}
                  color="primary"
                />
              </TableCell>
              <TableCell>Apartamento</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(dict).map((item) => (
              <TableRow key={item} className={classes.tableRow}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={dict[item]}
                    onChange={(e) =>
                      setDict((s) => ({ ...s, [item]: e.target.checked }))
                    }
                    className={classes.checkbox}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Typography className={classes.apartmentName}>
                    {item}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Actions */}
      <Box className={classes.actions}>
        <Button
          className={classes.saveButton}
          variant="contained"
          onClick={handleSave}
          startIcon={<SaveIcon />}
          disabled={selectedCount === 0}
        >
          Guardar ({selectedCount})
        </Button>
      </Box>
    </Box>
  );
}
