const functions = require("firebase-functions");
const FieldValue = require("firebase-admin").firestore.FieldValue;
const Web3 = require("web3");
const keccak_256 = require("js-sha3").keccak256;
const Tx = require("ethereumjs-tx").Transaction;
const {
  donContractAddress: contractAddress,
  donAbi: abi
} = require("./express-server/startup/donpia");
const {
  infuraEndPt,
  projectIdEndPt,
  projectIdEndPtUrl
} = require("./express-server/startup/infura");
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
    token !== "Donpia"
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with " +
        'one arguments "token" with valid token.'
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

  if (
    !(typeof amount === "string") ||
    !parseFloat(amount) ||
    parseFloat(amount) <= 0
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
  console.log("transfersDocRef", transfersDocRef);

  const web3 = new Web3(new Web3.providers.HttpProvider(projectIdEndPtUrl));

  console.log("contractAddress", contractAddress);
  const contract = new web3.eth.Contract(abi, contractAddress);

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
    const gasPriceWei = Web3.utils.toWei("10", "Gwei");
    const gasNum = "50000";
    const gasPrice = Web3.utils.toHex(gasPriceWei);
    const gas = Web3.utils.toHex(gasNum);
    console.log(`amtWei = ${amtWei} -- gasPrice = ${gasPrice} -- gas = ${gas}`);

    contract.from = addressFrom;
    const transferData = contract.methods
      .transfer(addressTo, amtWei)
      .encodeABI();
    const getBalanceOfData =
      "0x" +
      keccak_256.hex("balanceOf(address)").substr(0, 8) +
      "000000000000000000000000" +
      addressFrom.substr(2);

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
    console.log(`txData = ${txData}`);

    const privateKey = Buffer.from(donpia.privateKey, "hex");
    console.log("privateKey", privateKey);

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
          infuraEndPt
            .post(projectIdEndPt, {
              jsonrpc: "2.0",
              method: "eth_call",
              params: [
                {
                  to: donContractAddress,
                  data: getBalanceOfData
                },
                "latest"
              ],
              id: 1
            })
            .then(response => {
              console.log("1. >>> response", response);
              const balance = Web3.utils.fromWei(response.data.result, "ether");
              console.log("1. >>> balance", balance);
              walletsDocRef.update({
                "wallets.donpia.balance": parseFloat(balance)
              });

              return { balance };
            })
            .catch(err => console.log("err ---->>>", err));

          return resObj;
        }
      })
      .on("confirmation", (confirmationNumber, receipt) => {
        console.log(
          `confirmation recvd with confirmationNumber: ${confirmationNumber} and receipt object:`
        );
        console.log(receipt);

        if (receipt.status) {
          //console.log("Transaction confirmed with 10 confirmations");
          console.log("true receipt -> continue");
          transfersDocRef.update({
            status: "confirmed"
          });

          infuraEndPt
            .post(projectIdEndPt, {
              jsonrpc: "2.0",
              method: "eth_call",
              params: [
                {
                  to: donContractAddress,
                  data: getBalanceOfData
                },
                "latest"
              ],
              id: 1
            })
            .then(response => {
              console.log("2. >>> response", response);
              const balance = Web3.utils.fromWei(response.data.result, "ether");
              console.log("2. >>> balance", balance);
              walletsDocRef.update({
                "wallets.donpia.balance": parseFloat(balance)
              });

              return { balance };
            })
            .catch(err => console.log("err ---->>>", err));
        } else {
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
    console.log(ex);
    throw new functions.https.HttpsError("unknown error", ex.message, ex);
  }
});
