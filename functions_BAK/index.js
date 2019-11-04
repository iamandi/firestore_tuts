const cw = require("crypto-wallets");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();
const walletRef = db.collection("wallets");
const walletPrivRef = db.collection("walletsPrivate");

const btcWallet = cw.generateWallet("BTC");
const ethWallet = cw.generateWallet("ETH");

exports.addWallet = functions.firestore
  .document("/users/{userId}")
  .onCreate((snap, context) => {
    const newValue = snap.data();

    const userId = context.params.userId;
    console.log(`userId: ${context.params.userId}`);

    const wallet = {
      bitcoin: { balance: 0, publicAddress: btcWallet.address },
      ethereum: { balance: 0, publicAddress: ethWallet.address },
      donpia: { balance: 0, publicAddress: ethWallet.address },
      userId
    };

    const docRef = walletRef.doc(userId);

    return docRef.set(wallet);
  });

exports.addWalletPrivate = functions.firestore
  .document("/users/{userId}")
  .onCreate((snap, context) => {
    const userId = context.params.userId;

    const walletPrivate = {
      bitcoin: { privateKey: btcWallet.privateKey },
      ethereum: { privateKey: ethWallet.privateKey },
      donpia: { privateKey: ethWallet.privateKey },
      userId
    };

    const docRef = walletPrivRef.doc(userId);

    return docRef.set(walletPrivate);
  });
