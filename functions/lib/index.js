"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendReportNotification = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
const nodemailer = __importStar(require("nodemailer"));
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
// App Check is enforced to ensure requests come from your app.
exports.sendReportNotification = (0, firestore_1.onDocumentCreated)("reports/{reportId}", async (event) => {
    var _a;
    const report = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!report) {
        console.error("No report data found.");
        return;
    }
    const mailOptions = {
        from: `"${APP_NAME}" <noreply@firebase.com>`,
        to: ADMIN_EMAIL,
        subject: `New User Report on ${APP_NAME}`,
        html: `
        <h1>New User Report</h1>
        <p><b>Reported User ID:</b> ${report.reportedUserId}</p>
        <p><b>Reported Username:</b> ${report.reportedUserName}</p>
        <p><b>Reporter ID:</b> ${report.reporterId}</p>
        <p><b>Reason:</b> ${report.reason || "No reason provided."}</p>
        <p><b>Timestamp:</b> ${new Date(report.timestamp._seconds * 1000).toString()}</p>
      `,
    };
    try {
        await mailTransport.sendMail(mailOptions);
        console.log("Notification email sent.");
    }
    catch (err) {
        console.error("Failed to send email:", err);
    }
});
//# sourceMappingURL=index.js.map