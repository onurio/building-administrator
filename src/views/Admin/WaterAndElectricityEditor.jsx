/* eslint-disable react/display-name */
import {
  makeStyles,
  Paper,
  Slider,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  Button,
  Fab,
  Badge,
} from "@material-ui/core";
import {
  Opacity as WaterIcon,
  FlashOn as ElectricityIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Update as UpdateIcon,
  CompareArrows as CompareIcon,
} from "@material-ui/icons";
import React, { useState, useEffect } from "react";

import { saveApartment, getMonthlyReports } from "../../utils/dbRequests";
import UtilityUsageChart from "./components/UtilityUsageChart";
import Loader from "../../components/Loader";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },
  header: {
    marginBottom: theme.spacing(4),
  },
  title: {
    fontWeight: 600,
    color: "#1a202c",
    marginBottom: theme.spacing(2),
  },
  summaryCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    marginBottom: theme.spacing(4),
    borderRadius: theme.spacing(2),
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
  summaryContent: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      gap: theme.spacing(2),
    },
  },
  summaryItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexDirection: "column",
    textAlign: "center",
  },
  summaryIcon: {
    fontSize: "3rem",
    marginBottom: theme.spacing(1),
  },
  summaryValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "white",
  },
  summaryLabel: {
    fontSize: "1rem",
    opacity: 0.9,
    color: "white",
  },
  apartmentCard: {
    borderRadius: theme.spacing(2),
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e2e8f0",
    marginBottom: theme.spacing(3),
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transform: "translateY(-2px)",
    },
  },
  apartmentHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: "#f7fafc",
    borderRadius: `${theme.spacing(2)}px ${theme.spacing(2)}px 0 0`,
    borderBottom: "1px solid #e2e8f0",
  },
  apartmentAvatar: {
    backgroundColor: "#667eea",
    marginRight: theme.spacing(2),
    width: 50,
    height: 50,
  },
  apartmentInfo: {
    flex: 1,
  },
  apartmentName: {
    fontWeight: 600,
    color: "#1a202c",
    fontSize: "1.2rem",
    marginBottom: theme.spacing(0.5),
  },
  tenantName: {
    color: "#718096",
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  sliderContainer: {
    padding: theme.spacing(3),
  },
  sliderSection: {
    marginBottom: theme.spacing(4),
    "&:last-child": {
      marginBottom: 0,
    },
  },
  sliderHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
  },
  sliderLabel: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    fontWeight: 500,
    color: "#4a5568",
  },
  sliderIcon: {
    fontSize: "1.5rem",
  },
  percentageChip: {
    fontWeight: "bold",
    minWidth: "80px",
  },
  waterChip: {
    backgroundColor: "#3182ce",
    color: "white",
  },
  electricityChip: {
    backgroundColor: "#f6ad55",
    color: "white",
  },
  customSlider: {
    color: "#667eea",
    height: 8,
    "& .MuiSlider-track": {
      border: "none",
      height: 8,
    },
    "& .MuiSlider-rail": {
      height: 8,
      backgroundColor: "#e2e8f0",
    },
    "& .MuiSlider-thumb": {
      height: 20,
      width: 20,
      backgroundColor: "#fff",
      border: "2px solid currentColor",
      marginTop: -6,
      marginLeft: -10,
      "&:focus, &:hover, &.Mui-active": {
        boxShadow: "0 0 0 8px rgba(102, 126, 234, 0.16)",
      },
    },
  },
  electricitySlider: {
    color: "#f6ad55",
    "& .MuiSlider-thumb": {
      "&:focus, &:hover, &.Mui-active": {
        boxShadow: "0 0 0 8px rgba(246, 173, 85, 0.16)",
      },
    },
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    borderRadius: theme.spacing(2),
  },
  floatingSection: {
    position: "fixed",
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: 1000,
    minWidth: 280,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: theme.spacing(2),
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
  },
  floatingSectionContent: {
    padding: theme.spacing(2),
  },
  floatingHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
  },
  floatingTitle: {
    fontWeight: 600,
    fontSize: "1rem",
  },
  changeBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "white",
    fontWeight: "bold",
    minWidth: 24,
    height: 24,
  },
  floatingComparison: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  comparisonRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  utilityLabel: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    fontSize: "0.875rem",
    opacity: 0.9,
  },
  percentageComparison: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    fontSize: "0.875rem",
  },
  currentValue: {
    opacity: 0.8,
  },
  arrow: {
    fontSize: "1rem",
    opacity: 0.7,
  },
  futureValue: {
    fontWeight: "bold",
  },
  floatingButton: {
    width: "100%",
    padding: theme.spacing(1.5),
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    color: "white",
    fontWeight: 600,
    borderRadius: theme.spacing(1),
    textTransform: "none",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.25)",
    },
    "&:disabled": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      color: "rgba(255, 255, 255, 0.5)",
    },
  },
  previewTotals: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(2),
    backgroundColor: "#f0fff4",
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(2),
    border: "1px solid #9ae6b4",
  },
  previewItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  previewValue: {
    fontWeight: "bold",
    color: "#2f855a",
    fontSize: "1.1rem",
  },
  comparisonArrow: {
    color: "#4a5568",
    margin: "0 8px",
  },
  changedValue: {
    color: "#e53e3e",
    fontWeight: "bold",
  },
  resetButton: {
    marginLeft: theme.spacing(1),
  },
}));

