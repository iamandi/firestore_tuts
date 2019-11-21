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
const sendEthereum = require("./crypto-utils/sendEthereum");
const getTxHashData = require("./crypto-utils/getTxHash");

const Web3 = require("web3");

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
const bigAcct = "0x965d23784424e52942efD08AD77c79DA0029996a";

const web3 = new Web3(new Web3.providers.HttpProvider(projectIdEndPtUrl));

const contract = new web3.eth.Contract(donAbi, donContractAddress);

//getEthereumBalance(infuraEndPt, projectIdEndPt, smallAcct);
//getDonpiaBalance(infuraEndPt, projectIdEndPt, donContractAddress, bigAcct);

// Get ERC20 Token contract instance

const txHash =
  "0x48ed03a74417aa26225bca574c0eb1dd81d2e8ad8c12df21b12ea6b10aa4a698";
//getTxHashData(infuraEndPt, projectIdEndPt, txHash);

const amount = "0.001";
//sendEthereum(web3, amount, smallAcct, bigAcct, smallAcctPriv);
