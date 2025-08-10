/* eslint-disable space-before-function-paren */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
// prettier-ignore

/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const functions = require("firebase-functions");
const { defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");
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
const paymentPendingText = fs.readFileSync(
  path.resolve(__dirname, "payment-pending-email.html"),
  "utf8"
);
const paymentApprovedText = fs.readFileSync(
  path.resolve(__dirname, "payment-approved-email.html"),
  "utf8"
);
const paymentDeclinedText = fs.readFileSync(
  path.resolve(__dirname, "payment-declined-email.html"),
  "utf8"
);

const NODEMAILER_PASSWORD = defineString("CONFIG_NODEMAILER_PASS");
const NODEMAILER_EMAIL = defineString("CONFIG_NODEMAILER_EMAIL");
const ADMIN_EMAILS = defineString("CONFIG_ADMIN_EMAILS");

// Initialize Firebase Admin
admin.initializeApp();

const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: NODEMAILER_EMAIL.value(),
    pass: NODEMAILER_PASSWORD.value(),
  },
});

const app = express();
app.use(bodyParser.json());

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid authorization header" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// Admin-only middleware
const requireAdmin = async (req, res, next) => {
  try {
    // Get admin emails from Firebase Functions config
    const adminEmails = ADMIN_EMAILS.value().split(",") || [];

    if (!adminEmails.includes(req.user.email)) {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    next();
  } catch (error) {
    console.error("Admin authorization error:", error);
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
};

const allowedOrigins = [
  "http://localhost:3000",
  "https://edificio-jdc.web.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      // Only allow requests from allowed origins (no bypassing)
      if (!origin || allowedOrigins.indexOf(origin) === -1) {
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

app.post("/email/receipt", authenticateUser, requireAdmin, async (req, res) => {
  const data = req.body;

  try {
    console.log("sending to " + data.userInfo.email);
    const info = await mailTransport.sendMail({
      from: NODEMAILER_EMAIL.value(),
      to: data.userInfo.email,
      subject: "Estado de cuenta",
      html: String(recieptText),
      replyTo: NODEMAILER_EMAIL.value(),
      attachments: [
        {
          filename: data.reciept.name + ".pdf",
          href: data.reciept.url,
        },
      ],
    });
    res.status(200).send(info);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.toString());
  }
});

app.post("/email/reminder", authenticateUser, requireAdmin, async (req, res) => {
  const data = req.body;

  try {
    const emailPromises = data.emails.map(async (email) => {
      return mailTransport.sendMail({
        from: NODEMAILER_EMAIL.value(),
        to: email,
        subject: "Recordatorio de pago",
        html: String(reminderText),
        replyTo: NODEMAILER_EMAIL.value(),
      });
    });

    await Promise.all(emailPromises);
    res.status(200).send("Emails sent successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.toString());
  }
});

// Email notification when user uploads payment - triggered by authenticated users
app.post("/email/payment-pending", authenticateUser, async (req, res) => {
  const data = req.body;

  try {
    // Replace placeholders in template
    let emailHtml = String(paymentPendingText);
    emailHtml = emailHtml.replace(/{{userName}}/g, data.userName || "");
    emailHtml = emailHtml.replace(/{{monthYear}}/g, data.monthYear || "");
    emailHtml = emailHtml.replace(/{{amountPaid}}/g, data.amountPaid || "");
    emailHtml = emailHtml.replace(/{{uploadDate}}/g, data.uploadDate || "");

    // Get first admin email for notifications
    const adminEmails = ADMIN_EMAILS.value().split(",") || [];
    const adminEmail = adminEmails[0];

    if (!adminEmail) {
      throw new Error("No admin email configured");
    }

    await mailTransport.sendMail({
      from: NODEMAILER_EMAIL.value(),
      to: adminEmail,
      subject: `Nuevo Pago Pendiente - ${data.userName}`,
      html: emailHtml,
      replyTo: NODEMAILER_EMAIL.value(),
    });

    res.status(200).send("Admin notification sent");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.toString());
  }
});

// Email notification when payment is approved - admin only
app.post("/email/payment-approved", authenticateUser, requireAdmin, async (req, res) => {
  const data = req.body;

  try {
    // Replace placeholders in template
    let emailHtml = String(paymentApprovedText);
    emailHtml = emailHtml.replace(/{{userName}}/g, data.userName || "");
    emailHtml = emailHtml.replace(/{{monthYear}}/g, data.monthYear || "");
    emailHtml = emailHtml.replace(/{{amountPaid}}/g, data.amountPaid || "");
    emailHtml = emailHtml.replace(/{{approvalDate}}/g, data.approvalDate || "");

    // Handle optional review notes
    if (data.reviewNotes) {
      emailHtml = emailHtml.replace(/{{#if reviewNotes}}[\s\S]*?{{\/if}}/g,
        `<div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 6px;">
          <p style="margin: 5px 0;"><strong>Notas del Administrador:</strong></p>
          <p style="margin: 5px 0; color: #666;">${data.reviewNotes}</p>
        </div>`
      );
    } else {
      emailHtml = emailHtml.replace(/{{#if reviewNotes}}[\s\S]*?{{\/if}}/g, "");
    }

    await mailTransport.sendMail({
      from: NODEMAILER_EMAIL.value(),
      to: data.userEmail,
      subject: "Tu pago ha sido aprobado - Edificio Juan del Carpio",
      html: emailHtml,
      replyTo: NODEMAILER_EMAIL.value(),
    });

    res.status(200).send("User notification sent");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.toString());
  }
});

// Email notification when payment is declined - admin only
app.post("/email/payment-declined", authenticateUser, requireAdmin, async (req, res) => {
  const data = req.body;

  try {
    // Replace placeholders in template
    let emailHtml = String(paymentDeclinedText);
    emailHtml = emailHtml.replace(/{{userName}}/g, data.userName || "");
    emailHtml = emailHtml.replace(/{{monthYear}}/g, data.monthYear || "");
    emailHtml = emailHtml.replace(/{{amountPaid}}/g, data.amountPaid || "");
    emailHtml = emailHtml.replace(/{{reviewDate}}/g, data.reviewDate || "");

    // Handle optional review notes
    if (data.reviewNotes) {
      emailHtml = emailHtml.replace(/{{#if reviewNotes}}[\s\S]*?{{else}}[\s\S]*?{{\/if}}/g,
        `<div style="background-color: #fff5f5; border: 1px solid #feb2b2; padding: 15px; margin: 20px 0; border-radius: 6px;">
          <p style="margin: 5px 0; color: #c53030;"><strong>Motivo del Rechazo:</strong></p>
          <p style="margin: 5px 0; color: #7c2d2d;">${data.reviewNotes}</p>
        </div>`
      );
    } else {
      emailHtml = emailHtml.replace(/{{#if reviewNotes}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/g, "$1");
    }

    await mailTransport.sendMail({
      from: NODEMAILER_EMAIL.value(),
      to: data.userEmail,
      subject: "Tu pago ha sido rechazado - Edificio Juan del Carpio",
      html: emailHtml,
      replyTo: NODEMAILER_EMAIL.value(),
    });

    res.status(200).send("User notification sent");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.toString());
  }
});

exports.api = functions.https.onRequest(app);
