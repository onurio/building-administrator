// Common styles and theme constants for consistent UI across the application

export const colors = {
  primary: '#667eea',
  primaryDark: '#5569d8',
  secondary: '#764ba2',
  background: '#f8fafc',
  paper: '#ffffff',
  textPrimary: '#1a202c',
  textSecondary: '#718096',
  border: '#e2e8f0',
  error: '#dc004e',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
};

export const shadows = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

export const gradients = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  secondary: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
};

// Common style mixins
export const commonStyles = (theme) => ({
  // Page layout
  pageRoot: {
    padding: theme.spacing(3),
    backgroundColor: colors.background,
    minHeight: '100vh',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  
  pageHeader: {
    marginBottom: theme.spacing(4),
  },
  
  pageTitle: {
    fontWeight: 600,
    color: colors.textPrimary,
    marginBottom: theme.spacing(1),
  },
  
  pageSubtitle: {
    color: colors.textSecondary,
    marginBottom: theme.spacing(3),
  },

  // Cards
  statsCard: {
    background: gradients.primary,
    color: 'white',
    marginBottom: theme.spacing(3),
    borderRadius: borderRadius.lg,
    boxShadow: shadows.lg,
  },
  
  contentCard: {
    marginBottom: theme.spacing(3),
    borderRadius: borderRadius.lg,
    boxShadow: shadows.md,
  },
  
  dataTableCard: {
    borderRadius: borderRadius.lg,
    boxShadow: shadows.md,
    overflow: 'hidden',
  },

  // Buttons
  primaryButton: {
    background: gradients.primary,
    color: 'white',
    fontWeight: 500,
    padding: '12px 24px',
    borderRadius: borderRadius.md,
    textTransform: 'none',
    boxShadow: `0 4px 15px rgba(102, 126, 234, 0.3)`,
    '&:hover': {
      background: 'linear-gradient(135deg, #5569d8 0%, #6a4190 100%)',
      boxShadow: `0 6px 20px rgba(102, 126, 234, 0.4)`,
    },
    transition: 'all 0.3s ease',
  },
  
  secondaryButton: {
    backgroundColor: 'transparent',
    color: colors.primary,
    border: `1px solid ${colors.primary}`,
    fontWeight: 500,
    padding: '10px 20px',
    borderRadius: borderRadius.md,
    textTransform: 'none',
    '&:hover': {
      backgroundColor: `${colors.primary}08`,
    },
    transition: 'all 0.3s ease',
  },

  // Form controls
  formContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      gap: theme.spacing(2),
      alignItems: 'stretch',
    },
  },
  
  toggleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2),
    backgroundColor: '#f7fafc',
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.border}`,
  },
  
  toggleText: {
    fontSize: '0.9rem',
    color: colors.textSecondary,
    fontWeight: 500,
  },

  // Responsive utilities
  mobileHidden: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  
  desktopHidden: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  
  // Loading states
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    width: '100%',
  },

  // Focus states for accessibility
  focusVisible: {
    '&:focus-visible': {
      outline: `2px solid ${colors.primary}`,
      outlineOffset: '2px',
    },
  },
});

// Typography variants
export const typography = {
  h1: {
    fontSize: '2.25rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '1.875rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  gradients,
  commonStyles,
  typography,
};