import {
  IconButton,
  makeStyles,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
} from "@material-ui/core";
import {
  CloudDownloadRounded,
  Receipt as ReceiptIcon,
  Delete as DeleteIcon,
} from "@material-ui/icons";
import React from "react";
import Loader from "../../components/Loader";

import DataTable from "../Admin/components/DataTable";
import DeleteModal from "../Admin/components/DeleteModal";
import { deleteReciept, storage, updateUser } from "../../utils/dbRequests";
import SimpleCheckBox from "../Admin/components/SimpleCheckBox";
import { getDownloadURL, ref } from "firebase/storage";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    backgroundColor: "#f8fafc",
    borderRadius: theme.spacing(2),
    maxHeight: "70vh",
    overflow: "auto",
  },
  headerCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2, 3),
  },
  headerIcon: {
    fontSize: "2rem",
    marginRight: theme.spacing(2),
  },
  title: {
    fontWeight: 600,
    color: "white",
    margin: 0,
  },
  subtitle: {
    fontWeight: 400,
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "0.9rem",
    margin: 0,
  },
  dataTableCard: {
    borderRadius: theme.spacing(2),
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
  },
  downloadButton: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    color: "#667eea",
    "&:hover": {
      backgroundColor: "rgba(102, 126, 234, 0.2)",
    },
  },
  deleteButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    "&:hover": {
      backgroundColor: "rgba(239, 68, 68, 0.2)",
    },
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

  // Sort receipts by date (newest first) and add id
  const processedReciepts = reciepts
    .map((r, i) => ({ ...r, id: i }))
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime(); // Newest first
    });

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
      headerName: allowEdit ? "Descargar" : "Descargar",
      width: 120,
      sortable: false,
      renderCell: (params) => {
        return (
          <IconButton
            className={classes.downloadButton}
            size="small"
            onClick={() => {
              downloadFileFromStorage(params.row);
            }}
            title="Descargar recibo"
          >
            <CloudDownloadRounded fontSize="small" />
          </IconButton>
        );
      },
    },
    {
      field: "date",
      headerName: allowEdit ? "Fecha" : "Fecha",
      width: 150,
      renderCell: (params) => {
        return (
          <Chip
            label={new Date(params.value).toLocaleDateString('es-ES')}
            size="small"
            style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}
          />
        );
      },
    },
    {
      field: "name",
      headerName: allowEdit ? "Nombre" : "Nombre",
      width: 160,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" style={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "paid",
      headerName: "Estado",
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
      headerName: "Eliminar",
      sortable: false,
      width: 100,
      renderCell: (params) => (
        <IconButton
          className={classes.deleteButton}
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
          title="Eliminar recibo"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  if (!allowEdit) columns.pop();

  if (!reciepts) return <Loader />;

  return (
    <Box className={classes.root}>
      {/* Header */}
      <Card className={classes.headerCard}>
        <Box className={classes.headerContent}>
          <ReceiptIcon className={classes.headerIcon} />
          <Box>
            <Typography variant="h5" className={classes.title}>
              Gestión de Recibos
            </Typography>
            <Typography variant="body2" className={classes.subtitle}>
              {processedReciepts.length} recibo{processedReciepts.length !== 1 ? 's' : ''} disponible{processedReciepts.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Data Table */}
      <Card className={classes.dataTableCard}>
        <DataTable
          rows={processedReciepts}
          customStyles={{ 
            maxHeight: "50vh",
            overflow: "auto"
          }}
          columns={columns}
        />
      </Card>
    </Box>
  );
}
