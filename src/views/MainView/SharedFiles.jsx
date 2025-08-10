/* eslint-disable react/display-name */
import { IconButton, makeStyles, Typography, Chip } from '@material-ui/core';
import { CloudDownloadRounded, AccountBalance as BankIcon } from '@material-ui/icons';
import React, { useState, useEffect } from 'react';
import { getStorage, ref, getMetadata, listAll, getDownloadURL } from 'firebase/storage';
import DataTable from '../Admin/components/DataTable';
import { getPaymentsByUser } from '../../utils/dbRequests/payments';

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
  sunatChip: {
    backgroundColor: '#1e40af',
    color: 'white',
    fontWeight: 500,
    fontSize: '0.75rem',
    height: '20px',
    '& .MuiChip-icon': {
      color: 'white',
    },
  },
}));

export default function SharedFiles({ sharedFiles = [], userId }) {
  const classes = useStyles();
  const [filesWithDates, setFilesWithDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllFiles = async () => {
      setLoading(true);
      const storage = getStorage();
      const allFiles = [];

      try {
        // Process shared files
        if (sharedFiles.length > 0) {
          const sharedFilesWithMeta = await Promise.all(
            sharedFiles.map(async (file, index) => {
              try {
                const url = new URL(file.url);
                const pathMatch = url.pathname.match(/\/o\/(.+)$/);
                if (!pathMatch) {
                  return { ...file, id: `shared-${index}`, uploadDate: null, type: 'shared' };
                }
                
                const filePath = decodeURIComponent(pathMatch[1]);
                const fileRef = ref(storage, filePath);
                const metadata = await getMetadata(fileRef);
                
                return {
                  ...file,
                  id: `shared-${index}`,
                  uploadDate: metadata.timeCreated,
                  type: 'shared',
                };
              } catch (error) {
                console.warn('Could not get metadata for shared file:', file.title, error);
                return {
                  ...file,
                  id: `shared-${index}`,
                  uploadDate: null,
                  type: 'shared',
                };
              }
            })
          );
          allFiles.push(...sharedFilesWithMeta);
        }

        // Fetch payment vouchers if userId is provided
        if (userId) {
          try {
            const paymentVouchersRef = ref(storage, `payment-vouchers/${userId}`);
            const receiptFolders = await listAll(paymentVouchersRef);
            
            for (const receiptFolder of receiptFolders.prefixes) {
              const voucherFiles = await listAll(receiptFolder);
              
              for (const voucherFile of voucherFiles.items) {
                try {
                  const metadata = await getMetadata(voucherFile);
                  const downloadURL = await getDownloadURL(voucherFile);
                  
                  // Extract receipt month from folder name
                  const receiptMonth = receiptFolder.name;
                  
                  allFiles.push({
                    id: `voucher-${voucherFile.name}`,
                    title: `Comprobante SUNAT - ${receiptMonth}`,
                    url: downloadURL,
                    uploadDate: metadata.timeCreated,
                    type: 'sunat',
                  });
                } catch (error) {
                  console.warn('Could not get payment voucher metadata:', voucherFile.name, error);
                }
              }
            }
          } catch (error) {
            console.warn('Could not fetch payment vouchers:', error);
          }
        }

        // Sort all files by upload date (newest first)
        allFiles.sort((a, b) => {
          if (!a.uploadDate) return 1;
          if (!b.uploadDate) return -1;
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        });

        setFilesWithDates(allFiles);
      } catch (error) {
        console.error('Error fetching files:', error);
        setFilesWithDates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllFiles();
  }, [sharedFiles, userId]);
  
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
      width: isMobile ? 140 : 250,
      flex: isMobile ? 1 : 0,
      renderCell: (params) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
            {params.value}
          </span>
          {params.row.type === 'sunat' && (
            <Chip
              icon={<BankIcon />}
              label="SUNAT"
              size="small"
              className={classes.sunatChip}
            />
          )}
        </div>
      ),
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
