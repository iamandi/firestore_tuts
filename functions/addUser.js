const cw = require("crypto-wallets");
const randomstring = require("randomstring");

exports.handler = (db, user) => {
  const uid = user.uid;
  console.log(`uid: ${uid}`);
  console.log("registered user: ", user);
  console.log("registered user.toJSON(): ", user.toJSON());

  const batch = db.batch();

  const userRef = db.collection("users");
  const walletRef = db.collection("wallets");
  const walletPrivRef = db.collection("walletsPrivate");
  const referralsRef = db.collection(`${uid}_referrals`);

  const email = user.email; // The email of the user.
  const displayName = user.displayName ? user.displayName : ""; // The display name of the user.
  const firstName = displayName.split(" ")[0] ? displayName.split(" ")[0] : "";
  const lastName = displayName.split(" ")[1] ? displayName.split(" ")[1] : "";
  const phoneNumber = user.phoneNumber ? user.phoneNumber : "";
  const photoURL = user.photoURL ? user.photoURL : "";

  const userProfile = {
    email,
    displayName,
    firstName,
    lastName,
    phoneNumber,
    photoURL
  };
  console.log("userProfile", userProfile);

  const btcWallet = cw.generateWallet("BTC");
  const ethWallet = cw.generateWallet("ETH");
  const wallet = {
    wallets: {
      donpia: {
        rank: 1,
        ticker: "DON",
        token: "Donpia",
        balance: 0,
        balanceUsd: 0,
        publicAddress: ethWallet.address,
        classes: "red"
      },
      bitcoin: {
        rank: 2,
        ticker: "BTC",
        token: "Bitcoin",
        balance: 0,
        balanceUsd: 0,
        publicAddress: btcWallet.address,
        classes: "orange"
      },
      ethereum: {
        rank: 3,
        ticker: "ETH",
        token: "Ethereum",
        balance: 0,
        balanceUsd: 0,
        publicAddress: ethWallet.address,
        classes: "green"
      }
    },
    uid
  };
  console.log("wallet", wallet);

  const walletPrivate = {
    bitcoin: { privateKey: btcWallet.privateKey },
    ethereum: { privateKey: ethWallet.privateKey.substr(2) },
    donpia: { privateKey: ethWallet.privateKey.substr(2) },
    uid
  };

  const referralID = randomstring.generate({
    length: 7,
    capitalization: "lowercase"
  });
  const referralLevel = "silver";
  const referralURL = `http://localhost:3000/K-${referralID}`;
  const referralInfo = {
    balance: 5000,
    referralID,
    referralLevel,
    referralURL,
    uid
  };
  console.log("referralInfo", referralInfo);

  const userDocRef = userRef.doc(uid);
  console.log("userDocRef", userDocRef);
  const walletDocRef = walletRef.doc(uid);
  console.log("walletDocRef", walletDocRef);
  const walletPrivDocRef = walletPrivRef.doc(uid);
  console.log("walletPrivDocRef", walletPrivDocRef);
  const referralsDocRef = referralsRef.doc("referralInfo");
  console.log("referralsDocRef", referralsDocRef);

  batch.set(userDocRef, userProfile);
  batch.set(walletDocRef, wallet);
  batch.set(walletPrivDocRef, walletPrivate);
  batch.set(referralsDocRef, referralInfo);

  batch
    .commit()
    .then(batchCommitted => {
      console.log("batchCommitted", batchCommitted);
      return batchCommitted;
    })
    .catch(error => {
      console.log("error", error);
      return error;
    });

  return 0;
};
