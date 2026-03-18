import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Sets a custom claim on a user account when a document is created
 * in the `/admins` collection.
 */
export const setAdminClaim = onDocumentCreated("admins/{uid}", async (event) => {
    const { uid } = event.params;
    logger.log(`Setting admin claim for user: ${uid}`);
    try {
        await admin.auth().setCustomUserClaims(uid, { admin: true });
        logger.log(`✅ Success! Custom claim { admin: true } set for user: ${uid}`);
        // Optional: Write back to the document to confirm the claim was set.
        if (event.data) {
            return event.data.ref.set({ claimSetAt: new Date().toISOString() }, { merge: true });
        }
        return;
    } catch (error) {
        logger.error(`Error setting custom claim for ${uid}:`, error);
        return;
    }
});

/**
 * Removes the custom claim from a user account when their document is deleted
 * from the `/admins` collection.
 */
export const removeAdminClaim = onDocumentDeleted("admins/{uid}", async (event) => {
    const { uid } = event.params;
    logger.log(`Removing admin claim for user: ${uid}`);
    try {
        await admin.auth().setCustomUserClaims(uid, null);
        logger.log(`✅ Success! Custom claim removed for user: ${uid}`);
    } catch(error) {
        logger.error(`Error removing custom claim for ${uid}:`, error);
    }
});
