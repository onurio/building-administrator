/* eslint-disable space-before-function-paren */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
// prettier-ignore

/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const functions = require("firebase-functions");
const { defineString } = require("firebase-functions/params");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const recieptText = fs.readFileSync(
  path.resolve(__dirname, "reciept-email-text.html"),
  "utf8"
);
const reminderText = fs.readFileSync(
  path.resolve(__dirname, "reminder-email-text.html"),
  "utf8"
);

const NODEMAILER_PASSWORD = defineString("CONFIG_NODEMAILER_PASS");

const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "edificio.juandelcarpio@gmail.com",
    pass: NODEMAILER_PASSWORD.value(),
  },
});

const app = express();
app.use(bodyParser.json());

const allowedOrigins = [
  "http://localhost:3000",
  "https://edificio-jdc.web.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin like mobile apps or curl requests
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

app.get("/hello", (req, res) => {
  res.send("Hello World");
});

app.post("/email/receipt", async (req, res) => {
  const data = req.body;

  try {
    console.log("sending to " + data.userInfo.email);
    const info = await mailTransport.sendMail({
      from: "edificio.juandelcarpio@gmail.com",
      to: data.userInfo.email,
      subject: "Estado de cuenta",
      html: String(recieptText),
      replyTo: "edificio.juandelcarpio@gmail.com",
      attachments: [
        {
          filename: data.reciept.name + ".pdf",
          href: data.reciept.url,
        },
      ],
    });

    console.log(info);
    res.status(200).send(info);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.toString());
  }
});

app.post("/email/reminder", async (req, res) => {
  const data = req.body;

  try {
    const emailPromises = data.emails.map(async (email) => {
      console.log(email);
      return mailTransport.sendMail({
        from: "edificio.juandelcarpio@gmail.com",
        to: email,
        subject: "Recordatorio de pago",
        html: String(reminderText),
        replyTo: "edificio.juandelcarpio@gmail.com",
      });
    });

    await Promise.all(emailPromises);
    res.status(200).send("Emails sent successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.toString());
  }
});

exports.api = functions.https.onRequest(app);
