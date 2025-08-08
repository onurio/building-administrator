import {
  Grid,
  IconButton,
  LinearProgress,
  makeStyles,
  Paper,
  TextField,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { FileDrop } from "react-file-drop";
import "./FileUploader.css";
import {
  Delete as DeleteIcon,
  CloudDownload,
  FileCopy,
  CloudUpload as CloudUploadIcon,
} from "@material-ui/icons";
import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import { refFromURL } from "firebase/database";
const useStyles = makeStyles((theme) => ({
  container: {
    width: "80vw",
    maxWidth: 900,
    padding: 0,
    backgroundColor: "#f8fafc",
    borderRadius: theme.spacing(2),
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
  },
  containerSingle: {
    maxWidth: 450,
    padding: 0,
  },
  headerCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(2),
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
  },
  headerIcon: {
    fontSize: "1.75rem",
    marginRight: theme.spacing(2),
  },
  title: {
    fontWeight: 600,
    color: "white",
    margin: 0,
    fontSize: "1.25rem",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "0.875rem",
  },
  dropZoneCard: {
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: "2px dashed #cbd5e0",
    backgroundColor: "#f7fafc",
    padding: theme.spacing(2),
    "&:hover": {
      borderColor: "#667eea",
      backgroundColor: "#edf2f7",
    },
  },
  filesCard: {
    borderRadius: theme.spacing(2),
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  filesList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    overflowY: "auto",
    maxHeight: "calc(85vh - 300px)",
    "&::-webkit-scrollbar": {
      width: 6,
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "#f7fafc",
      borderRadius: 3,
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#cbd5e0",
      borderRadius: 3,
    },
  },
  fileItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1.5),
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: theme.spacing(1),
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#f7fafc",
      borderColor: "#cbd5e0",
    },
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  fileIcon: {
    color: "#667eea",
    marginRight: theme.spacing(1.5),
    flexShrink: 0,
  },
  fileName: {
    fontWeight: 500,
    color: "#1a202c",
    fontSize: "0.9rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },
  fileActions: {
    display: "flex",
    gap: theme.spacing(0.5),
    flexShrink: 0,
  },
  actionButton: {
    padding: theme.spacing(0.75),
    "&.MuiIconButton-root": {
      backgroundColor: "rgba(102, 126, 234, 0.1)",
      color: "#667eea",
      "&:hover": {
        backgroundColor: "rgba(102, 126, 234, 0.2)",
      },
    },
  },
  deleteButton: {
    "&.MuiIconButton-root": {
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      color: "#ef4444",
      "&:hover": {
        backgroundColor: "rgba(239, 68, 68, 0.2)",
      },
    },
  },
  uploadingItem: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1.5),
    backgroundColor: "#edf2f7",
    border: "1px solid #cbd5e0",
    borderRadius: theme.spacing(1),
  },
  progressContainer: {
    flex: 1,
    marginLeft: theme.spacing(1.5),
  },
  progressBar: {
    borderRadius: 4,
    height: 6,
    "& .MuiLinearProgress-bar": {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(6),
    color: "#718096",
    fontSize: "0.9rem",
  },
  fileCounter: {
    padding: theme.spacing(1, 2),
    backgroundColor: "#f7fafc",
    borderTop: "1px solid #e2e8f0",
    fontSize: "0.875rem",
    color: "#4a5568",
    fontWeight: 500,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    color: "#718096",
  },
  loadingText: {
    marginTop: theme.spacing(2),
    fontSize: "0.9rem",
    color: "#718096",
  },
}));

