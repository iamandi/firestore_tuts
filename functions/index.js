const functions = require("firebase-functions");
const admin = require("firebase-admin");
const moment = require("moment");
const cors = require("cors");
const express = require("express");
const app = express();

const addWallet = require("./addUser");

admin.initializeApp();
const db = admin.firestore();

exports.addWallet = functions.auth.user().onCreate(user => {
  addWallet.handler(db, user);
});

exports.date = functions.https.onRequest((req, res) => {
  const formattedDate = moment();
  console.log("Sending Formatted date:", formattedDate);
  res.status(200).send(formattedDate);
});

app.use(cors({ origin: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post("/my-wallet/refresh/:uid", (req, res) => {
  const uid = req.params.uid;

  console.log("/my-wallet/refresh/:uid", uid);
  console.log(req.body);

  res.send(req.body);
});

app.post("/send-recieve-crypto/send/:uid", (req, res) => {
  const uid = req.params.uid;

  console.log("/send-recieve-crypto/send/:uid", uid);
  console.log(req.body);

  res.send(req.body);
});

app.post("/buy-sell-crypto/buy/:uid", (req, res) => {
  const uid = req.params.uid;

  console.log("/buy-sell-crypto/buy/:uid", uid);
  console.log(req.body);

  res.send(req.body);
});

app.post("/buy-sell-crypto/sell/:uid", (req, res) => {
  const uid = req.params.uid;

  console.log("/buy-sell-crypto/sell/:uid", uid);
  console.log(req.body);

  res.send(req.body);
});

app.get("/hello", (req, res) => {
  console.log("Hello World!");
  console.log(req);
  res.send("Hello World!");
});

exports.widgets = functions.https.onRequest(app);
