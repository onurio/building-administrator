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
import { formatMonthYear } from "../Admin/PaymentComponents/utils";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    backgroundColor: "#f8fafc",
    borderRadius: theme.spacing(2),
    maxHeight: "70vh",
    overflow: "auto",
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(0.5),
      maxHeight: "85vh",
      borderRadius: theme.spacing(1),
    },
  },
  headerCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(1.5),
      borderRadius: theme.spacing(1.5),
    },
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2, 3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.5, 2),
    },
  },
  headerIcon: {
    fontSize: "2rem",
    marginRight: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      fontSize: "1.5rem",
      marginRight: theme.spacing(1.5),
    },
  },
  title: {
    fontWeight: 600,
    color: "white",
    margin: 0,
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.25rem',
    },
  },
  subtitle: {
    fontWeight: 400,
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "0.9rem",
    margin: 0,
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.8rem',
    },
  },
  dataTableCard: {
    borderRadius: theme.spacing(2),
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
    [theme.breakpoints.down('sm')]: {
      borderRadius: theme.spacing(1.5),
    },
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

  // Dynamic column configuration for mobile
  const isMobile = window.innerWidth <= 768;
  
  const columns = [
    {
      field: "url",
      headerName: "Descargar",
      width: isMobile ? 80 : 120,
      sortable: false,
      renderCell: (params) => {
        return (
          <IconButton
            className={classes.downloadButton}
            size={isMobile ? "small" : "small"}
            onClick={() => {
              downloadFileFromStorage(params.row);
            }}
            title="Descargar recibo"
          >
            <CloudDownloadRounded fontSize={isMobile ? "small" : "small"} />
          </IconButton>
        );
      },
    },
    {
      field: "date",
      headerName: "Fecha",
      width: isMobile ? 100 : 150,
      renderCell: (params) => {
        const date = new Date(params.value).toLocaleDateString('es-ES');
        return (
          <Chip
            label={isMobile ? date.slice(0, 5) : date} // Show shorter date on mobile
            size="small"
            style={{ 
              backgroundColor: '#e0e7ff', 
              color: '#3730a3',
              fontSize: isMobile ? '0.7rem' : '0.8rem'
            }}
          />
        );
      },
    },
    {
      field: "name",
      headerName: "Nombre",
      width: isMobile ? 120 : 160,
      flex: isMobile ? 1 : 1,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          style={{ 
            fontWeight: 500,
            fontSize: isMobile ? '0.8rem' : '0.875rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          title={formatMonthYear(params.value)}
        >
          {formatMonthYear(params.value)}
        </Typography>
      ),
    },
    {
      field: "paid",
      headerName: isMobile ? "✓" : "Estado",
      width: isMobile ? 60 : 120,
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
      headerName: isMobile ? "🗑️" : "Eliminar",
      sortable: false,
      width: isMobile ? 60 : 100,
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
            maxHeight: isMobile ? "60vh" : "50vh",
            overflow: "auto"
          }}
          columns={columns}
          pageSize={isMobile ? 5 : 10}
          rowsPerPageOptions={isMobile ? [5, 10] : [10, 25]}
          disableColumnMenu={isMobile}
          density={isMobile ? "compact" : "standard"}
        />
      </Card>
    </Box>
  );
}