export default function FileUploader({
  files = [],
  storage,
  path,
  title,
  onChange,
  isMultiple = true,
}) {
  const classes = useStyles();
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState({});
  const [currentFiles, setCurrentFiles] = useState([...files]);
  const [filesWithDates, setFilesWithDates] = useState([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  const onFileInputChange = (event) => {
    const { files } = event.target;
    handleFiles(files);
  };

  const onDelete = async ({ url }) => {
    await deleteObject(ref(storage, url));
    setCurrentFiles((s) => {
      let newFiles = s.filter((file) => file.url !== url);
      onChange(newFiles);
      return newFiles;
    });
  };

  // Fetch metadata for existing files on mount
  useEffect(() => {
    const fetchFileDates = async () => {
      setLoadingMetadata(true);
      try {
        const filesWithMeta = await Promise.all(
          currentFiles.map(async (file) => {
            try {
              const fileRef = ref(storage, file.url);
              const metadata = await getMetadata(fileRef);
              return {
                ...file,
                uploadDate: metadata.timeCreated,
              };
            } catch (error) {
              console.log("Could not fetch metadata for", file.title);
              return {
                ...file,
                uploadDate: null,
              };
            }
          })
        );
        
        // Sort by upload date (newest first)
        filesWithMeta.sort((a, b) => {
          if (!a.uploadDate) return 1;
          if (!b.uploadDate) return -1;
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        });
        
        setFilesWithDates(filesWithMeta);
      } finally {
        setLoadingMetadata(false);
      }
    };

    if (currentFiles.length > 0) {
      fetchFileDates();
    } else {
      setFilesWithDates([]);
      setLoadingMetadata(false);
    }
  }, [currentFiles, storage]);

  useEffect(() => {
    let finished = true;
    if (Object.keys(uploading).length !== 0) {
      Object.keys(uploading).forEach((key) => {
        if (uploading[key] !== "finished") {
          finished = false;
        }
      });
      if (finished) {
        isMultiple ? onChange(currentFiles) : onChange(currentFiles[0]);
        setUploading({});
      }
    }
  }, [uploading]);

  const onDrop = (files) => {
    isMultiple ? handleFiles(files) : handleFiles([files[0]]);
  };

  const handleFiles = (files) => {
    for (let i = 0; i < files.length; i++) {
      uploadFile(files[i]);
    }
  };

  const changeTitle = (index, title) => {
    setCurrentFiles((s) => {
      let arr = [...s];
      arr[index].title = title;
      onChange(arr);
      return arr;
    });
  };

  const onTargetClick = () => {
    fileInputRef.current.click();
  };

  const uploadFile = (file) => {
    const storageRef = ref(
      storage,
      path + "/" + file.name + Math.random() * 10000
    );

    const task = uploadBytesResumable(storageRef, file);

    //Update progress bar
    task.on(
      "state_changed",
      (snapshot) => {
        var percentage =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploading((s) => ({ ...s, [file.name]: percentage }));
      },
      function error(err) {
        console.log(err);
      },
      () => {
        getDownloadURL(task.snapshot.ref).then((url) => {
          isMultiple
            ? setCurrentFiles((s) => [...s, { url, title: file.name }])
            : setCurrentFiles([{ url, title: file.name }]);
          setUploading((s) => ({ ...s, [file.name]: "finished" }));
        });
      }
    );
  };

  return (
    <Box className={isMultiple ? classes.container : classes.containerSingle}>
      {/* Header */}
      <Card className={classes.headerCard}>
        <Box className={classes.headerContent}>
          <CloudUploadIcon className={classes.headerIcon} />
          <Box>
            <Typography variant="h5" className={classes.title}>
              {title || "Gestión de Archivos"}
            </Typography>
            <Typography variant="body2" className={classes.subtitle}>
              {filesWithDates.length} archivo{filesWithDates.length !== 1 ? 's' : ''} • Ordenados por fecha
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Drop Zone */}
      <Box className={classes.dropZoneCard}>
        <input
          onChange={onFileInputChange}
          ref={fileInputRef}
          type="file"
          multiple={isMultiple}
          className="mo-custom-file-input"
        />
        <FileDrop
          targetClassName="mo-drop-target"
          onDrop={onDrop}
          onTargetClick={onTargetClick}
          style={{ height: 80 }}
        />
      </Box>

      {/* Files List */}
      <Card className={classes.filesCard}>
        <Box className={classes.filesList}>
          {/* Uploading Files */}
          {Object.keys(uploading).map((file, index) => (
            <Box key={`uploading${index}`} className={classes.uploadingItem}>
              <CloudUploadIcon className={classes.fileIcon} />
              <Box className={classes.progressContainer}>
                <Typography variant="body2" className={classes.fileName} style={{ marginBottom: 4 }}>
                  {file}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={uploading[file]}
                  className={classes.progressBar}
                />
                <Typography variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
                  {Math.round(uploading[file])}%
                </Typography>
              </Box>
            </Box>
          ))}
          
          {/* Loading State */}
          {loadingMetadata && !Object.keys(uploading).length && (
            <Box className={classes.loadingContainer}>
              <CircularProgress size={40} />
              <Typography className={classes.loadingText}>
                Cargando archivos...
              </Typography>
            </Box>
          )}
          
          {/* Existing Files */}
          {!loadingMetadata && filesWithDates.length > 0 && (
            filesWithDates.map((file, index) => (
              <Box key={file.url} className={classes.fileItem}>
                <Box className={classes.fileInfo}>
                  <FileCopy className={classes.fileIcon} />
                  <TextField
                    onChange={(e) => changeTitle(index, e.target.value)}
                    defaultValue={file.title}
                    placeholder="Nombre del archivo"
                    name="title"
                    variant="standard"
                    InputProps={{
                      disableUnderline: true,
                      style: {
                        fontSize: "0.9rem",
                        fontWeight: 500,
                      }
                    }}
                    fullWidth
                  />
                  {file.uploadDate && (
                    <Chip
                      label={new Date(file.uploadDate).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                      size="small"
                      style={{ 
                        backgroundColor: '#e0e7ff', 
                        color: '#3730a3',
                        fontSize: '0.75rem',
                        height: 20,
                        marginLeft: 8
                      }}
                    />
                  )}
                </Box>
                
                <Box className={classes.fileActions}>
                  <IconButton
                    className={classes.actionButton}
                    size="small"
                    component="a"
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    title="Descargar"
                  >
                    <CloudDownload fontSize="small" />
                  </IconButton>
                  <IconButton
                    className={`${classes.actionButton} ${classes.deleteButton}`}
                    size="small"
                    onClick={() => onDelete(file)}
                    title="Eliminar"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))
          )}
          
          {/* Empty State */}
          {!loadingMetadata && !Object.keys(uploading).length && filesWithDates.length === 0 && (
            <Box className={classes.emptyState}>
              <FileCopy style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }} />
              <Typography variant="body2">
                No hay archivos
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Arrastra archivos aquí o haz clic en el área superior
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* File Counter */}
        {(filesWithDates.length > 0 || Object.keys(uploading).length > 0) && (
          <Box className={classes.fileCounter}>
            Total: {filesWithDates.length + Object.keys(uploading).length} archivo{(filesWithDates.length + Object.keys(uploading).length) !== 1 ? 's' : ''}
          </Box>
        )}
      </Card>
    </Box>
  );
}
