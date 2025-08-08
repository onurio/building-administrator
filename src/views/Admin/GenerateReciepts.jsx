import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import {
  Button,
  Grid,
  Paper,
  TextField,
  LinearProgress,
  Typography,
  Box,
  Chip,
  makeStyles,
} from "@material-ui/core";
import {
  Receipt as ReceiptIcon,
  Assignment as GenerateIcon,
} from "@material-ui/icons";
import React, { useContext, useState } from "react";
import {
  calculateLaundryUsage,
  createPdfInvoice,
  generateRecieptInfo,
  getMonthYear,
} from "../../utils/util";
import {
  createMonthlyReport,
  getLaundryUser,
  updateUser,
} from "../../utils/dbRequests";
import SelectFromList from "./components/SelectFromList";
import { ModalContext } from "./components/SimpleModal";
import { useEffect } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
    minHeight: '400px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  headerIcon: {
    marginRight: theme.spacing(1),
    color: '#4299e1',
    fontSize: '1.5rem',
  },
  title: {
    fontWeight: 600,
    color: '#2d3748',
    margin: 0,
  },
  formGrid: {
    marginTop: theme.spacing(2),
  },
  dateField: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  utilityField: {
    width: '100%',
  },
  selectionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  selectionInfo: {
    color: '#718096',
    fontSize: '0.875rem',
  },
  generateButton: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(1.5, 4),
    fontWeight: 600,
  },
  progressContainer: {
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  progressText: {
    marginBottom: theme.spacing(2),
    color: '#4a5568',
  },
}));

