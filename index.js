const Axios = require("axios");
const config = require("config");
const addReferral = require("./unimoney/unimoney");
const {
  deleteUserComplexQuery,
  allUsers,
  overwriteDocument,
  updateDocument,
  updateTimestamp
} = require("./users/users");
const donAbi = require("./donpia/donpia");

const Web3 = require("web3");
const keccak_256 = require("js-sha3").keccak256;
const EthereumTx = require("ethereumjs-tx").Transaction;
const Tx = require("ethereumjs-tx").Transaction;

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

const donContractAddress = "0xe69968dd1913f135f3b28ed81d9a02368204bd66";
const projectIdEndPt = `/${config.get("project_id")}`;
const projectSecret = `${config.get("project_secret")}`;
const projectIdEndPtUrl = `https://mainnet.infura.io/v3${projectIdEndPt}`;
const infuraEndPt = Axios.create({
  baseURL: "https://mainnet.infura.io/v3",
  headers: { "Content-type": "application/json" },
  auth: { username: "", password: projectSecret }
});

const smallAcct = "0x57f1fc145b4a5b1efa8066e43eff31fbf68deebe";
const smallAcctPriv =
  "0x3d3b10788ddf4a3929c0b8329a5d872b958a52b5bee658295fbc6450ed10bda4";
const bigAcct = "0xaEeB5db2Aa3EDcD699BE99293d0e36541E3D52E1";

const web3 = new Web3(new Web3.providers.HttpProvider(projectIdEndPtUrl));

//////// Get ETH balance
infuraEndPt
  .post(projectIdEndPt, {
    jsonrpc: "2.0",
    method: "eth_getBalance",
    params: [smallAcct, "latest"],
    id: 1
  })
  .then(res => {
    console.log("small account balance", res.data.result);
    var balance = Web3.utils.fromWei(res.data.result, "ether");
    console.log(balance + " ETH in small Account");
  })
  .catch(ex => console.log(ex.message));

//////// Get DONPIA balance
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
        to: donContractAddress,
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

/// get gas price
function getGasPrice() {
  infuraEndPt
    .post(projectIdEndPt, {
      jsonrpc: "2.0",
      method: "eth_gasPrice",
      params: [],
      id: 1
    })
    .then(res => {
      console.log("gasPrice", res.data.result);
      gp = res.data.result;
    })
    .catch(ex => console.log(ex.message));
}
getGasPrice();

/// get gas price
function getGasPriceEstimate() {
  infuraEndPt
    .post(projectIdEndPt, {
      jsonrpc: "2.0",
      method: "eth_estimateGas",
      params: [
        {
          from: smallAcct,
          to: bigAcct,
          value: "0x27147114878000"
        }
      ],
      id: 1
    })
    .then(res => {
      console.log("getGasPriceEstimate", res.data.result);
      gp = res.data.result;
    })
    .catch(ex => console.log(ex.message));
}
getGasPriceEstimate();

//////// Send

// Get ERC20 Token contract instance
let contract = new web3.eth.Contract(donAbi, donContractAddress);

function sendSigned(txData, cb) {
  const privateKey = Buffer.from(smallAcctPriv.substr(2), "hex");
  const transaction = new Tx(txData);
  transaction.sign(privateKey);
  const serializedTx = transaction.serialize().toString("hex");
  web3.eth.sendSignedTransaction("0x" + serializedTx, cb);
}

const addressFrom = smallAcct;
const addressTo = bigAcct;
// get the number of transactions sent so far so we can create a fresh nonce
// Send Ethers
const amt = web3.utils.toHex(web3.utils.toWei("0.002", "ether"));
console.log("amt", amt);
const gasPrice = web3.utils.toHex(web3.utils.toWei("300", "gwei"));
const gas = web3.utils.toHex(web3.utils.toWei("0.1", "gwei"));
const gasLimit = web3.utils.toHex(9990236);
web3.eth.getTransactionCount(addressFrom).then(txCount => {
  // construct the transaction data
  const txData = {
    nonce: web3.utils.toHex(txCount),
    gas: "0x5208",
    gasPrice: "0x83215600",
    to: addressTo,
    from: addressFrom,
    value: amt,
    chainId: 1,
    gasLimit
  };

  // fire away!
  sendSigned(txData, function(err, result) {
    if (err) return console.log("Error: ", err.message);
    console.log("sent", result);
  });
});

/* console.log(web3js.utils.toHex(1e16));
// Send DON
web3.eth.getTransactionCount(addressFrom).then(txCount => {
  // construct the transaction data
  const txData = {
    nonce: web3.utils.toHex(txCount),
    gasLimit: web3.utils.toHex(210000),
    gasPrice: web3.utils.toHex(20 * 1e9), // 20 gwei
    to: addressTo,
    from: addressFrom,
    value: "0x0",
    data: contract.methods.transfer(addressTo, amount).encodeABI()
  };

  // fire away!
  sendSigned(txData, function(err, result) {
    if (err) return console.log("Error: ", err.message);
    console.log("sent", result);
  });
}); */
