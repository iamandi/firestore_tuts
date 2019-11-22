const functions = require("firebase-functions");
const admin = require("firebase-admin");

const addWallet = require("./addUser");

admin.initializeApp();
const db = admin.firestore();

exports.addWallet = functions.auth.user().onCreate(user => {
  addWallet.handler(db, user);
});
