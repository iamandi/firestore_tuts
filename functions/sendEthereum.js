const functions = require("firebase-functions");
const FieldValue = require("firebase-admin").firestore.FieldValue;
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;

const model = require("./model/sendEthereumModel");
const getBalance = require("./utils/getBalanceEthereum");
const { projectIdEndPtUrl } = require("./express-server/startup/infura");
const admin = require("./express-server/config/firebaseService");
const db = admin.firestore();

const web3 = new Web3(new Web3.providers.HttpProvider(projectIdEndPtUrl));
const GAS_NUM = "21000";
const GAS_PRICE = "20";

module.exports = functions.https.onCall(async (data, context) => {
  const { token, amount, addressTo } = data;
  console.log(`token = ${token}, amount = ${amount}, addressTo = ${addressTo}`);

  const { error, errorMessage } = model(data);
  if (error) throw new functions.https.HttpsError(error, errorMessage);

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
    console.log("walletsDoc", walletsDoc);
    if (!walletsDoc.exists)
      throw new functions.https.HttpsError("404", "No such doc");

    const walletsPrivateDoc = await walletsPrivateDocRef.get();
    console.log("walletsPrivateDoc", walletsPrivateDoc);
    if (!walletsPrivateDoc.exists)
      throw new functions.https.HttpsError("404", "No such doc");

    const { wallets } = walletsDoc.data();
    console.log("wallets", wallets);
    const { publicAddress: addressFrom } = wallets.ethereum;

    const { ethereum } = walletsPrivateDoc.data();
    console.log("ethereum", ethereum);
    const privateKey = Buffer.from(ethereum.privateKey, "hex");

    const amt = Web3.utils.toHex(Web3.utils.toWei(amount, "ether"));
    const gasPrice = Web3.utils.toHex(Web3.utils.toWei(GAS_PRICE, "Gwei"));
    const gas = Web3.utils.toHex(GAS_NUM);
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

    const transaction = new Tx(txData);
    transaction.sign(privateKey);
    const serializedTx = transaction.serialize().toString("hex");
    console.log("serializedTx", serializedTx);

    let hashVar = "";
    web3.eth
      .sendSignedTransaction("0x" + serializedTx)
      .on("transactionHash", hash => {
        console.log("hash recvd:", hash);

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

        const { error, balanceWei } = getBalance(web3, addressFrom);
        if (error) {
          console.log("getBalance error", error);
          return { error };
        } else console.log("getBalance balanceWei", balanceWei);

        const balanceEth = web3.utils.fromWei(balanceWei, "ether");
        console.log("getBalance balance in ETH : ", balanceEth);

        walletsDocRef.update({
          "wallets.ethereum.balance": balanceEth
        });

        return {
          amount: parseFloat(amount),
          hash: hashVar
        };
      })
      .on("confirmation", (confirmationNumber, receipt) => {
        console.log(`confirmation: confirmationNumber: ${confirmationNumber}`);
        console.log("receipt", receipt);

        if (receipt.status) {
          if (confirmationNumber === 1) {
            console.log("Transaction confirmed with 1 confirmations");
            transfersDocRef.update({
              status: "confirmed"
            });

            const { error, balanceEth } = getBalance(web3, addressFrom);
            if (error) {
              console.log("getBalance error", error);
              return { error };
            } else console.log("getBalance balanceEth", balanceEth);

            walletsDocRef.update({
              "wallets.ethereum.balance": balanceEth
            });
          } else if (confirmationNumber > 30) {
            exit();
          }
        } else {
          exit();
        }
      })
      .on("error", err => {
        console.log("sendEthereum blockchain error", err);
        if (hashVar.trim() !== "") {
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
        }

        throw new functions.https.HttpsError(
          "blockchain error",
          err.message,
          err
        );
      });
  } catch (ex) {
    console.log("sendEthereum exception:", ex);
    throw new functions.https.HttpsError("unknown error", ex.message, ex);
  }
});
