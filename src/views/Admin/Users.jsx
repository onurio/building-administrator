/* eslint-disable react/display-name */
import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  makeStyles,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Switch,
  Chip,
  CircularProgress,
} from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Receipt as ReceiptIcon,
  Folder as FolderIcon,
} from "@material-ui/icons";
import DataTable from "./components/DataTable";
import UserEdit from "./UserEdit";
import { ModalContext } from "./components/SimpleModal";
import { saveUser, deleteUser, updateUser } from "../../utils/dbRequests";
import { getCachedUserDebt, invalidateAllDebtCache } from "../../utils/dbRequests/payments";
import DeleteModal from "./components/DeleteModal";
import FileUploader from "./components/FileUploader";
import AdminReceiptManager from "./components/AdminReceiptManager";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { useToast } from "../../components/Toast";
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
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    color: "#718096",
    marginBottom: theme.spacing(3),
  },
  statsCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
  statsContent: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(3),
  },
  statsIcon: {
    fontSize: "3rem",
    marginRight: theme.spacing(2),
  },
  statsText: {
    flex: 1,
  },
  statsValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "white",
  },
  statsLabel: {
    fontSize: "1rem",
    opacity: 0.9,
    color: "white",
  },
  controlsCard: {
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  controlsContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      gap: theme.spacing(2),
      alignItems: "stretch",
    },
  },
  primaryButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    fontWeight: 500,
    padding: "12px 24px",
    borderRadius: theme.spacing(1),
    textTransform: "none",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
    "&:hover": {
      background: "linear-gradient(135deg, #5569d8 0%, #6a4190 100%)",
      boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
    },
    transition: "all 0.3s ease",
  },
  toggleContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2),
    backgroundColor: "#f7fafc",
    borderRadius: theme.spacing(1),
    border: "1px solid #e2e8f0",
  },
  toggleText: {
    fontSize: "0.9rem",
    color: "#4a5568",
    fontWeight: 500,
  },
  dataTableCard: {
    borderRadius: theme.spacing(2),
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
  },
}));

