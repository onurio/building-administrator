import React, { useState } from "react";
import {
  Paper,
  Button,
  Typography,
  Box,
  Container,
  CircularProgress,
  makeStyles,
  createMuiTheme,
  ThemeProvider,
} from "@material-ui/core";
import { AccountCircle as AccountCircleIcon } from "@material-ui/icons";
import Alert from "@material-ui/lab/Alert";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";

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

const ADMIN_EMAILS = process.env.REACT_APP_ADMIN_EMAILS?.split(",") || [];

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(5),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: theme.spacing(2),
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3),
    },
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
  },
  logoText: {
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontWeight: 600,
    color: '#333',
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(4),
    textAlign: 'center',
  },
  alert: {
    width: '100%',
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(1),
  },
  button: {
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 500,
    textTransform: 'none',
    borderRadius: theme.spacing(1),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #5569d8 0%, #6a4190 100%)',
      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
    },
    transition: 'all 0.3s ease',
  },
  buttonDisabled: {
    background: '#ccc !important',
    boxShadow: 'none !important',
  },
  infoBox: {
    marginTop: theme.spacing(4),
    padding: theme.spacing(2),
    backgroundColor: '#f8f9fa',
    borderRadius: theme.spacing(1),
    width: '100%',
  },
  infoText: {
    color: theme.palette.text.secondary,
    display: 'block',
    textAlign: 'center',
    lineHeight: 1.6,
  },
  footerText: {
    marginTop: theme.spacing(3),
    color: theme.palette.text.secondary,
    textAlign: 'center',
  },
  googleIcon: {
    marginRight: theme.spacing(1),
  },
}));

export default function AdminLogin({ onLoginSuccess }) {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (ADMIN_EMAILS.includes(user.email)) {
        onLoginSuccess();
      } else {
        setError(
          "Your Google account is not authorized to access the admin panel."
        );
        auth.signOut();
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.message || "An error occurred during login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className={classes.root}>
        <Container maxWidth="sm">
          <Paper elevation={24} className={classes.paper}>
            <Box className={classes.logo}>
              <Typography variant="h4" className={classes.logoText}>
                A
              </Typography>
            </Box>

            <Typography variant="h4" component="h1" className={classes.title}>
              Admin Access
            </Typography>

            <Typography variant="subtitle1" className={classes.subtitle}>
              Juan del Carpio 104 - Building Administrator
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
              variant="contained"
              fullWidth
              size="large"
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`${classes.button} ${loading ? classes.buttonDisabled : ''}`}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <>
                  <AccountCircleIcon />
                  Sign in with Google
                </>
              )}
            </Button>

            <Box className={classes.infoBox}>
              <Typography variant="caption" className={classes.infoText}>
                This area is restricted to authorized administrators only.
                Please sign in with your approved Google account to continue.
              </Typography>
            </Box>

            <Typography variant="caption" className={classes.footerText}>
              Secure access powered by Google Authentication
            </Typography>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