export default function GenerarRecibos({
  apartments,
  users,
  storage,
  services,
  refresh,
}) {
  const classes = useStyles();
  const [water, setWater] = useState('');
  const [electricity, setElectricity] = useState('');
  const [recieptDate, setRecieptDate] = useState(new Date());
  const [progress, setProgress] = useState(40);
  const [generating, setGenerating] = useState(false);
  const [selectedApts, setSelectedApts] = useState([...apartments]);
  const handleModal = useContext(ModalContext);

  const uploadFile = (path, blob, onFinish = (url) => console.log(url)) => {
    const storageRef = ref(storage, path);

    uploadBytes(storageRef, blob);
    const task = uploadBytesResumable(storageRef, blob);

    //Update progress bar
    task.on(
      "state_changed",
      (snapshot) => {},
      function error(err) {
        console.log(err);
      },
      () => {
        getDownloadURL(task.snapshot.ref).then((url) => {
          onFinish(url);
        });
      }
    );
  };

  const openSelectApts = () => {
    handleModal(
      <div style={{ width: 500 }}>
        <SelectFromList
          label="Seleccionar Apartamentos"
          onSave={(apts) => {
            setSelectedApts(apts);
            handleModal();
          }}
          list={apartments.map((apt) => apt.name)}
        />
      </div>
    );
  };

  const generate = async () => {
    setProgress(0);
    setGenerating(true);

    const date = recieptDate;
    const filtered = apartments.filter(
      (apt) =>
        selectedApts.find((selected) => selected === apt.name) !== undefined
    );

    const monthReport = {
      water,
      electricity,
    };

    const recieptPromises = filtered.map(async (apt) => {
      const user = users.find((usr) => usr.id === apt.tenant.id);
      if (!user) return null;
      const laundryUsage = await getLaundryUser(user.id);
      const reciept = generateRecieptInfo(
        apt,
        user,
        services,
        water,
        electricity,
        calculateLaundryUsage(laundryUsage, getMonthYear(date))
      );


      const doc = createPdfInvoice(reciept, date);
      const blobPDF = new Blob([doc.output()], { type: "application/pdf" });

      return {
        blob: blobPDF,
        path: `${user.name.toLowerCase().replace(/ /g, "_")}_${
          user.id
        }/reciepts/${getMonthYear(date)}.pdf`,
        user,
      };
    });

    const reciepts = await Promise.all(recieptPromises);
    const amount = reciepts.length;
    const monthYear = getMonthYear(date);

    await createMonthlyReport(monthReport, monthYear);

    reciepts.forEach((reciept) => {
      if (!reciept) return undefined;
      const onFinish = async (url) => {
        const newReciepts = [...reciept.user.reciepts];
        const receiptData = generateRecieptInfo(
          apartments.find(apt => apt.tenant.id === reciept.user.id),
          reciept.user,
          services,
          water,
          electricity,
          calculateLaundryUsage(await getLaundryUser(reciept.user.id), monthYear)
        );
        
        newReciepts.push({
          date: date.toISOString(),
          name: monthYear,
          url,
          paid: false,
          total: receiptData.total,
        });
        const updatedUser = { ...reciept.user, reciepts: newReciepts };
        await updateUser(updatedUser);
        // SEND EMAIL WITH INVOICE
        setProgress((s) => {
          return s + 100 / amount;
        });
      };
      uploadFile(reciept.path, reciept.blob, onFinish);
    });
    // setGenerating(true);
  };

  useEffect(() => {
    if (Math.round(progress) === 100) {
      setGenerating(false);
      alert("Recibos Generados Exitosamente");
      setTimeout(() => {
        refresh();
      }, 1000);
    }
  }, [progress]);

  if (generating) {
    return (
      <Box className={classes.progressContainer}>
        {Math.round(progress) === 100 ? (
          <>
            <ReceiptIcon style={{ fontSize: '3rem', color: '#48bb78', marginBottom: 16 }} />
            <Typography variant="h5" style={{ color: '#48bb78', fontWeight: 600 }}>
              Recibos Generados Exitosamente
            </Typography>
          </>
        ) : (
          <>
            <GenerateIcon style={{ fontSize: '2.5rem', color: '#4299e1', marginBottom: 16 }} />
            <Typography variant="h6" className={classes.progressText}>
              Generando Recibos...
            </Typography>
            <LinearProgress
              style={{ width: '100%', height: 8, borderRadius: 4 }}
              variant="determinate"
              value={progress}
            />
            <Typography variant="body2" style={{ marginTop: 8, color: '#718096' }}>
              {Math.round(progress)}% completado
            </Typography>
          </>
        )}
      </Box>
    );
  }

  const isFormValid = water && electricity && water > 0 && electricity > 0;

  return (
    <Box className={classes.container}>
      <Box className={classes.header}>
        <GenerateIcon className={classes.headerIcon} />
        <Typography variant="h5" className={classes.title}>
          Generar Recibos
        </Typography>
      </Box>
      
      <Grid container spacing={3} className={classes.formGrid}>
        <Grid item xs={12}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              className={classes.dateField}
              variant="dialog"
              openTo="year"
              views={["year", "month"]}
              label="Mes y Año del Recibo"
              value={recieptDate}
              disableFuture
              onChange={setRecieptDate}
            />
          </LocalizationProvider>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            className={classes.utilityField}
            value={water}
            onChange={(e) => setWater(e.target.value)}
            type="number"
            name="water"
            variant="outlined"
            label="Factura de Agua (S/.)"
            placeholder="0.00"
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            className={classes.utilityField}
            value={electricity}
            onChange={(e) => setElectricity(e.target.value)}
            type="number"
            name="electricity"
            variant="outlined"
            label="Factura de Electricidad (S/.)"
            placeholder="0.00"
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Box className={classes.selectionRow}>
            <Button
              onClick={openSelectApts}
              variant="outlined"
              color="primary"
            >
              Seleccionar Apartamentos
            </Button>
            <Box className={classes.selectionInfo}>
              <Chip 
                label={`${selectedApts.length}/${apartments.length} seleccionados`}
                color={selectedApts.length === apartments.length ? 'primary' : 'default'}
                size="small"
              />
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Button
            disabled={!isFormValid}
            onClick={generate}
            variant="contained"
            color="primary"
            size="large"
            className={classes.generateButton}
            fullWidth
          >
            Generar Recibos ({selectedApts.length} apartamentos)
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
