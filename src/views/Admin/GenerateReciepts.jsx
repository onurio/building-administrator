import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import {
  Button,
  Grid,
  Paper,
  TextField,
  LinearProgress,
  Typography,
} from "@material-ui/core";
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

export default function GenerateReciepts({
  apartments,
  users,
  storage,
  services,
  refresh,
}) {
  const [water, setWater] = useState();
  const [electricity, setElectricity] = useState();
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
          label="Select Apartments"
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
      expectedIncome: 0,
      laundryIncome: 0,
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

      monthReport.expectedIncome += reciept.total;
      monthReport.laundryIncome += reciept.laundryTotal || 0;

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
        newReciepts.push({
          date: date.toISOString(),
          name: monthYear,
          url,
          paid: false,
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
      alert("Generated Successfully");
      setTimeout(() => {
        refresh();
      }, 1000);
    }
  }, [progress]);

  if (generating) {
    return (
      <Paper
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          padding: 20,
        }}
      >
        {Math.round(progress) === 100 ? (
          <h2>Generated Successfully</h2>
        ) : (
          <>
            <Typography variant="subtitle1">Generating reciepts</Typography>
            <LinearProgress
              style={{ width: "100%" }}
              variant="determinate"
              value={progress}
            />
          </>
        )}
      </Paper>
    );
  }

  return (
    <Paper style={{ width: "100%", minWidth: 400, maxWidth: 500, padding: 20 }}>
      <h2 style={{ marginBottom: 50 }}>Generate Invoices</h2>
      <Grid spacing={3} xs={12} container>
        <Grid style={{ margin: "20px 0" }} xs={12}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              variant="dialog"
              openTo="year"
              views={["year", "month"]}
              label="Invoice Month && Year"
              value={recieptDate}
              disableFuture
              onChange={setRecieptDate}
            />
          </LocalizationProvider>
        </Grid>
        <Grid xs={6}>
          <TextField
            onChange={(e) => setWater(e.target.value)}
            type="number"
            name="water"
            variant="outlined"
            label="Water bill (./S)"
          />
        </Grid>
        <Grid xs={6}>
          <TextField
            onChange={(e) => setElectricity(e.target.value)}
            type="number"
            name="electricity"
            variant="outlined"
            label="Electricity bill (./S)"
          />
        </Grid>
        <Grid xs={12}>
          <Button
            onClick={openSelectApts}
            style={{ margin: 20 }}
            variant="contained"
            color="primary"
          >
            Select Apartments
          </Button>
          <div>
            {selectedApts.length}/{apartments.length} apartments selected
          </div>
        </Grid>

        <Grid xs={12}>
          <Button
            disabled={electricity && water ? false : true}
            onClick={generate}
            style={{ margin: 20 }}
            variant="contained"
            color="primary"
          >
            Generate Reciepts
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
