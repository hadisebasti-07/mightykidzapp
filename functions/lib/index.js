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
exports.removeAdminClaim = exports.setAdminClaim = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
/**
 * Sets a custom claim on a user account when a document is created
 * in the `/admins` collection.
 */
exports.setAdminClaim = functions.firestore
    .document("admins/{uid}")
    .onCreate(async (snap, context) => {
    const { uid } = context.params;
    functions.logger.log(`Setting admin claim for user: ${uid}`);
    try {
        await admin.auth().setCustomUserClaims(uid, { admin: true });
        functions.logger.log(`✅ Success! Custom claim { admin: true } set for user: ${uid}`);
        // Optional: Write back to the document to confirm the claim was set.
        return snap.ref.set({ claimSetAt: new Date().toISOString() }, { merge: true });
    }
    catch (error) {
        functions.logger.error(`Error setting custom claim for ${uid}:`, error);
        return;
    }
});
/**
 * Removes the custom claim from a user account when their document is deleted
 * from the `/admins` collection.
 */
exports.removeAdminClaim = functions.firestore
    .document("admins/{uid}")
    .onDelete(async (snap, context) => {
    const { uid } = context.params;
    functions.logger.log(`Removing admin claim for user: ${uid}`);
    try {
        await admin.auth().setCustomUserClaims(uid, null);
        functions.logger.log(`✅ Success! Custom claim removed for user: ${uid}`);
    }
    catch (error) {
        functions.logger.error(`Error removing custom claim for ${uid}:`, error);
    }
});
//# sourceMappingURL=index.js.map