
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const APP_NAME = "BeGood";
const ADMIN_EMAIL = "begoodhelp@gmail.com";

// This function sends an email notification when a new user report is created.
export const sendReportNotification = onDocumentCreated(
  {
    document: "reports/{reportId}",
    region: 'us-central1'
  },
  async (event) => {
    const report = event.data?.data();
    if (!report) {
      console.error("No report data found.");
      return;
    }

    const mailOptions = {
      from: `"${APP_NAME}" <noreply@firebase.com>`,
      to: ADMIN_EMAIL,
      subject: `New User Report on ${APP_NAME}`,
      html: \`
        <h1>New User Report</h1>
        <p><b>Reported User ID:</b> \${report.reportedUserId}</p>
        <p><b>Reported Username:</b> \${report.reportedUserName}</p>
        <p><b>Reporter ID:</b> \${report.reporterId}</p>
        <p><b>Reason:</b> \${report.reason || "No reason provided."}</p>
        <p><b>Timestamp:</b> \${new Date(
          report.timestamp._seconds * 1000
        ).toString()}</p>
      \`,
    };

    try {
      await mailTransport.sendMail(mailOptions);
      console.log("Notification email sent.");
    } catch (err) {
      console.error("Failed to send email:", err);
    }
  }
);
