const Web3 = require("web3");
const keccak_256 = require("js-sha3").keccak256;

const { Movie, validate } = require("../models/movie");
const auth = require("../middleware/auth");
const { Genre } = require("../models/genre");

const { donContractAddress } = require("../startup/donpia");
const { infuraEndPt, projectIdEndPt } = require("../startup/infura");
const admin = require("../config/firebaseService");

const express = require("express");
const router = express.Router();

router.get("/refresh/DON", auth, async (req, res) => {
  //const { error } = validate(req.body);
  //if (error) return res.status(400).send(error.details[0].message);

  const account = "0xe0d0c49bb03fe39b6f46aaf4bd2f24bad0af832c";

  const data =
    "0x" +
    keccak_256.hex("balanceOf(address)").substr(0, 8) +
    "000000000000000000000000" +
    account.substr(2);

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
    .then(response => {
      var balance = Web3.utils.fromWei(response.data.result, "ether");
      console.log(">>> " + balance + " DON");
      return res.send(balance);
    })
    .catch(ex => {
      console.log(ex.message);
      return res.status(500).send(ex.message);
    });
});

router.get("/refresh/ETH", auth, async (req, res) => {
  //const { error } = validate(req.body);
  //if (error) return res.status(400).send(error.details[0].message);

  const account = "0xe0d0c49bb03fe39b6f46aaf4bd2f24bad0af832c";

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
});

module.exports = router;
