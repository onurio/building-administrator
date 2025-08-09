import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  makeStyles,
  Tooltip,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {
  CloudUpload as UploadIcon,
  FileCopy as CopyIcon,
  Receipt as ReceiptIcon,
  Assignment as DocumentIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
} from '@material-ui/icons';
import { getApartmentName, formatMonthYear } from './utils';
import { updateUser } from '../../../utils/dbRequests';
import { deleteObject, ref as storageRef } from 'firebase/storage';

const useStyles = makeStyles((theme) => ({
  formCard: {
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    marginBottom: theme.spacing(3),
  },
  formSection: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: '#2d3748',
    display: 'flex',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  tableContainer: {
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    marginBottom: theme.spacing(3),
  },
  uploadButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontWeight: 600,
    padding: theme.spacing(1.5, 4),
    borderRadius: theme.spacing(1),
    textTransform: 'none',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #5569d8 0%, #6a4190 100%)',
      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
    },
    '&:disabled': {
      background: '#cbd5e0',
      color: '#a0aec0',
      boxShadow: 'none',
    },
  },
  copyButton: {
    color: theme.palette.primary.main,
    padding: theme.spacing(0.5),
  },
  userChip: {
    backgroundColor: '#667eea',
    color: 'white',
    fontWeight: 500,
  },
  receiptChip: {
    backgroundColor: '#48bb78',
    color: 'white',
    fontWeight: 500,
  },
  uploadArea: {
    border: `2px dashed ${theme.palette.primary.main}`,
    borderRadius: theme.spacing(2),
    padding: theme.spacing(4),
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    '&:hover': {
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      borderColor: theme.palette.primary.dark,
    },
  },
  fileInput: {
    display: 'none',
  },
}));

