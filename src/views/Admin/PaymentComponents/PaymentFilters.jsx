import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  makeStyles,
} from '@material-ui/core';
import {
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  formCard: {
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: '#2d3748',
    display: 'flex',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));

export default function PaymentFilters({
  searchTerm,
  setSearchTerm,
  filterMonth,
  setFilterMonth,
  availableMonths,
  filteredPayments,
  allPayments,
  onExport,
  onClearFilters,
}) {
  const classes = useStyles();

  return (
    <Card className={classes.formCard}>
      <CardContent>
        <Typography className={classes.sectionTitle}>
          <PersonIcon className={classes.sectionIcon} />
          Filtros y Búsqueda
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buscar inquilino o mes"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Filtrar por mes</InputLabel>
              <Select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                label="Filtrar por mes"
              >
                <MenuItem value="">
                  <em>Todos los meses</em>
                </MenuItem>
                {availableMonths.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {/* Action buttons */}
        <Box style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            {filteredPayments.length} de {allPayments.length} pagos
          </Typography>
          <Box>
            <Button
              variant="outlined"
              onClick={onClearFilters}
              style={{ marginRight: 8 }}
            >
              Limpiar Filtros
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={onExport}
              disabled={filteredPayments.length === 0}
              startIcon={<MoneyIcon />}
            >
              Exportar CSV
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}