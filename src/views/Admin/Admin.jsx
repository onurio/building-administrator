import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  makeStyles
} from '@material-ui/core';
import { CheckCircle as ApprovalIcon, AttachMoney as MoneyIcon } from '@material-ui/icons';
import { useNavigate } from 'react-router-dom';
import SettingsIcon from "@material-ui/icons/Settings";
import Users from "./Users";
import Apartments from "./Apartments";
import Recibos from "./Reciepts";
import Payments from "./Payments";
import Analytics from "./Analytics";
import { getApartments, getServices, getUsers } from "../../utils/dbRequests";
import { getPendingPaymentCount } from "../../utils/dbRequests/payments";
import Services from "./Services";
import PeopleIcon from "@material-ui/icons/People";
import ApartmentIcon from "@material-ui/icons/Apartment";
import ReceiptIcon from "@material-ui/icons/Receipt";
import PaymentIcon from "@material-ui/icons/Payment";
import LocalLaundryServiceIcon from "@material-ui/icons/LocalLaundryService";
import LaundryUseView from "./LaundryUseView";
import WaterAndElectricityEditor from "./WaterAndElectricityEditor";
import { Equalizer, GraphicEq, Assessment as AnalyticsIcon } from "@material-ui/icons";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { Route, Router, Routes, useLocation } from "react-router";
import AdminLogin from "./AdminLogin";
import analytics from '../../utils/analytics';

const useStyles = makeStyles((theme) => ({
  pendingModal: {
    '& .MuiDialog-paper': {
      borderRadius: '16px',
      padding: theme.spacing(1),
      maxWidth: '500px',
    },
  },
  modalTitle: {
    textAlign: 'center',
    color: '#f59e0b',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
  },
  modalContent: {
    textAlign: 'center',
    padding: theme.spacing(2),
  },
  pendingAmount: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#dc2626',
    marginBottom: theme.spacing(2),
  },
  approvalButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontWeight: 600,
    padding: theme.spacing(1.5, 4),
    borderRadius: theme.spacing(1),
    textTransform: 'none',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    cursor: 'pointer',
    '&:hover': {
      background: 'linear-gradient(135deg, #5569d8 0%, #6a4190 100%)',
      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
    },
  },
  laterButton: {
    color: '#6b7280',
    textTransform: 'none',
    cursor: 'pointer',
  },
}));

let ADMIN_EMAILS = import.meta.env.VITE_ADMIN_EMAILS ?? "";
ADMIN_EMAILS = ADMIN_EMAILS.split(",");
const getBaseSideItems = () => [
  {
    key: "services",
    text: "Servicios",
    link: "services",
    icon: <SettingsIcon />,
  },
  {
    key: "laundry",
    text: "Lavandería",
    link: "laundry",
    icon: <LocalLaundryServiceIcon />,
  },
  {
    key: "users",
    text: "Usuarios",
    link: "users",
    icon: <PeopleIcon />,
  },
  {
    key: "apartments",
    text: "Apartamentos",
    link: "apartments",
    icon: <ApartmentIcon />,
  },
  {
    key: "reciepts",
    text: "Recibos",
    link: "reciepts",
    icon: <ReceiptIcon />,
  },
  {
    key: "payments",
    text: "Pagos",
    link: "payments",
    icon: <PaymentIcon />,
  },
  {
    key: "waterAndElectricity",
    text: "Agua y Electricidad",
    link: "waterandelectricity",
    icon: <Equalizer />,
  },
];

