import admin from 'firebase-admin'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? admin.credential.applicationDefault()
      : admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
          clientEmail: 'demo@demo-project.iam.gserviceaccount.com',
          privateKey: '-----BEGIN RSA PRIVATE KEY-----\nMIIBogIBAAJBAL...\n-----END RSA PRIVATE KEY-----\n',
        }),
    projectId: process.env.FIREBASE_PROJECT_ID,
  })
}

export const firebaseAuth = admin.auth()
