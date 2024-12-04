const admin = require("firebase-admin");
require("dotenv").config();
const serviceAccountBase64 = process.env.FIREBASE_KEY_BASE64;
const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountBase64, "base64").toString("utf8")
);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
