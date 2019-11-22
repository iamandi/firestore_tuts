const cw = require("crypto-wallets");

exports.handler = (db, user) => {
  const uid = user.uid;
  console.log(`uid: ${uid}`);

  const userRef = db.collection("users");
  const walletRef = db.collection("wallets");
  const walletPrivRef = db.collection("walletsPrivate");
  const unimoneyRef = db.collection("unimoney");

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
    wallet: [
      {
        rank: 1,
        ticker: "DON",
        token: "Donpia",
        balance: 0,
        balanceUsd: 0,
        publicAddress: ethWallet.address,
        classes: "red"
      },
      {
        rank: 2,
        ticker: "BTC",
        token: "Bitcoin",
        balance: 0,
        balanceUsd: 0,
        publicAddress: btcWallet.address,
        classes: "orange"
      },
      {
        rank: 3,
        ticker: "ETH",
        token: "Ethereum",
        balance: 0,
        balanceUsd: 0,

        publicAddress: ethWallet.address,
        classes: "green"
      }
    ],
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
};
