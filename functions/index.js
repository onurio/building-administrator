/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
// prettier-ignore

/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const functions = require("firebase-functions");

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

const NODEMAILER_PASSWORD = functions.config().config.nodemailer_pass;

const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "edificio.juandelcarpio@gmail.com",
    pass: NODEMAILER_PASSWORD,
  },
});

// Sends an email confirmation when a user changes his mailing list subscription.
exports.sendRecieptMail = functions.firestore
  .document("/reciept_email/{recieptEmailId}")
  .onCreate((snapshot) => {
    const data = snapshot.data();

    async function main() {
      // send mail with defined transport object
      console.log("sending to " + data.userInfo.email);
      const info = await mailTransport.sendMail(
        {
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
        },
        (err, info) => {
          if (err) {
            console.error(err);
          } else {
            console.log(info);
          }
        }
      );

      return info;
    }

    main().catch(console.error);
  });

exports.sendReminderMail = functions.firestore
  .document("/reminder_email/{reminderEmailId}")
  .onCreate((snapshot) => {
    const data = snapshot.data();

    async function main() {
      const emailPromises = data.emails.map(async (email) => {
        console.log(email);
        return mailTransport.sendMail(
          {
            from: "edificio.juandelcarpio@gmail.com",
            to: email,
            subject: "Recordatorio de pago",
            html: String(reminderText),
            replyTo: "edificio.juandelcarpio@gmail.com",
          },
          (err, info) => {
            if (err) {
              console.error(err);
            } else {
              console.log(info);
            }
          }
        );
      });

      await Promise.all(emailPromises);
      return true;
    }

    main().catch(console.error);
  });
