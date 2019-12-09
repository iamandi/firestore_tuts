const functions = require("firebase-functions");
const Web3 = require("web3");
const keccak_256 = require("js-sha3").keccak256;

const { donContractAddress } = require("./express-server/startup/donpia");
const {
  infuraEndPt,
  projectIdEndPt
} = require("./express-server/startup/infura");
const admin = require("./express-server/config/firebaseService");
const db = admin.firestore();

module.exports = functions.https.onCall(async (data, context) => {
  const ticker = data.ticker;

  if (!(typeof ticker === "string") || ticker.length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with " +
        'one arguments "ticker" with valid ticker.'
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

  try {
    const doc = await walletsDocRef.get();
    if (!doc.exists) throw new functions.https.HttpsError("404: No such doc");

    const { wallets } = doc.data();
    const { ethereum, donpia } = wallets;

    if (ticker === ethereum.ticker) {
      const address = ethereum.publicAddress;
      console.log("address:", address, "ticker:", ethereum.ticker);

      const response = await infuraEndPt.post(projectIdEndPt, {
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1
      });
      console.log("response", response);

      /// TODO: Error handling for response

      const balance = Web3.utils.fromWei(response.data.result, "ether");
      console.log(">>> balance: " + balance + " ETH");

      walletsDocRef.update({ "wallets.ethereum.balance": parseFloat(balance) });

      return { balance };
    } else if (ticker === donpia.ticker) {
      const address = donpia.publicAddress;
      console.log("address:", address, "ticker:", donpia.ticker);

      const data =
        "0x" +
        keccak_256.hex("balanceOf(address)").substr(0, 8) +
        "000000000000000000000000" +
        address.substr(2);
      const response = await infuraEndPt.post(projectIdEndPt, {
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
          {
            to: donContractAddress,
            data: data
          },
          "latest"
        ],
        id: 1
      });
      console.log("response", response);

      /// TODO: Error handling for response

      const balance = Web3.utils.fromWei(response.data.result, "ether");
      console.log(">>> balance: " + balance + " DON");

      walletsDocRef.update({ "wallets.donpia.balance": parseFloat(balance) });

      return { balance };
    }
  } catch (ex) {
    throw new functions.https.HttpsError("unknown error", ex.message, ex);
  }
});
