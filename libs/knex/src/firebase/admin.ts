// packages/knex/src/firebase/admin.ts
import * as admin from 'firebase-admin';

function initializeFirebase() {
    if (!admin.apps.length) {
        const serviceAccount = JSON.parse(process.env['FIREBASE_SERVICE_ACCOUNT'] || '{}');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }
}

let _messaging: admin.messaging.Messaging | null = null;

export function getMessaging() {
    if (!_messaging) {
        initializeFirebase();
        _messaging = admin.messaging();
    }
    return _messaging;
}

export const firebaseAdmin = admin;
export default admin;