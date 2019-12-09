const functions = require("firebase-functions");
const FieldValue = require("firebase-admin").firestore.FieldValue;
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const {
  donContractAddress: contractAddress,
  donAbi: abi
} = require("./express-server/startup/donpia");
const { projectIdEndPtUrl } = require("./express-server/startup/infura");
const model = require("./model/sendDonpiaModel");
const getBalance = require("./utils/getBalanceDonpia");

const admin = require("./express-server/config/firebaseService");
const db = admin.firestore();

const web3 = new Web3(new Web3.providers.HttpProvider(projectIdEndPtUrl));
const contract = new web3.eth.Contract(abi, contractAddress);
const GAS_NUM = "50000";
const GAS_PRICE = "10";

module.exports = functions.https.onCall(async (data, context) => {
  const { token, amount, addressTo } = data;

  const { error, errorMessage } = model(data);
  if (error) throw new functions.https.HttpsError(error, errorMessage);

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
      throw new functions.https.HttpsError("404: No such doc");

    const walletsPrivateDoc = await walletsPrivateDocRef.get();
    console.log("walletsPrivateDoc", walletsPrivateDoc);
    if (!walletsPrivateDoc.exists)
      throw new functions.https.HttpsError("404: No such doc");

    const { wallets } = walletsDoc.data();
    console.log("wallets", wallets);
    const { publicAddress: addressFrom } = wallets.donpia;

    const { donpia } = walletsPrivateDoc.data();
    console.log("donpia", donpia);

    const amtWei = web3.utils.toWei(amount, "ether");
    const gasPrice = Web3.utils.toHex(Web3.utils.toWei(GAS_PRICE, "Gwei"));
    const gas = Web3.utils.toHex(GAS_NUM);
    console.log(`amtWei = ${amtWei} -- gasPrice = ${gasPrice} -- gas = ${gas}`);

    contract.from = addressFrom;
    const transferData = contract.methods
      .transfer(addressTo, amtWei)
      .encodeABI();

    const txCount = await web3.eth.getTransactionCount(addressFrom);
    const txData = {
      nonce: web3.utils.toHex(txCount),
      gas,
      gasPrice,
      to: contractAddress,
      from: addressFrom,
      value: "0x0",
      data: transferData,
      chainId: 1
    };

    const privateKey = Buffer.from(donpia.privateKey, "hex");
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
          token: "DON",
          type: "sent"
        });
      })
      .on("receipt", receipt => {
        console.log("receipt recvd", receipt);

        const resObj = {
          amount: parseFloat(amount),
          date: FieldValue.serverTimestamp(),
          hash: hashVar,
          status: "confirmed",
          to_from: addressTo,
          token: "DON",
          type: "sent"
        };

        if (!receipt.status) {
          resObj.status = "cancelled";
          console.log("false receipt... returning");
          return resObj;
        } else {
          console.log("Getting DON balance");

          const { error, balanceWei } = getBalance(addressFrom);
          if (error) {
            console.log("getBalance error", error);
            return { error };
          } else console.log("getBalance balanceWei", balanceWei);

          const balance = web3.utils.fromWei(balanceWei, "ether");
          console.log("getBalance balance in DON : ", balance);

          walletsDocRef.update({
            "wallets.donpia.balance": parseFloat(balance)
          });

          return { balance };
        }
      })
      .on("confirmation", (confirmationNumber, receipt) => {
        console.log(`confirmation: confirmationNumber: ${confirmationNumber}`);
        console.log("receipt", receipt);

        if (receipt.status) {
          //console.log("Transaction confirmed with 10 confirmations");
          console.log("true receipt -> continue");
          transfersDocRef.update({
            status: "confirmed"
          });

          const { error, balanceWei } = getBalance(addressFrom);
          if (error) {
            console.log("getBalance error", error);
            return { error };
          } else console.log("getBalance balanceWei", balanceWei);

          const balance = web3.utils.fromWei(balanceWei, "ether");
          console.log("getBalance balance in DON : ", balance);

          walletsDocRef.update({
            "wallets.donpia.balance": parseFloat(balance)
          });

          return { balance };
        } else {
          exit();
        }
      })
      .on("error", err => {
        console.log("sendDonpia blockchain error", err);
        if (hashVar.trim() !== "") {
          transfersDocRef.set(
            {
              amount: parseFloat(amount),
              date: FieldValue.serverTimestamp(),
              hash: hashVar,
              status: "cancelled",
              to_from: addressTo,
              token: "DON",
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
    console.log(ex);
    throw new functions.https.HttpsError("unknown error", ex.message, ex);
  }
});
