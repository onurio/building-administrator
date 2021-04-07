import { Button, Grid, makeStyles, TextField } from '@material-ui/core';
import React, { useState } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import sendMail from '../utils/sendMail';
import { sendMessage } from '../utils/dbRequests';

const useStyles = makeStyles((theme) => ({
  container: {
    maxWidth: '100%',
    // padding: 20,
    margin: '20px auto',
  },
  input: {
    width: '100%',
    borderRadius: 0,
  },

  submit: {
    height: 50,
    width: '100%',
    textTransform: 'none',
    backgroundColor: '#333',
    borderRadius: 0,
    '&:hover': {
      backgroundColor: '#333',
      // borderColor: '#0062cc',
      //   boxShadow: 'none',
    },
  },
}));

export default function ContactForm({
  subject,
  hiddenAttachment,
  db,
  onSend = () => {},
}) {
  const [info, setInfo] = useState({ subject });
  const classes = useStyles();
  const [sent, setSent] = useState(false);
  const [snack, setSnack] = useState(false);

  const handleChange = (e) => {
    setInfo((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (hiddenAttachment) {
      info.attachment = hiddenAttachment;
    }
    let res = await sendMessage(db, info);
    // console.log(res);
    if (res) {
      setSnack(true);
      setSent(true);

      setTimeout(() => {
        onSend();
      }, 4000);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Grid
        style={{ opacity: !sent ? 1 : 0.5 }}
        className={classes.container}
        container
        spacing={3}
        xs={12}
      >
        <Grid item xs={6}>
          <TextField
            className={classes.input}
            onChange={handleChange}
            name="name"
            type="text"
            label="Nombre"
            required
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            className={classes.input}
            onChange={handleChange}
            name="email"
            type="email"
            label="Email"
            required
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            className={classes.input}
            onChange={handleChange}
            name="phone"
            label="Teléfono"
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            className={classes.input}
            onChange={handleChange}
            name="address"
            label="Distrito o Ciudad"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            className={classes.input}
            onChange={handleChange}
            disabled={!!subject}
            value={subject}
            name="subject"
            label={!subject && 'Asunto'}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            className={classes.input}
            onChange={handleChange}
            name="message"
            placeholder="Escribe tu mensaje aquí"
            multiline
            rows={5}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            className={classes.submit}
            color="primary"
            variant="contained"
            autoCapitalize={false}
            disabled={sent}
          >
            Enviar
          </Button>
        </Grid>
      </Grid>
      <Snackbar
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        open={snack}
        autoHideDuration={10000}
        onClose={() => setSnack(false)}
        message="Mensaje enviado! Te contactaremos pronto."
        action={
          <React.Fragment>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={() => setSnack(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </form>
  );
}
