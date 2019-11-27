const moment = require("moment");
const functions = require("firebase-functions");

const addWallet = require("./addUser");
const addMessage = require("./addMessage");
const app = require("./express-server/app");

const admin = require("./express-server/config/firebaseService");
const db = admin.firestore();

const TOKENS = ["BTC", "ETH", "DON"];

exports.addWallet = functions.auth.user().onCreate(user => {
  addWallet.handler(db, user);
});

exports.date = functions.https.onRequest((req, res) => {
  const formattedDate = moment();
  console.log("Sending Formatted date:", formattedDate);
  res.status(200).send(formattedDate);
});

app.get("/hello", (req, res) => {
  console.log("Hello World!");
  console.log("Proejct ID", functions.config().infura_project.id);
  console.log("headers:", req.headers.authorization);
  res.send(
    `Hello World! with ProjectID: ${functions.config().infura_project.id}`
  );
});

exports.addMessage = addMessage;

exports.getBalance = functions.https.onCall(async (data, context) => {
  const token = data.token;
  if (
    !(typeof token === "string") ||
    token.length === 0 ||
    TOKENS.includes(token)
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with " +
        'one arguments "token" with valid token.'
    );
  }
  // Checking that the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called " + "while authenticated."
    );
  }

  const walletRef = db.collection("wallets").doc(context.auth.uid);
  const doc = walletRef.get();

  let address = "";
  if (token === "DON") {
    address = doc.data().wallet[0].publicAddress;
  } else if (token === "BTC") {
    address = doc.data().wallet[1].publicAddress;
  } else if (token === "ETH") {
    address = doc.data().wallet[2].publicAddress;
    try {
      response = await infuraEndPt.post(projectIdEndPt, {
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1
      });

      const balance = Web3.utils.fromWei(response.data.result, "ether");
      console.log(">>> " + balance + " ETH in small Account");

      walletRef.set();

      return (
        walletRef
          .set({})
          .then(() => {
            console.log("New Message written");
            // Returning the sanitized message to the client.
            return { text: sanitizedMessage };
          })
          // [END returnMessageAsync]
          .catch(error => {
            // Re-throwing the error as an HttpsError so that the client gets the error details.
            throw new functions.https.HttpsError(
              "unknown",
              error.message,
              error
            );
          })
      );
    } catch (ex) {
      throw new functions.https.HttpsError(
        "unknown blockchain error",
        ex.message
      );
    }
  } else throw new functions.https.HttpsError("Token does not exist");

  try {
    response = await infuraEndPt.post(projectIdEndPt, {
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [account, "latest"],
      id: 1
    });

    const balance = Web3.utils.fromWei(response.data.result, "ether");
    console.log(">>> " + balance + " ETH in small Account");

    return (
      db
        .ref("/messages")
        .push({
          text: sanitizedMessage,
          author: { uid, name, picture, email }
        })
        .then(() => {
          console.log("New Message written");
          // Returning the sanitized message to the client.
          return { text: sanitizedMessage };
        })
        // [END returnMessageAsync]
        .catch(error => {
          // Re-throwing the error as an HttpsError so that the client gets the error details.
          throw new functions.https.HttpsError("unknown", error.message, error);
        })
    );
  } catch (ex) {
    throw new functions.https.HttpsError(
      "unknown blockchain error",
      ex.message
    );
  }

  infuraEndPt
    .post(projectIdEndPt, {
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [account, "latest"],
      id: 1
    })
    .then(response => {
      var balance = Web3.utils.fromWei(response.data.result, "ether");
      console.log(">>> " + balance + " ETH in small Account");
      return res.send(balance);
    })
    .catch(ex => {
      console.log(ex.message);
      return res.status(500).send(ex.message);
    });

  return (
    db
      .ref("/messages")
      .push({
        text: sanitizedMessage,
        author: { uid, name, picture, email }
      })
      .then(() => {
        console.log("New Message written");
        // Returning the sanitized message to the client.
        return { text: sanitizedMessage };
      })
      // [END returnMessageAsync]
      .catch(error => {
        // Re-throwing the error as an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError("unknown", error.message, error);
      })
  );
});

exports.api = functions.https.onRequest(app);
