const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();
const walletRef = db.collection("wallets");
const walletPrivRef = db.collection("walletsPrivate");

exports.addWallet = functions.firestore
  .document("/users/{userId}")
  .onCreate((snap, context) => {
    const newValue = snap.data();
    console.log({ newValue });

    const userId = context.params.userId;
    console.log(`userId: ${context.params.userId}`);

    const wallet = {
      bitcoin: { balance: 0, publicAddress: "lqewnjeflkwef" },
      donpia: { balance: 0, publicAddress: "lqewnjeflkwef" },
      ethereum: { balance: 0, publicAddress: "lqewnjeflkwef" },
      userId
    };

    const docRef = walletRef.doc(userId);

    return docRef.set(wallet);
  });
