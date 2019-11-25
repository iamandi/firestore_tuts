const { Customer, validate } = require("../models/customer");
const auth = require("../middleware/auth");
const Tx = require("ethereumjs-tx").Transaction;
const web3 = require("../startup/web3");
const {
  donContractAddress: contractAddress,
  donContract: contract
} = require("../startup/donpia");
const { infuraEndPt, projectIdEndPt } = require("../startup/infura");
const express = require("express");
const router = express.Router();

router.post("/send/DON", auth, async (req, res) => {
  //const { error } = validate(req.body);
  //if (error) return res.status(400).send(error.details[0].message);

  const addressFrom = ""; // get it from the DB
  const privKey = ""; // get it from DB
  const privateKey = Buffer.from(privKey.substr(2), "hex");

  const addressTo = req.body.addressToSend;
  const amount = req.body.amountToSend;

  const gasPrice = Web3.utils.toHex(Web3.utils.toWei("10", "Gwei"));
  const gas = Web3.utils.toHex("50000");

  //contract.from = addressFrom;
  const data = contract.methods
    .transfer(addressTo, web3.utils.toWei(amount, "ether"))
    .encodeABI();

  try {
    const txCount = await web3.eth.getTransactionCount(addressFrom);
    const txData = {
      nonce: web3.utils.toHex(txCount),
      gas,
      gasPrice,
      to: contractAddress,
      from: addressFrom,
      value: "0x0",
      data,
      chainId: 1
    };
    const transaction = new Tx(txData);
    transaction.sign(privateKey);
    const serializedTx = transaction.serialize().toString("hex");

    const sentTx = web3.eth.sendSignedTransaction("0x" + serializedTx);
    sentTx
      .on("transactionHash", hash => {
        console.log("hash recvd", hash);
        return;
      })
      .on("receipt", receipt => {
        console.log("receipt recvd", receipt);
        return;
      })
      .on("confirmation", (confirmationNumber, receipt) => {
        console.log(
          `confirmation recvd with confirmationNumber: ${confirmationNumber} and receipt: ${receipt}`
        );
        if (confirmationNumber > 8) {
          console.log("Transaction successful. Exiting");
        }
        return;
      })
      .on("error", console.error);
  } catch (ex) {
    console.log(ex);
    return;
  }
});

router.post("/send/ETH", auth, async (req, res) => {
  //const { error } = validate(req.body);
  //if (error) return res.status(400).send(error.details[0].message);

  const addressTo = req.body.addressToSend;

  const addressFrom = ""; // get it from the DB
  const privKey = ""; // get it from DB
  const privateKey = Buffer.from(privKey.substr(2), "hex");

  const amount = web3.utils.toHex(
    web3.utils.toWei(req.body.amountToSend, "ether")
  );
  const gasPrice = web3.utils.toHex(web3.utils.toWei("20", "Gwei"));
  const gas = web3.utils.toHex("21000");

  try {
    const txCount = await web3.eth.getTransactionCount(addressFrom);
    const txData = {
      nonce: web3.utils.toHex(txCount),
      gas,
      gasPrice,
      to: addressTo,
      from: addressFrom,
      value: amount,
      chainId: 1
    };

    const transaction = new Tx(txData);
    transaction.sign(privateKey);
    const serializedTx = transaction.serialize().toString("hex");

    const sentTx = web3.eth.sendSignedTransaction("0x" + serializedTx);
    sentTx
      .on("transactionHash", hash => {
        console.log("hash recvd", hash);
        return;
      })
      .on("receipt", receipt => {
        console.log("receipt recvd", receipt);
        return;
      })
      .on("confirmation", (confirmationNumber, receipt) => {
        console.log(
          `confirmation recvd with confirmationNumber: ${confirmationNumber} and receipt: ${receipt}`
        );
        if (confirmationNumber > 8) {
          console.log("Transaction successful. Exiting");
        }
        return;
      })
      .on("error", console.error);
    return;
  } catch (ex) {
    console.log(ex);
    return;
  }
});

/* 
// all genres
router.get("/", async (req, res) => {
    const customers = await Customer.find().sort('name');
    res.send(customers);
});

// edit customer
router.put("/:id", async (req, res) => {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findByIdAndUpdate(req.params.id, { 
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone
    }, 
    {
        new: true
    });

    if(!customer) return res.status(404).send('No ID found');

    res.send(customer);
});

// delete customer
router.delete("/:id", async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);

    if(!customer) return res.status(404).send('No ID found');
    res.send(customer);
});

// get one customer
router.get("/:id", async (req, res) => {
    const customer = await Customer.findById(req.params.id);

    if(!customer) return res.status(404).send('No ID found');
    res.send(customer);
});
 */

module.exports = router;
