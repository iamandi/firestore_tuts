const functions = require("firebase-functions");
const FieldValue = require("firebase-admin").firestore.FieldValue;
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const {
  donContractAddress,
  donContract
} = require("./express-server/startup/donpia");
const web3 = require("./express-server/startup/web3");
const admin = require("./express-server/config/firebaseService");
const db = admin.firestore();

module.exports = functions.https.onCall(async (data, context) => {
  const ticker = data.ticker;
  const amount = data.amount;
  const addressTo = data.addressTo;

  if (!(typeof ticker === "string") || ticker.length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with " +
        'one arguments "ticker" with valid ticker.'
    );
  }

  // TODO: validate ethereum address
  if (!(typeof addressTo === "string") || addressTo.length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with " +
        'one arguments "addressTo" with valid addressTo.'
    );
  }

  if (!(typeof amount === "number") || amount > 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with " +
        'one arguments "amount" with valid amount.'
    );
  }

  // Checking that the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called " + "while authenticated."
    );
  }

  const uid = context.auth.uid;
  const walletsDocRef = db.collection("wallets").doc(uid);
  const walletsPrivateDocRef = db.collection("walletsPrivate").doc(uid);
  const transfersDocRef = db.collection(`${uid}_transfers`).doc();

  try {
    const walletsDoc = await walletsDocRef.get();
    if (!walletsDoc.exists)
      throw new functions.https.HttpsError("404: No such doc");

    const walletsPrivateDoc = await walletsPrivateDocRef.get();
    if (!walletsPrivateDoc.exists)
      throw new functions.https.HttpsError("404: No such doc");

    const { wallets } = walletsDoc.data();
    const addressFrom = wallets.donpia.publicAddress;

    const { donpia } = walletsPrivateDoc.data();
    const privateKey = Buffer.from(donpia.privateKey, "hex");

    const gasPrice = Web3.utils.toHex(Web3.utils.toWei("10", "Gwei"));
    const gas = Web3.utils.toHex("50000");

    donContract.from = addressFrom;
    const data = donContract.methods
      .transfer(addressTo, web3.utils.toWei(amount, "ether"))
      .encodeABI();

    const txCount = await web3.eth.getTransactionCount(addressFrom);
    const txData = {
      nonce: web3.utils.toHex(txCount),
      gas,
      gasPrice,
      to: donContractAddress,
      from: addressFrom,
      value: "0x0",
      data,
      chainId: 1
    };

    const transaction = new Tx(txData);
    transaction.sign(privateKey);
    const serializedTx = transaction.serialize().toString("hex");

    let hashVar = "";
    web3.eth
      .sendSignedTransaction("0x" + serializedTx)
      .on("transactionHash", hash => {
        console.log("hash recvd, create a new doc", hash);

        hashVar = hash;
        transfersDocRef.set({
          amount: amt,
          date: FieldValue.serverTimestamp(),
          hash,
          status: "pending",
          to_from: addressTo,
          token: "DON",
          type: "sent"
        });
      })
      .on("receipt", receipt => {
        console.log("receipt recvd", receipt);
      })
      .on("confirmation", (confirmationNumber, receipt) => {
        console.log(
          `confirmation recvd with confirmationNumber: ${confirmationNumber} and receipt: ${receipt}`
        );
        if (confirmationNumber === 10) {
          console.log("Transaction successful with 10 confirmations");
          transfersDocRef.update({
            status: "successful"
          });
        }
      })
      .on("error", err => {
        console.log(err);
        transfersDocRef.set(
          {
            amount: amt,
            date: FieldValue.serverTimestamp(),
            hash: hashVar,
            status: "cancelled",
            to_from: addressTo,
            token: "DON",
            type: "sent"
          },
          { merge: true }
        );

        throw new functions.https.HttpsError(
          "blockchain error",
          err.message,
          err
        );
      });
  } catch (ex) {
    throw new functions.https.HttpsError("unknown error", ex.message, ex);
  }
});
