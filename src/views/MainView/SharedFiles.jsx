/* eslint-disable react/display-name */
import { IconButton, makeStyles, Typography } from '@material-ui/core';
import { CloudDownloadRounded } from '@material-ui/icons';
import React, { useState, useEffect } from 'react';
import { getStorage, ref, getMetadata } from 'firebase/storage';
import DataTable from '../Admin/components/DataTable';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  tableContainer: {
    width: '100%',
    height: '500px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
      height: '400px',
    },
  },
  button: {
    maxWidth: 200,
  },
  title: {
    marginBottom: theme.spacing(2.5),
    fontWeight: 600,
    color: '#1a202c',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.5rem',
      marginBottom: theme.spacing(2),
    },
  },
  loadingContainer: {
    textAlign: 'center',
    padding: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3),
    },
  },
}));

export default function SharedFiles({ sharedFiles = [] }) {
  const classes = useStyles();
  const [filesWithDates, setFilesWithDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFileDates = async () => {
      if (!sharedFiles.length) {
        setFilesWithDates([]);
        setLoading(false);
        return;
      }

      const storage = getStorage();
      const filesWithMeta = await Promise.all(
        sharedFiles.map(async (file, index) => {
          try {
            // Extract the file path from the download URL
            const url = new URL(file.url);
            const pathMatch = url.pathname.match(/\/o\/(.+)$/);
            if (!pathMatch) {
              return { ...file, id: index, uploadDate: null };
            }
            
            const filePath = decodeURIComponent(pathMatch[1]);
            const fileRef = ref(storage, filePath);
            const metadata = await getMetadata(fileRef);
            
            return {
              ...file,
              id: index,
              uploadDate: metadata.timeCreated,
            };
          } catch (error) {
            console.warn('Could not get metadata for file:', file.title, error);
            return {
              ...file,
              id: index,
              uploadDate: null,
            };
          }
        })
      );

      // Sort files by upload date (newest first)
      filesWithMeta.sort((a, b) => {
        if (!a.uploadDate) return 1;
        if (!b.uploadDate) return -1;
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      });

      setFilesWithDates(filesWithMeta);
      setLoading(false);
    };

    fetchFileDates();
  }, [sharedFiles]);
  
  const files = filesWithDates;

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'No disponible';
    }
  };

  // Dynamic column widths based on screen size
  const isMobile = window.innerWidth <= 768;
  
  const columns = [
    {
      field: 'title',
      headerName: 'Nombre',
      width: isMobile ? 180 : 300,
      flex: isMobile ? 1 : 0,
    },
    {
      field: 'uploadDate',
      headerName: 'Fecha',
      width: isMobile ? 100 : 160,
      renderCell: (params) => {
        const date = formatDate(params.value);
        return isMobile ? date.split(' ').slice(0, 2).join(' ') : date; // Shorter date on mobile
      },
    },
    {
      field: 'url',
      headerName: 'Descargar',
      width: isMobile ? 80 : 120,
      sortable: false,
      renderCell: (params) => (
        <a href={params.value} target='_blank' rel='noreferrer'>
          <IconButton size={isMobile ? 'small' : 'medium'}>
            <CloudDownloadRounded />
          </IconButton>
        </a>
      ),
    },
  ];

  if (loading) {
    return (
      <div className={classes.root}>
        <Typography variant='h5' className={classes.title}>
          Archivos compartidos
        </Typography>
        <div className={classes.loadingContainer}>
          <Typography>Cargando fechas de archivos...</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <Typography variant='h5' className={classes.title}>
        Archivos compartidos
      </Typography>
      <div className={classes.tableContainer}>
        <DataTable
          rows={files}
          columns={columns}
          customStyles={{ 
            height: isMobile ? 400 : 500,
            border: 'none',
          }}
          pageSize={isMobile ? 5 : 10}
          rowsPerPageOptions={isMobile ? [5, 10] : [10, 25, 50]}
          disableColumnMenu={isMobile}
        />
      </div>
    </div>
  );
}
