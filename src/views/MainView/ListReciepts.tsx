import { IconButton, makeStyles, Typography } from "@material-ui/core";
import { CloudDownloadRounded } from "@material-ui/icons";
import React from "react";
import Loader from "../../components/Loader";

import DataTable from "../Admin/components/DataTable";
import DeleteModal from "../Admin/components/DeleteModal";
import DeleteIcon from "@material-ui/icons/Delete";
import { deleteReciept, storage, updateUser } from "../../utils/dbRequests";
import SimpleCheckBox from "../Admin/components/SimpleCheckBox";
import { getDownloadURL, ref } from "firebase/storage";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexGrow: 1,

    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "center",
    justifyContent: "flex-start",
  },
  button: {
    maxWidth: 200,
  },
}));

export default function Reciepts({
  handleModal = () => {},
  user,
  refresh,
  allowEdit = false,
}) {
  const classes = useStyles();
  const reciepts = user.reciepts;

  const processedReciepts = reciepts.map((r, i) => ({ ...r, id: i }));

  const onDelete = async (reciept) => {
    await deleteReciept(user, reciept);
  };

  const downloadFileFromStorage = async (reciept) => {
    const storageRef = ref(storage, reciept.url);
    const url = await getDownloadURL(storageRef);
    window.open(url, "_blank");
  };

  const handleChangePaid = async (reciept, isPaid) => {
    const recieptIndex = reciept.id;
    const updatedReciept = { ...user.reciepts[recieptIndex], paid: isPaid };
    const newReciepts = user.reciepts;
    newReciepts[recieptIndex] = updatedReciept;
    const updatedUser = { ...user, reciepts: [...newReciepts] };
    await updateUser(updatedUser);
    await refresh();
  };

  const columns = [
    {
      field: "url",
      headerName: allowEdit ? "Download" : "Descargar",
      width: 120,
      sortable: false,
      renderCell: (params) => {
        return (
          <a
            onClick={() => {
              downloadFileFromStorage(params.row);
            }}
            target="_blank"
            rel="noreferrer"
          >
            <IconButton>
              <CloudDownloadRounded />
            </IconButton>
          </a>
        );
      },
    },
    {
      field: "date",
      headerName: allowEdit ? "Date" : "Fecha",
      width: 140,
      renderCell: (params) => {
        return new Date(params.value).toDateString();
      },
    },
    {
      field: "name",
      headerName: allowEdit ? "Name" : "Nombre",
      width: 120,
    },

    {
      field: "paid",
      headerName: "Pagado",
      width: 120,
      renderCell: (params) => {
        return (
          <SimpleCheckBox
            editable={allowEdit}
            defaultChecked={params.value}
            onChange={(isPaid) => handleChangePaid(params.row, isPaid)}
          />
        );
      },
    },
    {
      field: "id",
      headerName: "Delete",
      sortable: false,
      width: 100,
      renderCell: (params) => (
        <IconButton
          variant="contained"
          color="primary"
          size="small"
          onClick={() =>
            handleModal(
              <DeleteModal
                onCancel={() => handleModal()}
                onSave={async () => {
                  await onDelete(params.row);
                  handleModal();
                }}
              />
            )
          }
          style={{ marginLeft: 16 }}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  if (!allowEdit) columns.pop();

  if (!reciepts) return <Loader />;

  return (
    <div>
      <Typography style={{ margin: "20px 0" }} variant="h3">
        Recibos
      </Typography>
      <div className={classes.root}>
        <div
          style={{
            width: "100%",
            maxWidth: 800,
          }}
        >
          <h2 style={{ marginBottom: 20 }}>Recibos anteriors</h2>
          <DataTable
            rows={processedReciepts}
            customStyles={{ maxWidth: 800, maxHeight: 500 }}
            columns={columns}
          />
        </div>
      </div>
    </div>
  );
}
