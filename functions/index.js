const moment = require("moment");
const functions = require("firebase-functions");

const addWallet = require("./addUser");
const addMessage = require("./addMessage");
const app = require("./express-server/app");

const admin = require("./express-server/config/firebaseService");
const db = admin.firestore();

exports.addWallet = functions.auth.user().onCreate(user => {
  addWallet.handler(db, user);
});

exports.date = functions.https.onRequest((req, res) => {
  const formattedDate = moment();
  console.log("Sending Formatted date:", formattedDate);
  res.status(200).send(formattedDate);
});

app.get("/hello", (req, res) => {
  console.log("Hello World!");
  console.log("Proejct ID", functions.config().infura_project.id);
  console.log("headers:", req.headers.authorization);
  res.send(
    `Hello World! with ProjectID: ${functions.config().infura_project.id}`
  );
});

exports.addMessage = addMessage;

exports.api = functions.https.onRequest(app);
