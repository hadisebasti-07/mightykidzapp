import * as admin from 'firebase-admin';
import { exit } from 'process';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

  if (!fs.existsSync(serviceAccountPath)) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: serviceAccountKey.json not found in the root directory.');
    console.log('Download it from Firebase project settings > Service accounts > Generate new private key.');
    exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const db = admin.firestore();
  const kidsSnap = await db.collection('kids').get();

  if (kidsSnap.empty) {
    console.log('No kids found.');
    exit(0);
  }

  // Firestore batches are limited to 500 writes each
  const BATCH_SIZE = 500;
  let updated = 0;
  let skipped = 0;
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of kidsSnap.docs) {
    const data = doc.data();
    if (data.barcode === doc.id) {
      skipped++;
      continue;
    }
    batch.update(doc.ref, { barcode: doc.id });
    updated++;
    batchCount++;

    if (batchCount === BATCH_SIZE) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
      console.log(`Committed batch, ${updated} updated so far...`);
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log('\x1b[32m%s\x1b[0m', `✅ Done. ${updated} kids updated, ${skipped} already had correct barcode.`);
  exit(0);
}

main().catch((e) => {
  console.error(e);
  exit(1);
});
