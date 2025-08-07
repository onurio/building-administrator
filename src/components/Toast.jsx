import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  SnackbarContent,
  Slide,
  makeStyles,
  IconButton,
} from '@material-ui/core';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  success: {
    backgroundColor: '#10b981',
    color: '#ffffff',
  },
  error: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
  },
  warning: {
    backgroundColor: '#f59e0b',
    color: '#ffffff',
  },
  info: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  icon: {
    fontSize: 20,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
}));

function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

const Toast = ({ 
  open, 
  message, 
  severity = 'success', 
  onClose, 
  autoHideDuration = 4000 
}) => {
  const classes = useStyles();

  const getIcon = (severity) => {
    switch (severity) {
      case 'success':
        return <SuccessIcon className={classes.icon} />;
      case 'error':
        return <ErrorIcon className={classes.icon} />;
      case 'warning':
        return <WarningIcon className={classes.icon} />;
      case 'info':
        return <InfoIcon className={classes.icon} />;
      default:
        return <InfoIcon className={classes.icon} />;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      TransitionComponent={SlideTransition}
    >
      <SnackbarContent
        className={classes[severity]}
        message={
          <span className={classes.message}>
            {getIcon(severity)}
            {message}
          </span>
        }
        action={
          <IconButton size="small" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        }
      />
    </Snackbar>
  );
};

// Hook for managing toast state
export const useToast = () => {
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showToast = (message, severity = 'success') => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      open: false,
    }));
  };

  const showSuccess = (message) => showToast(message, 'success');
  const showError = (message) => showToast(message, 'error');
  const showWarning = (message) => showToast(message, 'warning');
  const showInfo = (message) => showToast(message, 'info');

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastComponent: () => (
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={hideToast}
      />
    ),
  };
};

export default Toast;