import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Sets a custom claim on a user account when a document is created
 * in the `/admins` collection.
 */
export const setAdminClaim = functions.firestore
  .document("admins/{uid}")
  .onCreate(async (snap, context) => {
    const { uid } = context.params;
    functions.logger.log(`Setting admin claim for user: ${uid}`);
    try {
      await admin.auth().setCustomUserClaims(uid, { admin: true });
      functions.logger.log(
        `✅ Success! Custom claim { admin: true } set for user: ${uid}`
      );
      // Optional: Write back to the document to confirm the claim was set.
      return snap.ref.set({ claimSetAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      functions.logger.error(`Error setting custom claim for ${uid}:`, error);
      return;
    }
  });

/**
 * Removes the custom claim from a user account when their document is deleted
 * from the `/admins` collection.
 */
export const removeAdminClaim = functions.firestore
  .document("admins/{uid}")
  .onDelete(async (snap, context) => {
    const { uid } = context.params;
    functions.logger.log(`Removing admin claim for user: ${uid}`);
    try {
      await admin.auth().setCustomUserClaims(uid, null);
      functions.logger.log(
        `✅ Success! Custom claim removed for user: ${uid}`
      );
    } catch (error) {
      functions.logger.error(`Error removing custom claim for ${uid}:`, error);
    }
  });