export default function Admin({ auth, storage, currentUser }) {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticaited, setIsAuthenticaited] = useState(false);
  const [apartments, setApartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState();
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  // Create sideItems based on user permissions
  const sideItems = React.useMemo(() => {
    const baseSideItems = getBaseSideItems();
    
    // Add Analytics only for authorized users
    if (userEmail === 'omrinuri@gmail.com' || userEmail === 'alborde86@gmail.com') {
      baseSideItems.push({
        key: "analytics",
        text: "Analytics",
        link: "analytics",
        icon: <AnalyticsIcon />,
      });
    }
    
    return baseSideItems;
  }, [userEmail]);

  // Track page views for admin
  useEffect(() => {
    if (currentUser && location.pathname && isAuthenticaited) {
      const pageName = location.pathname.replace('/admin', '').replace('/', '') || 'dashboard';
      analytics.trackPageView(`admin-${pageName}`, currentUser);
    }
  }, [location.pathname, currentUser, isAuthenticaited]);

  const logout = () => {
    auth
      .signOut()
      .then(function () {
        // Sign-out successful.
        setIsAuthenticaited(false);
      })
      .catch(function (error) {
        // An error happened.
        alert(error);
      });
  };

  useEffect(() => {
    if (auth) {
      auth.onAuthStateChanged(function (user) {
        if (user) {
          if (
            ADMIN_EMAILS.includes(user.email)
          ) {
            setIsAuthenticaited(true);
            setUserEmail(user.email);
          } else {
            setIsAuthenticaited(false);
            setUserEmail(null);
          }
          // User is signed in.
        } else {
          // No user is signed in.
          setIsAuthenticaited(false);
          setUserEmail(null);
        }
      });
    }
  }, [auth]);

  const loadPendingPaymentsCount = async () => {
    try {
      const count = await getPendingPaymentCount();
      setPendingPaymentsCount(count);
    } catch (error) {
      console.error('Error loading pending payments count:', error);
    }
  };

  const refresh = async () => {
    const addIndexes = (arr) => {
      return arr ?? [].map((item, index) => {
        return { ...item, edit: index };
      });
    };
    setApartments(addIndexes(await getApartments()));
    setUsers(addIndexes(await getUsers()));
    setServices(await getServices());
    await loadPendingPaymentsCount();
  };

  useEffect(() => {
    if (isAuthenticaited) {
      refresh();
    }
  }, [isAuthenticaited]);

  // Show modal when pending payments are detected after login
  useEffect(() => {
    if (isAuthenticaited && pendingPaymentsCount > 0) {
      setShowPendingModal(true);
    }
  }, [isAuthenticaited, pendingPaymentsCount]);

  const handleGoToApprovals = () => {
    setShowPendingModal(false);
    navigate('/admin/payments'); // Navigate to payments tab (approvals are tab 3)
  };

  const handleCloseLater = () => {
    setShowPendingModal(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticaited(true);
  };

  if (isAuthenticaited) {
    return (
      <>
        {/* Pending Payments Modal - Global */}
        <Dialog
          open={showPendingModal}
          onClose={handleCloseLater}
          className={classes.pendingModal}
          aria-labelledby="pending-modal-title"
          aria-describedby="pending-modal-description"
        >
          <DialogTitle className={classes.modalTitle} id="pending-modal-title">
            <ApprovalIcon fontSize="large" />
            ¡Pagos Pendientes de Aprobación!
          </DialogTitle>
          <DialogContent className={classes.modalContent}>
            <Typography variant="h6" className={classes.pendingAmount}>
              {pendingPaymentsCount} {pendingPaymentsCount === 1 ? 'pago' : 'pagos'}
            </Typography>
            <Typography variant="body1" style={{ marginBottom: 16 }}>
              Tienes pagos de inquilinos esperando aprobación.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Puedes revisarlos y aprobarlos en la sección de Pagos → Aprobar Pagos.
            </Typography>
          </DialogContent>
          <DialogActions style={{ justifyContent: 'center', padding: 24 }}>
            <Button
              onClick={handleGoToApprovals}
              className={classes.approvalButton}
              startIcon={<ApprovalIcon />}
              size="large"
            >
              Revisar Pagos
            </Button>
            <Button
              onClick={handleCloseLater}
              className={classes.laterButton}
              size="large"
            >
              Más Tarde
            </Button>
          </DialogActions>
        </Dialog>

        <Dashboard
          sideItems={sideItems}
          title="Admin Juan del Carpio 104"
          path="/*"
          logout={logout}
          isAdmin={true}
          pendingPaymentsCount={pendingPaymentsCount}
        >
          <Routes>
            <Route path="/" element={<Services users={users} path="/services" />} />
            <Route path="/services" element={<Services users={users} path="/services" />} />
            <Route path="/laundry" element={<LaundryUseView users={users} path="/laundry" />} />
            <Route path="/users" element={<Users users={users} refresh={refresh} path="/users" auth={auth} storage={storage} />} />
            <Route path="/apartments" element={<Apartments apartments={apartments} users={users} refresh={refresh} path="/apartments" />} />
            <Route path="/reciepts" element={<Recibos apartments={apartments} users={users} storage={storage} services={services} refresh={refresh} path="/reciepts" />} />
            <Route path="/payments" element={<Payments apartments={apartments} users={users} services={services} storage={storage} refresh={refresh} path="/payments" />} />
            <Route path="/waterandelectricity" element={<WaterAndElectricityEditor apartments={apartments} users={users} services={services} refresh={refresh} path="/waterandelectricity" />} />
            {(userEmail === 'omrinuri@gmail.com' || userEmail === 'alborde86@gmail.com') && (
              <Route path="/analytics" element={<Analytics path="/analytics" />} />
            )}
          </Routes>
        </Dashboard>
      </>
    );
  } else {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }
}
