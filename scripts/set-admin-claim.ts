import * as admin from 'firebase-admin';
import { exit } from 'process';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const uid = 'e6uMsbihtedDmPFiJmNpDEF3Hvv1';
  const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

  if (!fs.existsSync(serviceAccountPath)) {
    console.error(
      '\x1b[31m%s\x1b[0m',
      `Error: serviceAccountKey.json not found in the root directory.`
    );
    console.log('Please download it from your Firebase project settings and place it in the root of the project.');
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
      '\x1b[32m%s\x1b[0m',
      `✅ Success! User ${uid} is now an admin.`
    );
    console.log(
      '\x1b[33m%s\x1b[0m',
      'IMPORTANT: You must now sign out and sign back in to the application for the changes to take effect.'
    );
    console.log('For security, you should now delete the `serviceAccountKey.json` file.');
  } catch (error) {
    console.error(
      '\x1b[31m%s\x1b[0m',
      'Error setting custom claims:'
    );
    console.error(error);
    exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  exit(1);
});
