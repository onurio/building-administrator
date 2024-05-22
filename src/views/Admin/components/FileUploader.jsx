import {
  Grid,
  IconButton,
  LinearProgress,
  makeStyles,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { FileDrop } from "react-file-drop";
import "./FileUploader.css";
import DeleteIcon from "@material-ui/icons/Delete";
import CloudDownload from "@material-ui/icons/CloudDownload";
import FileCopy from "@material-ui/icons/FileCopy";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import { refFromURL } from "firebase/database";
const useStyles = makeStyles((theme) => ({
  container: {
    width: "80vw",
    maxWidth: 1400,
  },
  containerSingle: {
    maxWidth: 450,
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  input: {
    width: "100%",
  },
  uploading: {
    position: "relative",
    overflow: "hidden",
    padding: 20,
    width: "90%",
    margin: "0 auto",
    height: 150,
  },
  file: {
    position: "relative",
    overflow: "hidden",

    width: "90%",
    margin: "0 auto",
    padding: 20,
    height: 150,
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
    <Grid
      className={isMultiple ? classes.container : classes.containerSingle}
      container
      spacing={3}
    >
      <Grid item xs={12}>
        <Typography variant="h4">{title}</Typography>
      </Grid>
      <Grid item xs={12}>
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
        />
      </Grid>
      <Grid
        container
        spacing={3}
        style={{
          overflow: "scroll",
          maxHeight: 400,
          width: "100%",
          padding: 20,
        }}
      >
        {Object.keys(uploading).map((file, index) => (
          <Grid key={`uploading${index}`} item xs={isMultiple ? 3 : 12}>
            <Paper className={classes.uploading}>
              <Typography variant="subtitle2">{file}</Typography>
              <LinearProgress variant="determinate" value={uploading[file]} />
            </Paper>
          </Grid>
        ))}
        {currentFiles.length > 0 ? (
          currentFiles.map((file, index) => (
            <Grid key={file.url} item xs={isMultiple ? 3 : 12}>
              <Paper className={classes.file}>
                <FileCopy style={{ marginBottom: 20 }} color="primary" />

                <div style={{ display: "flex" }}></div>
                <TextField
                  onChange={(e) => changeTitle(index, e.target.value)}
                  label="File title"
                  defaultValue={file.title}
                  placeholder="File title"
                  name="title"
                  variant="outlined"
                />
                <IconButton
                  onClick={() => onDelete(file)}
                  style={{
                    position: "absolute",
                    backgroundColor: "white",
                    boxShadow: "1px 1px 1px 1px rgb(0 0 0 / 13%)",
                    bottom: 10,
                    right: 10,
                  }}
                >
                  <DeleteIcon />
                </IconButton>
                <a
                  style={{
                    position: "absolute",
                    backgroundColor: "white",
                    boxShadow: "1px 1px 1px 1px rgb(0 0 0 / 13%)",
                    bottom: 80,
                    right: 10,
                  }}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconButton color="primary">
                    <CloudDownload />
                  </IconButton>
                </a>
              </Paper>
            </Grid>
          ))
        ) : (
          <div>No Files</div>
        )}
      </Grid>
    </Grid>
  );
}
