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
const getEthereumBalance = require("./crypto-utils/getEthereumBalance");
const getDonpiaBalance = require("./crypto-utils/getDonpiaBalance");

const Web3 = require("web3");
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

const donContractAddress = "0xe69968dd1913f135f3b28ed81d9a02368204bd66";
const projectIdEndPt = `/${config.get("project_id")}`;
const projectSecret = `${config.get("project_secret")}`;
const projectIdEndPtUrl = `https://mainnet.infura.io/v3${projectIdEndPt}`;
const infuraEndPt = Axios.create({
  baseURL: "https://mainnet.infura.io/v3",
  headers: { "Content-type": "application/json" },
  auth: { username: "", password: projectSecret }
});

const smallAcct = "0xc5d2f13199600ab234f85fa3c585cc98fe22ae3e";
const smallAcctPriv =
  "0xc427dc12f080afcb64629b474ccd001ad508b81231d9dc70dce0a961b38d85da";
const bigAcct = "0xaEeB5db2Aa3EDcD699BE99293d0e36541E3D52E1";

const web3 = new Web3(new Web3.providers.HttpProvider(projectIdEndPtUrl));

// get ether balance
//getEthereumBalance(infuraEndPt, projectIdEndPt, smallAcct);

// Get DONPIA balance
//getDonpiaBalance(infuraEndPt, projectIdEndPt, donContractAddress, bigAcct);

var BN = web3.utils.BN;
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
      const resData = res.data.result;
      console.log("gasPrice Big number: ", new BN(resData).toString());
      console.log(
        "gasPrice in Gwei",
        web3.utils.fromWei(new BN(resData).toString(), "Gwei")
      );
    })
    .catch(ex => console.log(ex.message));
}
getGasPrice();

/// get gas
function getGasEstimate() {
  infuraEndPt
    .post(projectIdEndPt, {
      jsonrpc: "2.0",
      method: "eth_estimateGas",
      params: [
        {
          from: smallAcct,
          to: bigAcct,
          value: web3.utils.toHex(web3.utils.toWei("0.001", "ether"))
        }
      ],
      id: 1
    })
    .then(res => {
      console.log("getGasEstimate", res.data.result);
      const resData = res.data.result;
      console.log("getGasEstimate Big number: ", new BN(resData).toString());
    })
    .catch(ex => console.log(ex.message));
}
getGasEstimate();

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

const addressFrom = smallAcct; //
const addressTo = bigAcct;
// get the number of transactions sent so far so we can create a fresh nonce
// Send Ethers
const amt = web3.utils.toHex(web3.utils.toWei("0.001", "ether"));
const gasPrice = web3.utils.toHex(web3.utils.toWei("20", "Gwei"));
const gas = web3.utils.toHex("21000");
const gasLimit = web3.utils.toHex(21000);
web3.eth.getTransactionCount(addressFrom).then(txCount => {
  // construct the transaction data
  const txData = {
    nonce: web3.utils.toHex(txCount),
    gas,
    gasPrice,
    to: addressTo,
    from: addressFrom,
    value: amt,
    chainId: 1
  };

  // fire away!
  sendSigned(txData, function(err, result) {
    if (err) return console.log(err);
    console.log("sent", result);
  });
});