export default function WaterAndElectricityEditor({ apartments, refresh, services }) {
  const classes = useStyles();
  const [isCalculating, setIsCalculating] = useState(false);
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [localApartments, setLocalApartments] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize local state with apartments data
  useEffect(() => {
    setLocalApartments(apartments.map(apt => ({
      ...apt,
      water_percentage: apt.water_percentage || 0,
      electricity_percentage: apt.electricity_percentage || 0,
    })));
    setHasChanges(false);
  }, [apartments]);

  // Fetch monthly reports data
  useEffect(() => {
    const fetchMonthlyReports = async () => {
      try {
        const reports = await getMonthlyReports();
        setMonthlyReports(reports);
      } catch (error) {
        console.error('Error fetching monthly reports:', error);
      }
    };

    fetchMonthlyReports();
  }, []);

  // Update local apartment data
  const updateLocalApartment = (apartmentId, field, value) => {
    setLocalApartments(prev => 
      prev.map(apt => 
        apt.id === apartmentId 
          ? { ...apt, [field]: value }
          : apt
      )
    );
    setHasChanges(true);
  };

  // Save all changes to database
  const saveChanges = async () => {
    setIsCalculating(true);
    try {
      // Find apartments that have changed
      const changedApartments = localApartments.filter(localApt => {
        const originalApt = apartments.find(apt => apt.id === localApt.id);
        return originalApt && (
          originalApt.water_percentage !== localApt.water_percentage ||
          originalApt.electricity_percentage !== localApt.electricity_percentage
        );
      });

      // Save each changed apartment
      await Promise.all(
        changedApartments.map(apt => saveApartment(apt))
      );
      
      setHasChanges(false);
      refresh();
    } catch (error) {
      console.error('Error saving apartments:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Reset changes
  const resetChanges = () => {
    setLocalApartments(apartments.map(apt => ({
      ...apt,
      water_percentage: apt.water_percentage || 0,
      electricity_percentage: apt.electricity_percentage || 0,
    })));
    setHasChanges(false);
  };

  // Current totals (from database)
  const currentTotalWater = apartments
    .reduce((a, b) => a + Number(b.water_percentage || 0), 0)
    .toFixed(2);
  
  const currentTotalElectricity = apartments
    .reduce((a, b) => a + Number(b.electricity_percentage || 0), 0)
    .toFixed(2);

  // Preview totals (from local state)
  const previewTotalWater = localApartments
    .reduce((a, b) => a + Number(b.water_percentage || 0), 0)
    .toFixed(2);
  
  const previewTotalElectricity = localApartments
    .reduce((a, b) => a + Number(b.electricity_percentage || 0), 0)
    .toFixed(2);

  return (
    <Box className={classes.root}>
      {/* Header Section */}
      <Box className={classes.header}>
        <Typography variant="h4" className={classes.title}>
          Editor de Agua y Electricidad
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Ajusta los porcentajes de consumo para cada apartamento
        </Typography>
      </Box>

      {/* Preview Changes Card */}
      {hasChanges && (
        <Card className={classes.previewTotals}>
          <Box>
            <Typography variant="h6" style={{ marginBottom: 8, color: '#2f855a' }}>
              Vista Previa de Cambios
            </Typography>
            <Box style={{ display: 'flex', gap: 32 }}>
              <Box className={classes.previewItem}>
                <WaterIcon style={{ color: '#3182ce' }} />
                <Typography>Agua:</Typography>
                <Typography>{currentTotalWater}%</Typography>
                <CompareIcon className={classes.comparisonArrow} />
                <Typography className={classes.previewValue}>
                  {previewTotalWater}%
                </Typography>
              </Box>
              <Box className={classes.previewItem}>
                <ElectricityIcon style={{ color: '#f6ad55' }} />
                <Typography>Electricidad:</Typography>
                <Typography>{currentTotalElectricity}%</Typography>
                <CompareIcon className={classes.comparisonArrow} />
                <Typography className={classes.previewValue}>
                  {previewTotalElectricity}%
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box>
            <Button
              variant="outlined"
              onClick={resetChanges}
              className={classes.resetButton}
            >
              Descartar
            </Button>
          </Box>
        </Card>
      )}

      {/* Summary Card */}
      <Card className={classes.summaryCard}>
        <Box className={classes.summaryContent}>
          <Box className={classes.summaryItem}>
            <WaterIcon className={classes.summaryIcon} />
            <Typography className={classes.summaryValue}>
              {isCalculating ? "..." : 
                hasChanges ? (
                  <span>
                    {currentTotalWater}% → <span className={classes.changedValue}>{previewTotalWater}%</span>
                  </span>
                ) : `${currentTotalWater}%`
              }
            </Typography>
            <Typography className={classes.summaryLabel}>
              Total Agua
            </Typography>
          </Box>
          <Box className={classes.summaryItem}>
            <ElectricityIcon className={classes.summaryIcon} />
            <Typography className={classes.summaryValue}>
              {isCalculating ? "..." : 
                hasChanges ? (
                  <span>
                    {currentTotalElectricity}% → <span className={classes.changedValue}>{previewTotalElectricity}%</span>
                  </span>
                ) : `${currentTotalElectricity}%`
              }
            </Typography>
            <Typography className={classes.summaryLabel}>
              Total Electricidad
            </Typography>
          </Box>
        </Box>
        {isCalculating && <LinearProgress style={{ marginTop: 16 }} />}
      </Card>

      {/* Usage Chart */}
      <UtilityUsageChart monthlyReports={monthlyReports} />

      {/* Apartments Grid */}
      <Grid container spacing={3}>
        {localApartments.map((apt) => (
          <Grid item xs={12} md={6} lg={4} key={apt.id}>
            <Card className={classes.apartmentCard} style={{ position: 'relative' }}>
              {isCalculating && (
                <Box className={classes.loadingOverlay}>
                  <Loader />
                </Box>
              )}
              
              {/* Apartment Header */}
              <Box className={classes.apartmentHeader}>
                <Avatar className={classes.apartmentAvatar}>
                  <Typography variant="body1" style={{ fontWeight: 'bold', color: 'white' }}>
                    {apt.name}
                  </Typography>
                </Avatar>
                <Box className={classes.apartmentInfo}>
                  <Typography className={classes.apartmentName}>
                    Apartamento {apt.name}
                  </Typography>
                  {apt?.tenant?.name && (
                    <Typography className={classes.tenantName}>
                      <PersonIcon fontSize="small" />
                      {apt.tenant.name}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Sliders Container */}
              <Box className={classes.sliderContainer}>
                {/* Water Slider */}
                <Box className={classes.sliderSection}>
                  <Box className={classes.sliderHeader}>
                    <Box className={classes.sliderLabel}>
                      <WaterIcon 
                        className={classes.sliderIcon} 
                        style={{ color: '#3182ce' }}
                      />
                      <Typography>Agua</Typography>
                    </Box>
                    <Chip
                      label={`${apt.water_percentage || 0}%`}
                      className={`${classes.percentageChip} ${classes.waterChip}`}
                      size="small"
                      style={{
                        backgroundColor: hasChanges && apartments.find(origApt => origApt.id === apt.id)?.water_percentage !== apt.water_percentage ? '#e53e3e' : '#3182ce'
                      }}
                    />
                  </Box>
                  <Slider
                    key={`${apt.id}-water`}
                    value={apt.water_percentage || 0}
                    min={0}
                    step={0.1}
                    max={20}
                    valueLabelDisplay="auto"
                    className={classes.customSlider}
                    onChange={(e, value) => {
                      updateLocalApartment(apt.id, 'water_percentage', value);
                    }}
                  />
                </Box>

                {/* Electricity Slider */}
                <Box className={classes.sliderSection}>
                  <Box className={classes.sliderHeader}>
                    <Box className={classes.sliderLabel}>
                      <ElectricityIcon 
                        className={classes.sliderIcon} 
                        style={{ color: '#f6ad55' }}
                      />
                      <Typography>Electricidad</Typography>
                    </Box>
                    <Chip
                      label={`${apt.electricity_percentage || 0}%`}
                      className={`${classes.percentageChip} ${classes.electricityChip}`}
                      size="small"
                      style={{
                        backgroundColor: hasChanges && apartments.find(origApt => origApt.id === apt.id)?.electricity_percentage !== apt.electricity_percentage ? '#e53e3e' : '#f6ad55'
                      }}
                    />
                  </Box>
                  <Slider
                    key={`${apt.id}-electricity`}
                    value={apt.electricity_percentage || 0}
                    min={0}
                    step={0.1}
                    max={20}
                    valueLabelDisplay="auto"
                    className={`${classes.customSlider} ${classes.electricitySlider}`}
                    onChange={(e, value) => {
                      updateLocalApartment(apt.id, 'electricity_percentage', value);
                    }}
                  />
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Floating Save Section */}
      {hasChanges && (
        <Box className={classes.floatingSection}>
          <Box className={classes.floatingSectionContent}>
            <Box className={classes.floatingHeader}>
              <Typography className={classes.floatingTitle}>
                Cambios Pendientes
              </Typography>
              <Chip 
                className={classes.changeBadge}
                label={localApartments.filter(localApt => {
                  const originalApt = apartments.find(apt => apt.id === localApt.id);
                  return originalApt && (
                    originalApt.water_percentage !== localApt.water_percentage ||
                    originalApt.electricity_percentage !== localApt.electricity_percentage
                  );
                }).length}
                size="small"
              />
            </Box>
            
            <Box className={classes.floatingComparison}>
              <Box className={classes.comparisonRow}>
                <Box className={classes.utilityLabel}>
                  <WaterIcon fontSize="small" />
                  <Typography variant="body2">Agua</Typography>
                </Box>
                <Box className={classes.percentageComparison}>
                  <Typography className={classes.currentValue}>
                    {currentTotalWater}%
                  </Typography>
                  <Typography className={classes.arrow}>→</Typography>
                  <Typography className={classes.futureValue}>
                    {previewTotalWater}%
                  </Typography>
                </Box>
              </Box>
              
              <Box className={classes.comparisonRow}>
                <Box className={classes.utilityLabel}>
                  <ElectricityIcon fontSize="small" />
                  <Typography variant="body2">Electricidad</Typography>
                </Box>
                <Box className={classes.percentageComparison}>
                  <Typography className={classes.currentValue}>
                    {currentTotalElectricity}%
                  </Typography>
                  <Typography className={classes.arrow}>→</Typography>
                  <Typography className={classes.futureValue}>
                    {previewTotalElectricity}%
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Button
              className={classes.floatingButton}
              onClick={saveChanges}
              disabled={isCalculating}
              startIcon={<SaveIcon />}
            >
              {isCalculating ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
