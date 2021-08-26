/* eslint-disable indent */
// prettier-ignore

/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "edificio.juandelcarpio@gmail.com",
    pass: "jawpfghrpmqrgdnc",
  },
});

// Sends an email confirmation when a user changes his mailing list subscription.
exports.sendMail = functions.firestore
  .document("/reciept_email/{recieptEmailId}")
  .onCreate((snapshot) => {
    const data = snapshot.data();

    async function main() {
      // send mail with defined transport object
      console.log("sending to " + data.userInfo.email);
      const info = await mailTransport.sendMail({
        from: "edificio.juandelcarpio@gmail.com",
        to: data.userInfo.email,
        subject: "Estado de cuenta",
        html: `<div>
            <p>Estimado/a Inquilino/a</p>
            <br />
            <p>
              Le enviamos en el adjunto, el estado de cuenta de los gastos del
              <b>presente mes</b> y lo que corresponde al alquiler del
              <b>mes que viene</b>.
            </p>
            <p>
              En caso de depositar o transferir el pago, le pedimos por favor
              enviar el comprobante al mail.
            </p>
            <p>Cualquier consulta adicional no dude en contactarnos.</p>
            <br />
            <p>
              Les recuerdo que puede revisar todos sus recibos e informacion
              adicional, en la
              <a
                rel="noreferrer"
                href="https://edificio-jdc.web.app/"
                target="_blank"
              >
                app del edificio
              </a>.
            </p>
            <p>Saludos cordiales.</p>
            <p>La Administración.</p>
          </div>`,
        replyTo: "edificio.juandelcarpio@gmail.com",
        attachments: [
          {
            filename: data.reciept.name + ".pdf",
            href: data.reciept.url,
          },
        ],
      });

      return info;
    }

    main().catch(console.error);
  });