export default function TaxDocumentsUpload({ users, storage, onUpload, loading, refresh }) {
  const classes = useStyles();
  
  // Filter states
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Get users who need tax documents
  const eligibleUsers = users?.filter(user => user.needs_tax_docs) || [];
  
  // Get receipts for selected user
  const userReceipts = React.useMemo(() => {
    if (!selectedUser) return [];
    const user = eligibleUsers.find(u => u.id === selectedUser);
    return user?.reciepts?.filter(receipt => receipt.total > 0) || [];
  }, [selectedUser, eligibleUsers]);
  
  // Get selected user data
  const selectedUserData = eligibleUsers.find(u => u.id === selectedUser);
  
  // Get existing tax documents for all eligible users
  const existingDocuments = React.useMemo(() => {
    const docs = [];
    eligibleUsers.forEach(user => {
      if (user.tax_documents && user.tax_documents.length > 0) {
        user.tax_documents.forEach(doc => {
          docs.push({
            ...doc,
            userId: user.id,
            userName: user.name,
            userDniRuc: user.dni_ruc,
            apartmentName: getApartmentName(user),
          });
        });
      }
    });
    return docs.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  }, [eligibleUsers]);
  
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type (PDF only for tax documents)
      if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF para documentos tributarios');
        return;
      }
      setSelectedFile(file);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedUser || !selectedReceipt || !selectedFile) {
      alert('Por favor complete todos los campos');
      return;
    }
    
    const user = selectedUserData;
    const receipt = userReceipts.find(r => r.name === selectedReceipt);
    
    if (!user || !receipt) {
      alert('Usuario o recibo no válido');
      return;
    }
    
    // Generate the filename: sunat-{month}-{year}-{user_name}.pdf
    const [month, year] = receipt.name.split(' ');
    const cleanUserName = user.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const filename = `sunat-${month.toLowerCase()}-${year}-${cleanUserName}.pdf`;
    
    const documentData = {
      userId: user.id,
      receiptName: receipt.name,
      filename,
      originalFilename: selectedFile.name,
      uploadDate: new Date().toISOString(),
      uploadedBy: 'admin',
    };
    
    try {
      await onUpload(documentData, selectedFile);
      
      // Reset form
      setSelectedFile(null);
      setSelectedReceipt('');
      // Keep user selected for convenience
      
      // Clear file input
      const fileInput = document.getElementById('tax-file-input');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error uploading tax document:', error);
      alert('Error al subir el documento. Por favor intente nuevamente.');
    }
  };
  
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
    });
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleDownload = (doc) => {
    if (doc.downloadURL) {
      window.open(doc.downloadURL, '_blank');
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`¿Está seguro que desea eliminar el documento ${doc.filename}?`)) {
      return;
    }

    try {
      // Delete from storage
      if (doc.storagePath) {
        const fileRef = storageRef(storage, doc.storagePath);
        await deleteObject(fileRef);
      }

      // Update user data - remove the document
      const user = users.find(u => u.id === doc.userId);
      if (user) {
        const updatedTaxDocuments = (user.tax_documents || []).filter(
          d => !(d.filename === doc.filename && d.receiptName === doc.receiptName)
        );

        await updateUser({
          ...user,
          tax_documents: updatedTaxDocuments,
        });

        // Refresh data
        if (refresh) {
          await refresh();
        }
      }
    } catch (error) {
      console.error('Error deleting tax document:', error);
      alert('Error al eliminar el documento. Por favor intente nuevamente.');
    }
  };
  
  return (
    <Box>
      {/* Upload Form */}
      <Card className={classes.formCard}>
        <CardContent>
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <DocumentIcon className={classes.sectionIcon} />
              Subir Documentos Tributarios SUNAT
            </Typography>
            
            {eligibleUsers.length === 0 && (
              <Alert severity="info">
                No hay usuarios configurados para requerir documentos tributarios. 
                Configure la opción &quot;Requiere documentos tributarios&quot; en la edición de usuario.
              </Alert>
            )}
            
            {eligibleUsers.length > 0 && (
              <>
                <Grid container spacing={3}>
                  {/* User Selection */}
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Seleccionar Usuario</InputLabel>
                      <Select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        label="Seleccionar Usuario"
                      >
                        <MenuItem value="">
                          <em>Seleccione un usuario</em>
                        </MenuItem>
                        {eligibleUsers.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name} - {getApartmentName(user)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Receipt Selection */}
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth variant="outlined" disabled={!selectedUser}>
                      <InputLabel>Seleccionar Recibo</InputLabel>
                      <Select
                        value={selectedReceipt}
                        onChange={(e) => setSelectedReceipt(e.target.value)}
                        label="Seleccionar Recibo"
                      >
                        <MenuItem value="">
                          <em>Seleccione un recibo</em>
                        </MenuItem>
                        {userReceipts.map((receipt) => (
                          <MenuItem key={receipt.name} value={receipt.name}>
                            {formatMonthYear(receipt.name)} - S/.{receipt.total}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* DNI/RUC Display with Copy */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="DNI/RUC"
                      value={selectedUserData?.dni_ruc || ''}
                      disabled
                      InputProps={{
                        endAdornment: selectedUserData?.dni_ruc && (
                          <InputAdornment position="end">
                            <Tooltip title="Copiar DNI/RUC">
                              <IconButton
                                className={classes.copyButton}
                                onClick={() => copyToClipboard(selectedUserData.dni_ruc, 'DNI/RUC')}
                                size="small"
                              >
                                <CopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                
                {/* File Upload Area */}
                {selectedUser && selectedReceipt && (
                  <Box className={classes.formSection}>
                    <input
                      accept=".pdf"
                      className={classes.fileInput}
                      id="tax-file-input"
                      type="file"
                      onChange={handleFileSelect}
                    />
                    <label htmlFor="tax-file-input">
                      <Box className={classes.uploadArea}>
                        <UploadIcon style={{ fontSize: 48, marginBottom: 16, color: '#667eea' }} />
                        <Typography variant="h6" style={{ marginBottom: 8 }}>
                          {selectedFile ? selectedFile.name : 'Seleccionar archivo PDF'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Solo archivos PDF. Máximo 10MB.
                        </Typography>
                      </Box>
                    </label>
                    
                    {selectedFile && (
                      <Box style={{ textAlign: 'center', marginTop: 16 }}>
                        <Button
                          variant="contained"
                          className={classes.uploadButton}
                          onClick={handleUpload}
                          disabled={loading}
                          startIcon={<UploadIcon />}
                        >
                          {loading ? 'Subiendo...' : 'Subir Documento SUNAT'}
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}
              </>
            )}
          </Box>
        </CardContent>
      </Card>
      
      {/* Existing Documents Table */}
      {existingDocuments.length > 0 && (
        <Card className={classes.formCard}>
          <CardContent>
            <Box className={classes.formSection}>
              <Typography className={classes.sectionTitle}>
                <ReceiptIcon className={classes.sectionIcon} />
                Documentos Tributarios Existentes
              </Typography>
              
              <TableContainer component={Paper} className={classes.tableContainer}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Usuario</TableCell>
                      <TableCell>DNI/RUC</TableCell>
                      <TableCell>Apartamento</TableCell>
                      <TableCell>Recibo</TableCell>
                      <TableCell>Archivo</TableCell>
                      <TableCell>Fecha de Subida</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {existingDocuments.map((doc, index) => (
                      <TableRow key={`${doc.userId}-${doc.receiptName}-${index}`}>
                        <TableCell>
                          <Chip 
                            label={doc.userName} 
                            className={classes.userChip}
                            size="small"
                            icon={<PersonIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {doc.userDniRuc}
                            <Tooltip title="Copiar DNI/RUC">
                              <IconButton
                                className={classes.copyButton}
                                onClick={() => copyToClipboard(doc.userDniRuc, 'DNI/RUC')}
                                size="small"
                              >
                                <CopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell>{doc.apartmentName}</TableCell>
                        <TableCell>
                          <Chip 
                            label={doc.receiptName} 
                            className={classes.receiptChip}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{doc.filename}</TableCell>
                        <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Descargar">
                            <IconButton 
                              color="primary" 
                              size="small"
                              onClick={() => handleDownload(doc)}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton 
                              color="secondary" 
                              size="small"
                              onClick={() => handleDelete(doc)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}