const functions = require("firebase-functions");
const FieldValue = require("firebase-admin").firestore.FieldValue;
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const { projectIdEndPtUrl } = require("./express-server/startup/infura");
const admin = require("./express-server/config/firebaseService");
const db = admin.firestore();

module.exports = functions.https.onCall(async (data, context) => {
  const token = data.token;
  const amount = data.amount;
  const addressTo = data.addressTo;
  console.log(
    `token = ${token} -- amount = ${amount} -- addressTo = ${addressTo}`
  );

  if (
    !(typeof token === "string") ||
    token.length === 0 ||
    token !== "Ethereum"
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with " +
        'one arguments "ticker" with valid ticker.'
    );
  }

  if (
    !(typeof addressTo === "string") ||
    addressTo.length === 0 ||
    !Web3.utils.isAddress(addressTo)
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with " +
        'one arguments "addressTo" with valid addressTo.'
    );
  }

  console.log("amount", parseFloat(amount));
  if (!(typeof amount === "string") || parseFloat(amount) <= 0) {
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
  console.log("transfersDocRef", transfersDocRef);

  const web3 = new Web3(new Web3.providers.HttpProvider(projectIdEndPtUrl));

  try {
    const walletsDoc = await walletsDocRef.get();
    console.log("walletsDoc", walletsDoc);
    if (!walletsDoc.exists)
      throw new functions.https.HttpsError("404: No such doc");

    const walletsPrivateDoc = await walletsPrivateDocRef.get();
    if (!walletsPrivateDoc.exists)
      throw new functions.https.HttpsError("404: No such doc");

    console.log("walletsPrivateDoc", walletsPrivateDoc);

    const { wallets } = walletsDoc.data();
    console.log("wallets", wallets);
    const { publicAddress: addressFrom } = wallets.ethereum;

    const { ethereum } = walletsPrivateDoc.data();
    console.log("ethereum", ethereum);
    const privateKey = Buffer.from(ethereum.privateKey, "hex");
    console.log("privateKey", privateKey);

    const amtWei = Web3.utils.toWei(amount, "ether");
    const gasPriceWei = Web3.utils.toWei("20", "Gwei");
    const gasNum = "21000";
    const amt = Web3.utils.toHex(amtWei);
    const gasPrice = Web3.utils.toHex(gasPriceWei);
    const gas = Web3.utils.toHex(gasNum);
    console.log(`amt = ${amt} -- gasPrice = ${gasPrice} -- gas = ${gas}`);

    const txCount = await web3.eth.getTransactionCount(addressFrom);
    console.log(`txCount = ${txCount}`);
    const txData = {
      nonce: Web3.utils.toHex(txCount),
      gas,
      gasPrice,
      to: addressTo,
      from: addressFrom,
      value: amt,
      chainId: 1
    };
    console.log(`txData = ${txData}`);

    const transaction = new Tx(txData);
    transaction.sign(privateKey);
    const serializedTx = transaction.serialize().toString("hex");
    console.log("serializedTx", serializedTx);

    let hashVar = "";
    web3.eth
      .sendSignedTransaction("0x" + serializedTx)
      .on("transactionHash", hash => {
        console.log("hash recvd, create a new doc", hash);

        hashVar = hash;
        transfersDocRef.set({
          amount: parseFloat(amount),
          date: FieldValue.serverTimestamp(),
          hash,
          status: "pending",
          to_from: addressTo,
          token: "ETH",
          type: "sent"
        });
      })
      .on("receipt", receipt => {
        console.log("receipt recvd", receipt);
        web3.eth
          .getBalance(addressFrom)
          .then(balanceWei => {
            const balanceEth = Web3.utils.fromWei(balanceWei, "ether");
            console.log("receipt +++++ balance in ETH : ", balanceEth);

            walletsDocRef.update({
              "wallets.ethereum.balance": balanceEth
            });

            return balanceEth;
          })
          .catch(err => console.log(err));

        return {
          amount: parseFloat(amount),
          date: FieldValue.serverTimestamp(),
          hash: hashVar,
          status: "confirmed",
          to_from: addressTo,
          token: "ETH",
          type: "sent"
        };
      })
      .on("confirmation", (confirmationNumber, receipt) => {
        console.log(
          `confirmation recvd with confirmationNumber: ${confirmationNumber} and receipt object:`
        );
        console.log(receipt);

        if (confirmationNumber === 10) {
          console.log("Transaction confirmed with 10 confirmations");
          transfersDocRef.update({
            status: "confirmed"
          });

          web3.eth
            .getBalance(addressFrom)
            .then(balanceWei => {
              const balanceEth = Web3.utils.fromWei(balanceWei, "ether");
              console.log("receipt +++++ balance in ETH : ", balanceEth);

              walletsDocRef.update({
                "wallets.ethereum.balance": balanceEth
              });

              return balanceEth;
            })
            .catch(err => console.log(err));
        } else if (confirmationNumber > 30) {
          exit();
        }
      })
      .on("error", err => {
        console.log(err);
        transfersDocRef.set(
          {
            amount: parseFloat(amount),
            date: FieldValue.serverTimestamp(),
            hash: hashVar,
            status: "cancelled",
            to_from: addressTo,
            token: "ETH",
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
