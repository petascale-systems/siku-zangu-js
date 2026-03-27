// packages/knex/src/firebase/admin.ts
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env['FIREBASE_SERVICE_ACCOUNT'] || '{}');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error) {
    }
}

export const messaging = admin.messaging();
export const firebaseAdmin = admin;
export default admin;