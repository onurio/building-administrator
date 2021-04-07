import {
  Grid,
  IconButton,
  LinearProgress,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import { FileDrop } from 'react-file-drop';
import './ImageGallery.css';
import DeleteIcon from '@material-ui/icons/Delete';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '80vw',
  },
  containerSingle: {
    maxWidth: 450,
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  input: {
    width: '100%',
  },
}));

export default function ImageUploader({
  images = [],
  storage,
  path,
  title,
  onChange,
  isMultiple = true,
}) {
  const classes = useStyles();
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState({});
  const [currentImages, setCurrentImages] = useState([...images]);
  // const [currentImage, setCurrentImage] = useState(image);

  // useEffect(() => {
  //   if (images) {
  //     setCurrentImages([...images]);
  //   } else {
  //     setCurrentImages([]);
  //   }
  // }, [images]);

  const onFileInputChange = (event) => {
    const { files } = event.target;
    handleFiles(files);
  };

  const onDelete = (url) => {
    setCurrentImages((s) => {
      let newImages = s.filter((image) => image !== url);
      onChange(newImages);
      return newImages;
    });
  };

  useEffect(() => {
    let finished = true;
    if (Object.keys(uploading).length !== 0) {
      Object.keys(uploading).forEach((key) => {
        if (uploading[key] !== 'finished') {
          finished = false;
        }
      });
      if (finished) {
        isMultiple ? onChange(currentImages) : onChange(currentImages[0]);
        setUploading({});
      }
    }
  }, [uploading]);

  const onDrop = (files) => {
    isMultiple ? handleFiles(files) : handleFiles([files[0]]);
  };

  const handleFiles = (files) => {
    for (let i = 0; i < files.length; i++) {
      if (/image/g.test(files[i].type)) {
        uploadImage(files[i]);
      }
    }
  };

  const onTargetClick = () => {
    fileInputRef.current.click();
  };

  const uploadImage = (imageFile) => {
    var storageRef = storage.ref(
      path + '/' + imageFile.name + Math.random() * 10000
    );

    //Upload file
    var task = storageRef.put(imageFile);

    //Update progress bar
    task.on(
      'state_changed',
      (snapshot) => {
        var percentage =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploading((s) => ({ ...s, [imageFile.name]: percentage }));
      },
      function error(err) {
        console.log(err);
      },
      () => {
        task.snapshot.ref.getDownloadURL().then((url) => {
          isMultiple
            ? setCurrentImages((s) => [...s, url])
            : setCurrentImages([url]);
          setUploading((s) => ({ ...s, [imageFile.name]: 'finished' }));
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
          overflow: 'scroll',
          maxHeight: 400,
          width: '100%',
          padding: 20,
        }}
      >
        {Object.keys(uploading).map((file, index) => (
          <Grid key={`uploading${index}`} item xs={isMultiple ? 3 : 12}>
            <Paper
              style={{
                position: 'relative',
                overflow: 'hidden',
                padding: 20,
                width: '100%',
                height: 200,
              }}
            >
              <Typography variant="subtitle2">{file}</Typography>
              <LinearProgress variant="determinate" value={uploading[file]} />
            </Paper>
          </Grid>
        ))}
        {currentImages.length > 0 ? (
          currentImages.map((img) => (
            <Grid key={img} item xs={isMultiple ? 3 : 12}>
              <Paper
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  width: '100%',
                  height: 200,
                }}
              >
                <img
                  style={{
                    objectFit: 'cover',
                    width: '100%',
                    height: 200,
                  }}
                  width="100%"
                  src={img}
                />
                <IconButton
                  onClick={() => onDelete(img)}
                  style={{
                    position: 'absolute',
                    backgroundColor: 'white',
                    boxShadow: '1px 1px 1px 1px rgb(0 0 0 / 13%)',
                    bottom: 10,
                    right: 10,
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Paper>
            </Grid>
          ))
        ) : (
          <div>No images</div>
        )}
      </Grid>
    </Grid>
  );
}
