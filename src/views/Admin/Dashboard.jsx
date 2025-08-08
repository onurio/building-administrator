import React, { useState } from 'react';
import {
  AppBar,
  CssBaseline,
  Divider,
  Drawer,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Avatar,
} from '@material-ui/core';
import {
  Menu as MenuIcon,
  ExitToApp as ExitToAppIcon,
  Settings as AdminIcon,
  Home as HomeIcon,
  Person as PersonIcon,
} from '@material-ui/icons';
import { makeStyles, useTheme, createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import SimpleModal from './components/SimpleModal';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const createAppTheme = (isAdmin) => createMuiTheme({
  palette: {
    primary: {
      main: isAdmin ? '#1976d2' : '#2563eb',
      dark: isAdmin ? '#1565c0' : '#1d4ed8',
    },
    secondary: {
      main: isAdmin ? '#dc004e' : '#059669',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#718096',
    },
  },
  typography: {
    fontFamily: '"Inter", "Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
    body1: {
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  overrides: {
    MuiDrawer: {
      paper: {
        background: isAdmin 
          ? 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(180deg, #2563eb 0%, #1e40af 50%, #1d4ed8 100%)',
        color: 'white',
      },
    },
    MuiListItem: {
      root: {
        '&$selected': {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderLeft: '4px solid rgba(255, 255, 255, 0.8)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
          },
        },
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          transform: 'translateX(4px)',
        },
        margin: '6px 12px',
        borderRadius: '12px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '12px 16px',
      },
      button: {
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiListItemIcon: {
      root: {
        color: 'white',
        minWidth: '44px',
        fontSize: '1.25rem',
      },
    },
    MuiListItemText: {
      primary: {
        color: 'white',
        fontWeight: 500,
        fontSize: '0.95rem',
      },
    },
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
    backgroundColor: '#ffffff',
    color: '#1a202c',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    borderBottom: '1px solid #e2e8f0',
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
    color: '#4a5568',
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
    width: '100%',
  },
  toolbar: {
    ...theme.mixins.toolbar,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.1)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: theme.spacing(2),
  },
  drawerPaper: {
    width: drawerWidth,
    borderRight: 'none',
    boxShadow: '4px 0 12px -2px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.08)',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(0.25),
    },
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(3, 2, 2),
    color: 'white',
  },
  logoAvatar: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: theme.spacing(1.5),
    fontSize: '1.75rem',
    fontWeight: 'bold',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
  },
  logoText: {
    fontSize: '1.1rem',
    fontWeight: 600,
    textAlign: 'center',
    lineHeight: 1.2,
  },
  logoSubtext: {
    fontSize: '0.8rem',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: theme.spacing(0.5),
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    margin: theme.spacing(1, 2),
  },
  logoutItem: {
    margin: theme.spacing(1, 1, 2),
    borderRadius: '8px',
    backgroundColor: 'rgba(220, 38, 127, 0.2)',
    '&:hover': {
      backgroundColor: 'rgba(220, 38, 127, 0.3)',
    },
  },
  title: {
    flexGrow: 1,
    fontWeight: 600,
    color: '#1a202c',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  contentWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    padding: theme.spacing(4),
    margin: theme.spacing(1, 0),
    border: '1px solid rgba(0, 0, 0, 0.05)',
    [theme.breakpoints.down('sm')]: {
      borderRadius: '4px',
      padding: theme.spacing(1),
      margin: theme.spacing(0.25, 0),
    },
  },
}));

function Dashboard({
  logout,
  title = 'Title',
  window,
  sideItems = [],
  children,
  isAdmin = false,
  userInfo = null,
}) {
  const classes = useStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (link) => {
    if (link === '/admin' || link === '/admin/') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    // Exact match for root path to avoid always being active
    if (link === '/') {
      return location.pathname === '/';
    }
    return location.pathname.includes(link);
  };

  const drawer = (
    <div>
      <Box className={classes.toolbar}>
        <Box className={classes.logoContainer}>
          <Avatar className={classes.logoAvatar}>
            {isAdmin ? <AdminIcon /> : <HomeIcon />}
          </Avatar>
          <Typography className={classes.logoText}>
            {isAdmin ? 'Admin Panel' : 'Portal Residentes'}
          </Typography>
          <Typography className={classes.logoSubtext}>
            Juan del Carpio 104
          </Typography>
          {userInfo && !isAdmin && (
            <Typography className={classes.logoSubtext} style={{ marginTop: 8, fontSize: '0.75rem' }}>
              {userInfo.name} - Apt. {userInfo.apartment?.name || 'N/A'}
            </Typography>
          )}
        </Box>
      </Box>
      
      <List>
        {sideItems.map((sideItem) => (
          <Link className={classes.link} to={sideItem.link} key={sideItem.key}>
            <ListItem 
              button 
              selected={isActive(sideItem.link)}
              className={isActive(sideItem.link) ? 'Mui-selected' : ''}
              onClick={() => setMobileOpen(false)} // Close mobile drawer on item click
            >
              <ListItemIcon>{sideItem.icon}</ListItemIcon>
              <ListItemText primary={sideItem.text} />
            </ListItem>
          </Link>
        ))}
      </List>
      
      <Divider className={classes.divider} />
      
      <ListItem 
        onClick={logout} 
        button 
        className={classes.logoutItem}
        aria-label='cerrar sesión de administrador'
        role='button'
      >
        <ListItemIcon>
          <ExitToAppIcon />
        </ListItemIcon>
        <ListItemText primary='Cerrar Sesión' />
      </ListItem>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  const appTheme = createAppTheme(isAdmin);

  return (
    <ThemeProvider theme={appTheme}>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position='fixed' className={classes.appBar} elevation={0}>
          <Toolbar>
            <IconButton
              aria-label='abrir menú de navegación'
              aria-expanded={mobileOpen}
              aria-controls='navigation-drawer'
              edge='start'
              onClick={handleDrawerToggle}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant='h6' className={classes.title} noWrap>
              {title}
            </Typography>
            <Box className={classes.headerActions}>
              {/* Add any header actions here if needed */}
            </Box>
          </Toolbar>
        </AppBar>
        
        <nav className={classes.drawer} aria-label='navegación principal'>
          <Hidden smUp implementation='css'>
            <Drawer
              container={container}
              variant='temporary'
              anchor={theme.direction === 'rtl' ? 'right' : 'left'}
              open={mobileOpen}
              onClose={handleDrawerToggle}
              classes={{
                paper: classes.drawerPaper,
              }}
              ModalProps={{
                keepMounted: true,
              }}
              PaperProps={{
                id: 'navigation-drawer',
                role: 'dialog',
                'aria-label': 'menú de navegación',
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden xsDown implementation='css'>
            <Drawer
              classes={{
                paper: classes.drawerPaper,
              }}
              variant='permanent'
              open
            >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
        
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Box className={classes.contentWrapper}>
            <SimpleModal>{children}</SimpleModal>
          </Box>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default Dashboard;
