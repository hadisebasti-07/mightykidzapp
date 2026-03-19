import * as admin from 'firebase-admin';
import { exit } from 'process';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  // This is the UID of one of the admins you provided.
  // You can change this to the UID of any user you want to make an admin.
  const uid = 'e6uMsbihtedDmPFiJmNpDEF3Hvv1';
  
  const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

  if (!fs.existsSync(serviceAccountPath)) {
    console.error(
      '\x1b[31m%s\x1b[0m', // Red color
      `Error: serviceAccountKey.json not found in the root directory.`
    );
    console.log('Please download it from your Firebase project settings (Project settings > Service accounts > Generate new private key) and place it in the root of the project.');
    exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  console.log(`Initializing Firebase Admin SDK for project: ${serviceAccount.project_id} ...`);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log(`Setting custom claim { admin: true } for user: ${uid} ...`);

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(
      '\x1b[32m%s\x1b[0m', // Green color
      `✅ Success! User ${uid} is now an admin.`
    );
    console.log(
      '\x1b[33m%s\x1b[0m', // Yellow color
      'IMPORTANT: The user must now sign out and sign back in to the application for the new permissions to take effect.'
    );
     console.log(
      'For security, you may want to delete the `serviceAccountKey.json` file after use if you do not need it for other scripts.'
    );
  } catch (error) {
    console.error(
      '\x1b[31m%s\x1b[0m', // Red color
      'Error setting custom claims:'
    );
    console.error(error);
    exit(1);
  } finally {
    exit(0);
  }
}

main().catch((e) => {
  console.error(e);
  exit(1);
});
