const admin = require('firebase-admin');
let db = null;

try {
  const serviceAccount = require('../env/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  db = admin.firestore();
  console.log('Firebase service initialized.');
} catch (error) {
  console.error('Firebase initialization failed. Add env/serviceAccountKey.json with valid credentials to enable Firebase.', error.message);
}

module.exports = db;
