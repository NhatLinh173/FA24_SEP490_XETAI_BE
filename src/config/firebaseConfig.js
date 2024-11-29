const admin = require("firebase-admin");
const serviceAccount = require("./xatai-a1865-firebase-adminsdk-uuwhv-3e9bc5b707.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
