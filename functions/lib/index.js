'use server';
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
exports.notifyNewPublicRegistration = exports.debugSetMultimediaIC = exports.removeLogisticICClaim = exports.setLogisticICClaim = exports.removeMultimediaICClaim = exports.setMultimediaICClaim = exports.removeWelcomeICClaim = exports.setWelcomeICClaim = exports.removeAdminClaim = exports.setAdminClaim = void 0;
const functions = __importStar(require("firebase-functions"));
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
const nodemailer = __importStar(require("nodemailer"));
const MAIL_USER = (0, params_1.defineString)("MAIL_USER");
const MAIL_PASS = (0, params_1.defineString)("MAIL_PASS");
const MAIL_TO = (0, params_1.defineString)("MAIL_TO");
admin.initializeApp();
// ─── Helper: Set role claims safely ───────────────────────────────────────────
async function setRoleClaim(uid, role) {
    try {
        const user = await admin.auth().getUser(uid);
        const existingClaims = user.customClaims || {};
        let newClaims = Object.assign({}, existingClaims);
        // Reset role-related claims
        delete newClaims.admin;
        delete newClaims.welcomeIC;
        delete newClaims.multimediaIC;
        delete newClaims.logisticIC;
        if (role === "admin") {
            newClaims.admin = true;
        }
        else if (role === "welcome_ic") {
            newClaims.welcomeIC = true;
        }
        else if (role === "multimedia_ic") {
            newClaims.multimediaIC = true;
        }
        else if (role === "logistic_ic") {
            newClaims.logisticIC = true;
        }
        await admin.auth().setCustomUserClaims(uid, newClaims);
        functions.logger.log(`✅ Updated claims for ${uid}:`, newClaims);
    }
    catch (error) {
        functions.logger.error(`Error setting role claim for ${uid}:`, error);
    }
}
// ─── Admin role ───────────────────────────────────────────────────────────────
exports.setAdminClaim = functions.firestore
    .document("admins/{uid}")
    .onCreate(async (snap, context) => {
    const { uid } = context.params;
    functions.logger.log(`Setting admin claim for user: ${uid}`);
    try {
        await setRoleClaim(uid, "admin");
        return snap.ref.set({ claimSetAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    }
    catch (error) {
        functions.logger.error(`Error setting admin claim for ${uid}:`, error);
        return null;
    }
});
exports.removeAdminClaim = functions.firestore
    .document("admins/{uid}")
    .onDelete(async (snap, context) => {
    const { uid } = context.params;
    functions.logger.log(`Removing admin claim for user: ${uid}`);
    try {
        await setRoleClaim(uid, null);
    }
    catch (error) {
        functions.logger.error(`Error removing admin claim for ${uid}:`, error);
    }
    return null;
});
// ─── Welcome IC role (separate collection) ────────────────────────────────────
exports.setWelcomeICClaim = functions.firestore
    .document("welcomeICs/{uid}")
    .onCreate(async (snap, context) => {
    const { uid } = context.params;
    functions.logger.log(`Setting welcomeIC claim for user: ${uid}`);
    try {
        await setRoleClaim(uid, "welcome_ic");
        return snap.ref.set({ claimSetAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    }
    catch (error) {
        functions.logger.error(`Error setting welcomeIC claim for ${uid}:`, error);
        return null;
    }
});
exports.removeWelcomeICClaim = functions.firestore
    .document("welcomeICs/{uid}")
    .onDelete(async (snap, context) => {
    const { uid } = context.params;
    functions.logger.log(`Removing welcomeIC claim for user: ${uid}`);
    try {
        await setRoleClaim(uid, null);
    }
    catch (error) {
        functions.logger.error(`Error removing welcomeIC claim for ${uid}:`, error);
    }
    return null;
});
// ─── Multimedia IC role ───────────────────────────────────────────────────────
exports.setMultimediaICClaim = functions.firestore
    .document("multimediaICs/{uid}")
    .onCreate(async (snap, context) => {
    const { uid } = context.params;
    functions.logger.log(`Setting multimediaIC claim for user: ${uid}`);
    try {
        await setRoleClaim(uid, "multimedia_ic");
        return snap.ref.set({ claimSetAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    }
    catch (error) {
        functions.logger.error(`Error setting multimediaIC claim for ${uid}:`, error);
        return null;
    }
});
exports.removeMultimediaICClaim = functions.firestore
    .document("multimediaICs/{uid}")
    .onDelete(async (snap, context) => {
    const { uid } = context.params;
    functions.logger.log(`Removing multimediaIC claim for user: ${uid}`);
    try {
        await setRoleClaim(uid, null);
    }
    catch (error) {
        functions.logger.error(`Error removing multimediaIC claim for ${uid}:`, error);
    }
    return null;
});
// ─── Logistic IC role ─────────────────────────────────────────────────────────
exports.setLogisticICClaim = functions.firestore
    .document("logisticsICs/{uid}")
    .onCreate(async (snap, context) => {
    const { uid } = context.params;
    functions.logger.log(`Setting logisticIC claim for user: ${uid}`);
    try {
        await setRoleClaim(uid, "logistic_ic");
        return snap.ref.set({ claimSetAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    }
    catch (error) {
        functions.logger.error(`Error setting logisticIC claim for ${uid}:`, error);
        return null;
    }
});
exports.removeLogisticICClaim = functions.firestore
    .document("logisticsICs/{uid}")
    .onDelete(async (snap, context) => {
    const { uid } = context.params;
    functions.logger.log(`Removing logisticIC claim for user: ${uid}`);
    try {
        await setRoleClaim(uid, null);
    }
    catch (error) {
        functions.logger.error(`Error removing logisticIC claim for ${uid}:`, error);
    }
    return null;
});
// ─── Debug: force-set multimedia IC claim ────────────────────────────────────
// Remove this after confirming claims work.
exports.debugSetMultimediaIC = functions.https.onRequest(async (req, res) => {
    const uid = req.query.uid;
    if (!uid) {
        res.status(400).json({ error: "Missing uid query param" });
        return;
    }
    try {
        await admin.auth().setCustomUserClaims(uid, { multimediaIC: true });
        const user = await admin.auth().getUser(uid);
        res.json({ success: true, uid, claims: user.customClaims });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ─── Email notification: new public child registration ────────────────────────
exports.notifyNewPublicRegistration = functions.firestore
    .document("kids/{kidId}")
    .onCreate(async (snap) => {
    const kid = snap.data();
    const shouldNotify = kid.registrationSource === "public" ||
        (kid.registrationSource === "internal" && kid.notifyOnCreate === true);
    if (!shouldNotify)
        return null;
    const gmailUser = MAIL_USER.value();
    const gmailPass = MAIL_PASS.value();
    const adminEmail = MAIL_TO.value() || gmailUser;
    if (!gmailUser || !gmailPass) {
        functions.logger.warn("Email not configured. Add MAIL_USER and MAIL_PASS to functions/.env");
        return null;
    }
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass },
    });
    const registeredAt = kid.createdAt
        ? new Date(kid.createdAt).toLocaleString("en-AU", { timeZone: "Asia/Kuala_Lumpur" })
        : "Unknown";
    const html = `
      <h2>New Child Registration</h2>
      <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;">
        <tr><td><strong>Name</strong></td><td>${kid.firstName} ${kid.lastName}${kid.nickname ? ` (${kid.nickname})` : ""}</td></tr>
        <tr><td><strong>Date of Birth</strong></td><td>${kid.dateOfBirth}</td></tr>
        <tr><td><strong>Gender</strong></td><td>${kid.gender}</td></tr>
        <tr><td><strong>Parent 1</strong></td><td>${kid.parentName} — ${kid.parentPhone}</td></tr>
        ${kid.parent2Name ? `<tr><td><strong>Parent 2</strong></td><td>${kid.parent2Name} — ${kid.parent2Phone}</td></tr>` : ""}
        ${kid.email ? `<tr><td><strong>Family Email</strong></td><td>${kid.email}</td></tr>` : ""}
        ${kid.invitedBy ? `<tr><td><strong>Invited By</strong></td><td>${kid.invitedBy}</td></tr>` : ""}
        ${kid.allergies ? `<tr><td><strong>Allergies</strong></td><td>${kid.allergies}</td></tr>` : ""}
        ${kid.medicalNotes ? `<tr><td><strong>Medical Notes</strong></td><td>${kid.medicalNotes}</td></tr>` : ""}
        <tr><td><strong>Registered At</strong></td><td>${registeredAt}</td></tr>
      </table>
    `;
    const recipients = [adminEmail, "Nctieng@gmail.com", "Mightykidz@nlcc.org.sg"].join(", ");
    await transporter.sendMail({
        from: `"MightyKidz" <${gmailUser}>`,
        to: recipients,
        subject: `New Registration: ${kid.firstName} ${kid.lastName}`,
        html,
    });
    functions.logger.log(`Registration email sent for kid: ${kid.firstName} ${kid.lastName}`);
    return null;
});
//# sourceMappingURL=index.js.map