export default function Users({ storage, auth, users, refresh }) {
  const classes = useStyles();
  const handleModal = useContext(ModalContext);
  const [hideShow, setHideShow] = useState(() => {
    // Load from localStorage or default to true
    const saved = localStorage.getItem('users-table-show-all-columns');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [loading, setLoading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState({});
  const [userDebts, setUserDebts] = useState({});
  const [loadingDebts, setLoadingDebts] = useState(true);
  const { showSuccess, showError, ToastComponent } = useToast();

  // Save to localStorage whenever hideShow changes
  useEffect(() => {
    localStorage.setItem('users-table-show-all-columns', JSON.stringify(hideShow));
  }, [hideShow]);

  // Load dynamic debt for all users
  useEffect(() => {
    const loadDebts = async () => {
      if (!users || users.length === 0) {
        setLoadingDebts(false);
        return;
      }
      
      setLoadingDebts(true);
      
      // Clear cache to force recalculation with updated logic
      invalidateAllDebtCache();
      
      const debts = {};
      
      // Load debts for all users in parallel
      await Promise.all(
        users.map(async (user) => {
          try {
            const debt = await getCachedUserDebt(user.id);
            debts[user.id] = debt;
          } catch (error) {
            console.error(`Error loading debt for user ${user.id}:`, error);
            debts[user.id] = 0;
          }
        })
      );
      
      setUserDebts(debts);
      setLoadingDebts(false);
    };
    
    loadDebts();
  }, [users]);

  const openDownloads = (user) => {
    setLoadingFiles({...loadingFiles, [user.id]: true});
    handleModal(
      <FileUploader
        path={`${user.name.toLowerCase().replace(/ /g, "_")}_${
          user.id
        }/shared_files`}
        files={user.shared_files}
        onChange={(files) => {
          updateUser({ ...user, shared_files: files });
          refresh();
        }}
        title="Shared Files"
        storage={storage}
      />
    );
    // Clear loading state after a short delay to allow modal to appear
    setTimeout(() => {
      setLoadingFiles({...loadingFiles, [user.id]: false});
    }, 500);
  };

  const openRecieptsModal = (user) => {
    handleModal(
      <div style={{ width: 800, maxWidth: "90vw", height: 600 }}>
        <AdminReceiptManager
          handleModal={handleModal}
          refresh={refresh}
          user={user}
        />
      </div>
    );
  };

  const columns = [
    {
      field: "name",
      headerName: "Nombre",
      width: 200,
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
    },
    {
      field: "apartment",
      headerName: "Apartamento",
      width: 120,
      sortable: true,
      sortComparator: (v1, v2) => {
        const name1 = v1?.name || "ZZZ"; // Put "No asignado" at the end
        const name2 = v2?.name || "ZZZ";
        return name1.localeCompare(name2);
      },
      renderCell: (params) => (
        <Chip
          label={params.value?.name || "No asignado"}
          variant={params.value?.name ? "default" : "outlined"}
          size="small"
          color={params.value?.name ? "primary" : "default"}
        />
      ),
    },
    {
      field: "services",
      headerName: "Servicios",
      width: 180,
    },
    {
      field: "dni_ruc",
      headerName: "DNI/RUC",
      width: 150,
    },
    {
      field: "debt",
      headerName: "Deuda",
      width: 110,
      renderCell: (params) => {
        const debt = userDebts[params.row.id] || 0;
        return loadingDebts ? (
          <CircularProgress size={20} />
        ) : (
          <Chip
            label={`S/.${debt.toFixed(2)}`}
            color={debt > 0 ? "secondary" : "default"}
            size="small"
          />
        );
      },
    },
    {
      field: "deposit",
      headerName: "Depósito",
      width: 120,
      renderCell: (params) => `S/.${params.value || 0}`,
    },
    {
      field: "tel",
      headerName: "Teléfono",
      width: 110,
    },
    {
      field: "telEmergency",
      headerName: "Tel. Emerg.",
      width: 110,
    },
    {
      field: "contract_start",
      headerName: "Inicio Contrato",
      width: 150,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString('es-ES') : '-',
    },
    {
      field: "contract_end",
      headerName: "Fin Contrato",
      width: 150,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString('es-ES') : '-',
    },
    {
      field: "shared_files",
      headerName: "Archivos",
      sortable: false,
      width: 140,
      renderCell: (params) => (
        <Button
          onClick={() => openDownloads(params.row)}
          variant="outlined"
          size="small"
          startIcon={loadingFiles[params.row.id] ? <CircularProgress size={16} /> : <FolderIcon />}
          color="primary"
          disabled={loadingFiles[params.row.id]}
        >
          {params.value?.length || 0}
        </Button>
      ),
    },
    {
      field: "reciepts",
      headerName: "Recibos",
      sortable: false,
      width: 140,
      renderCell: (params) => (
        <Button
          onClick={() => openRecieptsModal(params.row || {})}
          variant="outlined"
          size="small"
          startIcon={<ReceiptIcon />}
          color="primary"
        >
          {params.value?.length || 0}
        </Button>
      ),
    },
    {
      field: "actions",
      headerName: "Acciones",
      sortable: false,
      width: 140,
      renderCell: (params) => (
        <Box style={{ display: 'flex', gap: '4px' }}>
          <IconButton
            color="primary"
            size="small"
            onClick={() => openAdd(params.row)}
            title="Editar"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="secondary"
            size="small"
            onClick={() =>
              handleModal(
                <DeleteModal
                  onCancel={() => handleModal()}
                  onSave={() => {
                    onDelete(params.row.id);
                    handleModal();
                  }}
                />
              )
            }
            title="Eliminar"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (!hideShow) {
    columns.splice(4, 7);
  }

  const onSave = async (info, isEdit) => {
    setLoading(true);
    try {
      if (!isEdit) {
        await createUserWithEmailAndPassword(auth, info.email.toLowerCase(), "12345678");
        await saveUser(info);
        showSuccess("Usuario creado exitosamente");
      } else {
        await updateUser(info);
        showSuccess("Usuario actualizado exitosamente");
      }
      handleModal();
      await refresh();
    } catch (error) {
      console.error("Error saving user:", error);
      showError(`Error al ${isEdit ? 'actualizar' : 'crear'} usuario: ${error.message}`);
      handleModal();
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    setLoading(true);
    try {
      await deleteUser(id);
      showSuccess("Usuario eliminado exitosamente");
      await refresh();
    } catch (error) {
      console.error("Error deleting user:", error);
      showError(`Error al eliminar usuario: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = (user) => {
    handleModal(
      <UserEdit user={user} onSave={onSave} onCancel={() => handleModal()} />
    );
  };

  if (loading) {
    return (
      <Box className={classes.root}>
        <Loader />
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <ToastComponent />
      
      {/* Header Section */}
      <Box className={classes.header}>
        <Typography variant="h4" className={classes.title}>
          Gestión de Usuarios
        </Typography>
        <Typography variant="subtitle1" className={classes.subtitle}>
          Administra los usuarios del edificio, sus contratos y asignaciones
        </Typography>
      </Box>

      {/* Stats Card */}
      <Card className={classes.statsCard}>
        <Box className={classes.statsContent}>
          <PeopleIcon className={classes.statsIcon} />
          <Box className={classes.statsText}>
            <Typography className={classes.statsValue}>
              {users.length}
            </Typography>
            <Typography className={classes.statsLabel}>
              Usuarios Registrados
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Controls Card */}
      <Card className={classes.controlsCard}>
        <Box className={classes.controlsContainer}>
          <Button
            onClick={() => openAdd()}
            className={classes.primaryButton}
            startIcon={<PersonAddIcon />}
            size="large"
          >
            Agregar Usuario
          </Button>
          
          <Box className={classes.toggleContainer}>
            {hideShow ? <VisibilityIcon /> : <VisibilityOffIcon />}
            <Typography className={classes.toggleText}>
              {hideShow ? "Todas las columnas" : "Columnas esenciales"}
            </Typography>
            <Switch
              checked={hideShow}
              onChange={(e) => setHideShow(e.target.checked)}
              color="primary"
              size="small"
            />
          </Box>
        </Box>
      </Card>

      {/* Data Table Card */}
      <Card className={classes.dataTableCard}>
        <DataTable rows={users.sort((a, b) => a.name.localeCompare(b.name))} columns={columns} />
      </Card>
    </Box>
  );
}
