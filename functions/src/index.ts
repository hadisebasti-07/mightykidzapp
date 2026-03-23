'use server';
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const setRoleClaim = async (uid: string, role: string | null) => {
  const claims = role ? { role } : null;
  try {
    await admin.auth().setCustomUserClaims(uid, claims);
    if (claims) {
      functions.logger.log(`✅ Success! Custom claim { role: "${role}" } set for user: ${uid}`);
    } else {
      functions.logger.log(`✅ Success! Custom claims removed for user: ${uid}`);
    }
  } catch (error) {
    functions.logger.error(`Error setting custom claim for ${uid}:`, error);
  }
};

export const manageRoleClaim = functions.firestore
  .document("admins/{uid}")
  .onWrite(async (change, context) => {
    const { uid } = context.params;

    // On create or update
    if (change.after.exists) {
      const data = change.after.data();
      const role = data?.role; // e.g., 'admin', 'welcome_ic'

      if (role && (role === 'admin' || role === 'welcome_ic')) {
        functions.logger.log(`Setting role claim for user: ${uid} to "${role}"`);
        await setRoleClaim(uid, role);
        await change.after.ref.set({ claimSetAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      } else {
        // If role is invalid or removed, strip claims.
        functions.logger.log(`No valid role found for ${uid}. Removing claims.`);
        await setRoleClaim(uid, null);
      }
    } 
    // On delete
    else {
      functions.logger.log(`Admin document for ${uid} deleted. Removing claims.`);
      await setRoleClaim(uid, null);
    }
  });