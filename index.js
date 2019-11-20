const Axios = require("axios");
const addReferral = require("./unimoney/unimoney");
const {
  deleteUserComplexQuery,
  allUsers,
  overwriteDocument,
  updateDocument,
  updateTimestamp
} = require("./users/users");

const Web3 = require("web3");
const keccak_256 = require("js-sha3").keccak256;
const config = require("config");

const admin = require("firebase-admin");
const FieldValue = admin.firestore.FieldValue;
const DocumentID = admin.firestore.FieldPath.documentId();
const serviceAccount = require("../firebase-service-account-creds/serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://reactcryptoserver.firebaseio.com"
});

const db = admin.firestore();
const userRef = db.collection("users");
const userDocRef = userRef.doc();
const jsonBourneRef = userRef.doc("ILjZHsOv1F6jHoBeOZIJ");

const transactionsRef = db.collection("transactions");
const walletsRef = db.collection("wallets");

const user = "S41NqqP9pjXOsGtD5LUSbzxopOk1";
const referred = "qUJgNaGUTFSgwtM0RHf14Ki8la92";
const bonus = 5000;

//getCryptoPortfolioUser(walletsRef);
//addDocument(userDocRef);
//overwriteDocument(jsonBourneRef);
//deleteUserComplexQuery(userRef);
//allUsers(userRef);
//addReferral(db, user, referred, bonus);
//getTransactionWithHash();
//addTransaction();

/* walletsRef
  .limit(6)
  .get()
  .then(allUsers => {
    let index = 1;
    allUsers.forEach(doc => {
      console.log(index + ") " + doc.id);
      index++;
    });
  });
 */

const donContract = "0xe69968dd1913f135f3b28ed81d9a02368204bd66";
const projectIdEndPt = `/${config.get("project_id")}`;
const projectSecret = `${config.get("project_secret")}`;
const infuraEndPt = Axios.create({
  baseURL: "https://mainnet.infura.io/v3",
  headers: { "Content-type": "application/json" },
  auth: { username: "", password: projectSecret }
});

const smallAcct = "0x57f1fc145b4a5b1efa8066e43eff31fbf68deebe";
const bigAcct = "0xaEeB5db2Aa3EDcD699BE99293d0e36541E3D52E1";

// Get ETH balance
infuraEndPt
  .post(projectIdEndPt, {
    jsonrpc: "2.0",
    method: "eth_getBalance",
    params: [bigAcct, "latest"],
    id: 1
  })
  .then(res => {
    var balance = Web3.utils.fromWei(res.data.result, "ether");
    console.log(balance + " ETH");
  })
  .catch(ex => console.log(ex.message));

// Get DONPIA balance
const data =
  "0x" +
  keccak_256.hex("balanceOf(address)").substr(0, 8) +
  "000000000000000000000000" +
  bigAcct.substr(2);

infuraEndPt
  .post(projectIdEndPt, {
    jsonrpc: "2.0",
    method: "eth_call",
    params: [
      {
        to: donContract,
        data: data
      },
      "latest"
    ],
    id: 1
  })
  .then(res => {
    var balance = Web3.utils.fromWei(res.data.result, "ether");
    console.log(balance + " DON");
  })
  .catch(ex => console.log(ex.message));
