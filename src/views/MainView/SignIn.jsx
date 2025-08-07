import React, { useState } from "react";
import {
  Paper,
  Button,
  TextField,
  Typography,
  Box,
  Container,
  createMuiTheme,
  ThemeProvider,
  makeStyles,
  Divider,
  CircularProgress,
} from "@material-ui/core";
import { Home as HomeIcon, Lock as LockIcon, AccountCircle as AccountCircleIcon } from "@material-ui/icons";
import Alert from "@material-ui/lab/Alert";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import PropTypes from "prop-types";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
    padding: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(5),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: theme.spacing(2),
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    width: "100%",
    maxWidth: 400,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(3),
    },
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing(3),
    boxShadow: "0 4px 20px rgba(25, 118, 210, 0.3)",
  },
  logoIcon: {
    color: "white",
    fontSize: 32,
  },
  title: {
    fontWeight: 600,
    color: "#333",
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(4),
    textAlign: "center",
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  textField: {
    marginBottom: theme.spacing(2),
    "& .MuiOutlinedInput-root": {
      borderRadius: theme.spacing(1),
      transition: "all 0.3s ease",
      "&:hover": {
        boxShadow: "0 2px 8px rgba(25, 118, 210, 0.1)",
      },
      "&.Mui-focused": {
        boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
      },
    },
  },
  primaryButton: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
    padding: "12px 24px",
    fontSize: "1rem",
    fontWeight: 500,
    textTransform: "none",
    borderRadius: theme.spacing(1),
    background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
    color: "white",
    boxShadow: "0 4px 15px rgba(25, 118, 210, 0.3)",
    "&:hover": {
      background: "linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)",
      boxShadow: "0 6px 20px rgba(25, 118, 210, 0.4)",
    },
    transition: "all 0.3s ease",
  },
  secondaryButton: {
    marginBottom: theme.spacing(2),
    padding: "12px 24px",
    fontSize: "0.9rem",
    fontWeight: 400,
    textTransform: "none",
    borderRadius: theme.spacing(1),
    border: "2px solid #1976d2",
    color: "#1976d2",
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: "rgba(25, 118, 210, 0.04)",
      borderColor: "#1565c0",
    },
    transition: "all 0.3s ease",
  },
  footerText: {
    marginTop: theme.spacing(2),
    color: theme.palette.text.secondary,
    textAlign: "center",
    fontSize: "0.8rem",
  },
  googleButton: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    padding: "12px 24px",
    fontSize: "1rem",
    fontWeight: 500,
    textTransform: "none",
    borderRadius: theme.spacing(1),
    backgroundColor: "white",
    color: "#333",
    border: "2px solid #dadce0",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    "&:hover": {
      backgroundColor: "#f8f9fa",
      boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
    },
    transition: "all 0.3s ease",
  },
  googleButtonDisabled: {
    backgroundColor: "#f5f5f5 !important",
    color: "#999 !important",
    border: "2px solid #e0e0e0 !important",
  },
  divider: {
    margin: theme.spacing(2, 0),
    position: "relative",
    "&::before": {
      content: '"o"',
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "white",
      padding: theme.spacing(0, 2),
      color: theme.palette.text.secondary,
      fontSize: "0.9rem",
    },
  },
  alert: {
    width: "100%",
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
  },
}));


export default function SignIn({ login, resetPassword }) {
  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signIn = () => {
    login(email, pass);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // The user will be authenticated automatically through Firebase auth state change
      // No need to call login() here as the auth state listener will handle it
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError(error.message || "Error al iniciar sesión con Google. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      signIn();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className={classes.root}>
        <Container maxWidth="sm">
          <Paper elevation={24} className={classes.paper}>
            <Box className={classes.logo}>
              <HomeIcon className={classes.logoIcon} />
            </Box>

            <Typography variant="h4" component="h1" className={classes.title}>
              Bienvenido
            </Typography>

            <Typography variant="subtitle1" className={classes.subtitle}>
              Juan del Carpio 104 - Portal de Residentes
            </Typography>

            {error && (
              <Alert
                severity="error"
                className={classes.alert}
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}

            <Button
              type="button"
              fullWidth
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`${classes.googleButton} ${loading ? classes.googleButtonDisabled : ''}`}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <>
                  <AccountCircleIcon />
                  Continuar con Google
                </>
              )}
            </Button>

            <Divider className={classes.divider} />

            <form className={classes.form} onSubmit={(e) => e.preventDefault()}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Correo Electrónico"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className={classes.textField}
              />
              
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type="password"
                id="password"
                autoComplete="current-password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                onKeyPress={handleKeyPress}
                className={classes.textField}
              />

              <Button
                type="button"
                fullWidth
                onClick={signIn}
                disabled={!email || !pass || !email.trim() || !pass.trim()}
                variant="contained"
                className={classes.primaryButton}
                startIcon={<LockIcon />}
              >
                Iniciar Sesión
              </Button>

              <Button
                type="button"
                fullWidth
                onClick={resetPassword}
                variant="outlined"
                className={classes.secondaryButton}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </form>

            <Typography variant="caption" className={classes.footerText}>
              Portal seguro para residentes del edificio
            </Typography>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
