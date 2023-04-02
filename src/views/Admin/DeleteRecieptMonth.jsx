import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from "@material-ui/core";
import React, { useState, useContext } from "react";
import Loader from "../../components/Loader";
import { deleteAllRecieptsFromMonth } from "../../utils/dbRequests";
import DeleteModal from "./components/DeleteModal";
import { ModalContext } from "./components/SimpleModal";

export default function DeleteRecieptMonth({
  refreshAll,
  recieptsMonths,
  refreshMonths,
}) {
  const [selectedMonth, setSelectedMonth] = useState();
  const handleModal = useContext(ModalContext);

  const onDelete = () => {
    const onSave = async () => {
      handleModal(<Loader />, { hideExit: true });
      await deleteAllRecieptsFromMonth(selectedMonth);
      setTimeout(() => {
        refreshMonths();
        refreshAll();
        handleModal();
      }, 500);
    };
    handleModal(<DeleteModal onCancel={() => handleModal()} onSave={onSave} />);
  };

  if (!recieptsMonths || recieptsMonths?.length === 0) return null;

  return (
    <Paper
      style={{
        width: "100%",
        minWidth: 400,
        marginLeft: 20,
        maxWidth: 300,
        padding: 20,
      }}
    >
      <h2 style={{ marginBottom: 50 }}>Delete Reciepts By Month</h2>
      <Grid spacing={3} xs={12} container>
        <Grid style={{ margin: "20px 0" }} xs={12}>
          <FormControl style={{ width: 200 }}>
            <InputLabel id="months">Months</InputLabel>
            <Select
              labelId="months"
              id="months"
              onChange={(e) => setSelectedMonth(e.target.value)}
              variant="outlined"
              value={selectedMonth}
            >
              {recieptsMonths.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid xs={12}>
          <Button
            disabled={!selectedMonth}
            onClick={onDelete}
            style={{ margin: 20 }}
            variant="contained"
            color="primary"
          >
            Delete All Reciepts
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
