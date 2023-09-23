var admin = require("firebase-admin");

var serviceAccount = require("./taxi-poc.json");

// Initialize Cloud Storage and get a reference to the service

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "taxi-go-cabs-ramesh.appspot.com"
});

module.exports = admin;