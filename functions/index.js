const cw = require("crypto-wallets");
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const userRef = db.collection("users");
const walletRef = db.collection("wallets");
const walletPrivRef = db.collection("walletsPrivate");

exports.addWallet = functions.auth.user().onCreate(user => {
  const uid = user.uid;
  console.log(`uid: ${uid}`);

  const batch = db.batch();

  const email = user.email; // The email of the user.
  const displayName = user.displayName ? user.displayName : ""; // The display name of the user.
  const firstName = user.firstName ? user.firstName : "";
  const lastName = user.lastName ? user.lastName : "";
  const phone = user.phone ? user.phone : "";
  const userProfile = {
    email,
    displayName,
    firstName,
    lastName,
    phone
  };

  const btcWallet = cw.generateWallet("BTC");
  const ethWallet = cw.generateWallet("ETH");
  const wallet = {
    bitcoin: { balance: 0, publicAddress: btcWallet.address },
    ethereum: { balance: 0, publicAddress: ethWallet.address },
    donpia: { balance: 0, publicAddress: ethWallet.address },
    uid
  };
  const walletPrivate = {
    bitcoin: { privateKey: btcWallet.privateKey },
    ethereum: { privateKey: ethWallet.privateKey },
    donpia: { privateKey: ethWallet.privateKey },
    uid
  };

  const userDocRef = userRef.doc(uid);
  const walletDocRef = walletRef.doc(uid);
  const walletPrivDocRef = walletPrivRef.doc(uid);

  batch.set(userDocRef, userProfile);
  batch.set(walletDocRef, wallet);
  batch.set(walletPrivDocRef, walletPrivate);

  return batch.commit();
});

/* exports.addWalletPrivate = functions.auth.user().onCreate(user => {
  const uid = user.uid;
  const btcWallet = cw.generateWallet("BTC");
  const ethWallet = cw.generateWallet("ETH");
  const walletPrivate = {
    bitcoin: { privateKey: btcWallet.privateKey },
    ethereum: { privateKey: ethWallet.privateKey },
    donpia: { privateKey: ethWallet.privateKey },
    uid
  };
  const docRef = walletPrivRef.doc(uid);

  return docRef.set(walletPrivate);
});

exports.createProfile = functions.auth.user().onCreate(user => {
  const email = user.email; // The email of the user.
  const displayName = user.displayName ? user.displayName : ""; // The display name of the user.
  const firstName = user.firstName ? user.firstName : "";
  const lastName = user.lastName ? user.lastName : "";
  const phone = user.phone ? user.phone : "";
  console.log(user);
  console.log(`user.uid: ${user.uid}`);

  const docRef = userRef.doc();

  return docRef.set({
    email,
    displayName,
    firstName,
    lastName,
    phone
  });
});
 */

/* exports.addWallet = functions.firestore
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
  }); */
