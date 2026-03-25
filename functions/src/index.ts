'use server';
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// ─── Helper: Set role claims safely ───────────────────────────────────────────

async function setRoleClaim(uid: string, role: string | null) {
  try {
    const user = await admin.auth().getUser(uid);
    const existingClaims = user.customClaims || {};

    let newClaims = { ...existingClaims };

    // Reset role-related claims
    delete newClaims.admin;
    delete newClaims.welcomeIC;

    if (role === "admin") {
      newClaims.admin = true;
    } else if (role === "welcome_ic") {
      newClaims.welcomeIC = true;
    }

    await admin.auth().setCustomUserClaims(uid, newClaims);
    functions.logger.log(`✅ Updated claims for ${uid}:`, newClaims);
  } catch (error) {
    functions.logger.error(`Error setting role claim for ${uid}:`, error);
  }
}

// ─── Admin role ───────────────────────────────────────────────────────────────

export const setAdminClaim = functions.firestore
  .document("admins/{uid}")
  .onCreate(async (snap, context) => {
    const { uid } = context.params;
    functions.logger.log(`Setting admin claim for user: ${uid}`);
    try {
      await setRoleClaim(uid, "admin");
      return snap.ref.set(
        { claimSetAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
    } catch (error) {
      functions.logger.error(`Error setting admin claim for ${uid}:`, error);
      return null;
    }
  });

export const removeAdminClaim = functions.firestore
  .document("admins/{uid}")
  .onDelete(async (snap, context) => {
    const { uid } = context.params;
    functions.logger.log(`Removing admin claim for user: ${uid}`);
    try {
      await setRoleClaim(uid, null);
    } catch (error) {
      functions.logger.error(`Error removing admin claim for ${uid}:`, error);
    }
    return null;
  });

// ─── Welcome IC role (separate collection) ────────────────────────────────────

export const setWelcomeICClaim = functions.firestore
  .document("welcomeICs/{uid}")
  .onCreate(async (snap, context) => {
    const { uid } = context.params;

    functions.logger.log(`Setting welcomeIC claim for user: ${uid}`);

    try {
      await setRoleClaim(uid, "welcome_ic");

      return snap.ref.set(
        { claimSetAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
    } catch (error) {
      functions.logger.error(`Error setting welcomeIC claim for ${uid}:`, error);
      return null;
    }
  });

export const removeWelcomeICClaim = functions.firestore
  .document("welcomeICs/{uid}")
  .onDelete(async (snap, context) => {
    const { uid } = context.params;

    functions.logger.log(`Removing welcomeIC claim for user: ${uid}`);

    try {
      await setRoleClaim(uid, null);
    } catch (error) {
      functions.logger.error(`Error removing welcomeIC claim for ${uid}:`, error);
    }

    return null;
  });