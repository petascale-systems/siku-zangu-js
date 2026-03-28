// packages/knex/src/firebase/admin.ts
import * as admin from 'firebase-admin';

function initializeFirebase() {
    if (!admin.apps.length) {
        try {
            let credential;
            if (process.env['FIREBASE_SERVICE_ACCOUNT']) {
                credential = admin.credential.cert(
                    JSON.parse(process.env['FIREBASE_SERVICE_ACCOUNT'])
                );
            } else if (process.env.FIREBASE_PROJECT_ID) {
                credential = admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                });
            }
            if (credential) {
                admin.initializeApp({ credential });
            }
        } catch (error) {
            console.error('Firebase Admin initialization failed:', error);
        }
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
