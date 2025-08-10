import React, { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import { getUserFromEmail } from "../../utils/dbRequests";
import Dashboard from "../Admin/Dashboard";
import Laundry from "./Laundry";
import General from "./General";
import RecibosYPagos from "./RecibosYPagos";
import SignIn from "./SignIn";
import LocalLaundryServiceIcon from "@material-ui/icons/LocalLaundryService";
import PersonIcon from "@material-ui/icons/Person";
import ReceiptIcon from "@material-ui/icons/Receipt";
import PaymentIcon from "@material-ui/icons/Payment";
import { AttachMoney as MoneyIcon } from "@material-ui/icons";
import { Route, Routes, useNavigate } from "react-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  makeStyles
} from '@material-ui/core';
import { getCachedUserDebt } from '../../utils/dbRequests/payments';
import { formatCurrency } from '../Admin/PaymentComponents/utils';

const useStyles = makeStyles((theme) => ({
  debtModal: {
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
  debtAmount: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#dc2626',
    marginBottom: theme.spacing(2),
  },
  paymentButton: {
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

let sideItems = [
  {
    key: "general",
    text: "General",
    link: "/",
    icon: <PersonIcon />,
  },
  {
    key: "recibos-pagos",
    text: "Recibos y Pagos",
    link: "/recibos-pagos",
    icon: <ReceiptIcon />,
  },
  {
    key: "laundry",
    text: "Lavanderia",
    link: "/laundry",
    icon: <LocalLaundryServiceIcon />,
  },
];

export default function MainView({ auth, children }) {
  const classes = useStyles();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticaited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState();
  const [userDebt, setUserDebt] = useState(0);
  const [showDebtModal, setShowDebtModal] = useState(false);

  const logout = () => {
    auth
      .signOut()
      .then(function () {
        // Sign-out successful.
        setIsAuthenticaited(false);
        setLoading(false);
      })
      .catch(function (error) {
        // An error happened.
        alert(error);
      });
  };

  const login = (email, password) => {
    setLoading(true);

    signInWithEmailAndPassword(auth, email, password)
      .then((usr) => {
        setLoading(false);
        console.log(usr);
      })
      .catch(function (error) {
        setLoading(false);
        alert(error.message);
      });
  };

  useEffect(() => {
    if (auth) {
      auth.onAuthStateChanged((user) => {
        console.log("changed", user);
        if (user) {
          getUserFromEmail(user.email).then((data) => {
            console.log(data);
            setUserData(data);
            setIsAuthenticaited(true);
            setLoading(false);
            
            // Load user debt after user data is set
            if (data?.id) {
              loadUserDebt(data.id);
            }
          });
        } else {
          setLoading(false);
        }
      });
    }
  }, [auth]);

  const resetPass = () => {
    let email = prompt("Escribe tu correo aqui, para resetear tu cuenta");
    if (email) {
      auth.sendPasswordResetEmail(email);
    }
  };

  const loadUserDebt = async (userId) => {
    try {
      const debt = await getCachedUserDebt(userId);
      setUserDebt(debt);
      
      // Show modal if user has debt
      if (debt > 0) {
        setShowDebtModal(true);
      }
    } catch (error) {
      console.error('Error loading user debt:', error);
    }
  };

  const handleGoToPayments = () => {
    setShowDebtModal(false);
    navigate('/recibos-pagos');
  };

  const handleCloseLater = () => {
    setShowDebtModal(false);
  };

  if (loading)
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loader />
      </div>
    );

  let enableLaundry = true;

  if (userData) {
    if (userData.services.indexOf("laundry") === -1) {
      enableLaundry = false;
      sideItems = sideItems.filter((item) => item.key !== "laundry");
    }
  }

  console.log(userData);

  if (isAuthenticated && userData) {
    return (
      <>
        {/* Outstanding Debt Modal - Global */}
        <Dialog
          open={showDebtModal}
          onClose={handleCloseLater}
          className={classes.debtModal}
          aria-labelledby="debt-modal-title"
          aria-describedby="debt-modal-description"
        >
          <DialogTitle className={classes.modalTitle} id="debt-modal-title">
            <MoneyIcon fontSize="large" />
            ¡Deuda Pendiente!
          </DialogTitle>
          <DialogContent className={classes.modalContent}>
            <Typography variant="h6" className={classes.debtAmount}>
              {formatCurrency(userDebt)}
            </Typography>
            <Typography variant="body1" style={{ marginBottom: 16 }}>
              Tienes pagos pendientes por realizar.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Puedes realizar el pago ahora utilizando la información bancaria en la sección de Pagos.
            </Typography>
          </DialogContent>
          <DialogActions style={{ justifyContent: 'center', padding: 24 }}>
            <Button
              onClick={handleGoToPayments}
              className={classes.paymentButton}
              startIcon={<PaymentIcon />}
              size="large"
            >
              Ir a Pagos
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
          title={`Edificio Juan del Carpio - ${userData.name} (${
            userData.apartment?.name || "Sin departamento"
          })`}
          path="/*"
          logout={logout}
          isAdmin={false}
          userInfo={userData}
        >
          <Routes>
            <Route path="/" element={<General user={userData} />} />
            <Route path="/recibos-pagos" element={<RecibosYPagos user={userData} refresh={() => loadUserDebt(userData?.id)} handleModal={() => {}} />} />
            {enableLaundry && (
              <Route path="/laundry" element={<Laundry userData={userData} />} />
            )}
          </Routes>
        </Dashboard>
      </>
    );
  } else {
    return (
      <div>
        <SignIn resetPassword={resetPass} login={login} />
      </div>
    );
  }
}
