const functions = require("firebase-functions");
const FieldValue = require("firebase-admin").firestore.FieldValue;
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const {
  donContractAddress,
  donContract
} = require("./express-server/startup/donpia");
const { projectIdEndPtUrl } = require("./express-server/startup/infura");
const admin = require("./express-server/config/firebaseService");
const db = admin.firestore();

module.exports = functions.https.onCall(async (data, context) => {
  const token = data.token;
  const amount = data.amount;
  const addressTo = data.addressTo;

  if (
    !(typeof token === "string") ||
    token.length === 0 ||
    token !== "Donpia"
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with " +
        'one arguments "token" with valid token.'
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

  if (
    !(typeof amount === "string") ||
    !parseFloat(amount) ||
    parseFloat(amount) > 0
  ) {
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

  const web3 = new Web3(new Web3.providers.HttpProvider(projectIdEndPtUrl));

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
          console.log("Transaction confirmed with 10 confirmations");
          transfersDocRef.update({
            status: "confirmed"
          });

          return {
            amount: amt,
            date: FieldValue.serverTimestamp(),
            hash: hashVar,
            status: "confirmed",
            to_from: addressTo,
            token: "ETH",
            type: "sent"
          };
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
