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
exports.debugSetMultimediaIC = exports.removeMultimediaICClaim = exports.setMultimediaICClaim = exports.removeWelcomeICClaim = exports.setWelcomeICClaim = exports.removeAdminClaim = exports.setAdminClaim = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
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
        if (role === "admin") {
            newClaims.admin = true;
        }
        else if (role === "welcome_ic") {
            newClaims.welcomeIC = true;
        }
        else if (role === "multimedia_ic") {
            newClaims.multimediaIC = true;
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
//# sourceMappingURL=index.js.map