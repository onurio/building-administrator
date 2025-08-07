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
} from '@material-ui/icons';
import { makeStyles, useTheme, createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import SimpleModal from './components/SimpleModal';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const adminTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#1976d2',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
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
    fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
  overrides: {
    MuiDrawer: {
      paper: {
        background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      },
    },
    MuiListItem: {
      root: {
        '&$selected': {
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        },
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        margin: '4px 8px',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
      },
      button: {
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiListItemIcon: {
      root: {
        color: 'white',
        minWidth: '40px',
      },
    },
    MuiListItemText: {
      primary: {
        color: 'white',
        fontWeight: 500,
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
    background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
    borderRight: 'none',
    boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
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
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: theme.spacing(1),
    fontSize: '1.5rem',
    fontWeight: 'bold',
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
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: theme.spacing(3),
    margin: theme.spacing(1, 0),
  },
}));

function Dashboard({
  logout,
  title = 'Title',
  window,
  sideItems = [],
  children,
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
    return location.pathname.includes(link);
  };

  const drawer = (
    <div>
      <Box className={classes.toolbar}>
        <Box className={classes.logoContainer}>
          <Avatar className={classes.logoAvatar}>
            <AdminIcon />
          </Avatar>
          <Typography className={classes.logoText}>
            Admin Panel
          </Typography>
          <Typography className={classes.logoSubtext}>
            Juan del Carpio 104
          </Typography>
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

  return (
    <ThemeProvider theme={adminTheme}>
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
