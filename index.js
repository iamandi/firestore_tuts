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
const getDonpiaTotalSupply = require("./crypto-utils/getDonpiaTotalSupply");
const sendDonpia = require("./crypto-utils/sendDonpia");

const Web3 = require("web3");
const keccak_256 = require("js-sha3").keccak256;
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

/* walletsRef
  .doc("2MKbkE3ijBwQJpXRGok6")
  .get()
  .then(snapshot => {
    console.log(snapshot.data().bitcoin.publicAddress);
  });

walletsRef.doc("2MKbkE3ijBwQJpXRGok6").set(
  {
    donpia: { balance: 10 }
  },
  { merge: true }
); */

/* (async function() {
  const bal = await walletsRef.doc("02NqLMDOIBXkPP00oRm9KQwnEW63").get();
  const { wallets } = bal.data();
  console.log(wallets);
})(); */

/* walletsRef
  .doc("02NqLMDOIBXkPP00oRm9KQwnEW63")
  .get()
  .then(snapshot => {
    //snapshot.forEach(doc => {
    console.log(snapshot.data().wallet[0].publicAddress);
    //});
  }); */

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
const infuraEndPt = Axios.create({
  baseURL: "https://mainnet.infura.io/v3",
  headers: { "Content-type": "application/json" },
  auth: { username: "", password: projectSecret }
});
//const smallAcctPriv = config.get("donpia_private_key");
const smallAcct = "0x00619c45052A1472C3c14b529cee311d6bCd1b2c";
const bigAcct = "0x965d23784424e52942efD08AD77c79DA0029996a";

infuraEndPt
  .post(projectIdEndPt, {
    jsonrpc: "2.0",
    method: "eth_getBalance",
    params: ["0x172E5f4B7fFF6908587C5625278E508854fD0aF1", "latest"],
    id: 1
  })
  .then(response => {
    console.log(">> ", response.data.result);
    const balance = Web3.utils.fromWei(response.data.result, "ether");
    console.log(">>> balance: " + balance + " ETH");
  });

//const projectIdEndPtUrl = `https://mainnet.infura.io/v3${projectIdEndPt}`;
//const web3 = new Web3(new Web3.providers.HttpProvider(projectIdEndPtUrl));

/* const {
  donContractAddress: contractAddress,
  donAbi: abi
} = require("./functions/express-server/startup/donpia");

const contract = new web3.eth.Contract(abi, contractAddress); */

/* (async () => {
  try {
    const addressFrom = "0x1b8cdae616d1da9aac3288c584667abbdaa1704a";
    const addressTo = "0x00619c45052A1472C3c14b529cee311d6bCd1b2c";
    const privateKey = Buffer.from(
      "201b5bfa1a3ccdd03c83d3cf421f32dab991cbe886e0f4643c291af711a22f27",
      "hex"
    );

    const txCount = await web3.eth.getTransactionCount(addressFrom);
    console.log(txCount);

    const amtWei = Web3.utils.toWei("10", "ether"); 
    const gasPriceWei = Web3.utils.toWei("10", "Gwei");
    const gasNum = "50000";
    const gasPrice = Web3.utils.toHex(gasPriceWei);
    const gas = Web3.utils.toHex(gasNum);

    contract.from = addressFrom;
    const contractData = contract.methods
      .transfer(addressTo, amtWei)
      .encodeABI();

    const txData = {
      nonce: web3.utils.toHex(txCount),
      gas,
      gasPrice,
      to: contractAddress,
      from: addressFrom,
      value: "0x0",
      data: contractData,
      chainId: 1
    };

    const transaction = new Tx(txData);
    transaction.sign(privateKey);
    const serializedTx = transaction.serialize().toString("hex");

    web3.eth
      .sendSignedTransaction("0x" + serializedTx)
      .on("transactionHash", hash => {
        console.log("hash recvd, create a new doc", hash);
      })
      .on("receipt", receipt => {
        console.log("receipt recvd", receipt);
      })
      .on("confirmation", (confirmationNumber, receipt) => {
        console.log(
          `confirmation recvd with confirmationNumber: ${confirmationNumber} and receipt object:`
        );
        console.log(receipt);
      })
      .on("error", err => {
        console.log(err);
      });
  } catch (ex) {
    console.log(ex);
  }
})(); */

//const contract = new web3.eth.Contract(donAbi, donContractAddress);

//getEthereumBalance(infuraEndPt, projectIdEndPt, smallAcct);
//getDonpiaBalance(infuraEndPt, projectIdEndPt, donContractAddress, bigAcct);
//const txHash =
//  "0x48ed03a74417aa26225bca574c0eb1dd81d2e8ad8c12df21b12ea6b10aa4a698";
//getTxHashData(infuraEndPt, projectIdEndPt, txHash);
//const amount = "0.001";
//sendEthereum(web3, amount, smallAcct, bigAcct, smallAcctPriv);
//getDonpiaTotalSupply(infuraEndPt, projectIdEndPt, donContractAddress);
//const addressFrom = smallAcct;
//const addressTo = bigAcct;
//const privateKey = smallAcctPriv;

/* const addressFrom = "0x1b8cdae616d1da9aac3288c584667abbdaa1704a";
const addressTo = "0x00619c45052A1472C3c14b529cee311d6bCd1b2c";
const privateKey = "";
const donContractAddress = contractAddress;
const amountToSend = "10";
sendDonpia(
  web3,
  amountToSend,
  addressFrom,
  addressTo,
  privateKey,
  donContractAddress,
  contract
); */
