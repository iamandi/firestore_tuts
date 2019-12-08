const functions = require("firebase-functions");
const Web3 = require("web3");
const keccak_256 = require("js-sha3").keccak256;

const addWallet = require("./addUser");
const addMessage = require("./addMessage");
const getBalance = require("./getBalance");
const getUniaBalance = require("./getUniaBalance");
const sendEthereum = require("./sendEthereum");
const sendDonpia = require("./sendDonpia");

const app = require("./express-server/app");

const { donContractAddress } = require("./express-server/startup/donpia");
const {
  infuraEndPt,
  projectIdEndPt
} = require("./express-server/startup/infura");

const admin = require("./express-server/config/firebaseService");
const db = admin.firestore();

exports.addWallet = functions.auth.user().onCreate(user => {
  addWallet.handler(db, user);
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
exports.getUniaBalance = getUniaBalance;
exports.getBalance = getBalance;
exports.sendEthereum = sendEthereum;
exports.sendDonpia = sendDonpia;

exports.api = functions.https.onRequest(app);
