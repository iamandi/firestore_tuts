const express = require("express");
//const buy_sell = require("../routes/buy_sell");
const send_receive = require("../routes/send_receive");
const wallets = require("../routes/wallets");
//const rentals = require('../routes/rentals');
//const users = require('../routes/users');
//const auth = require('../routes/auth');
const error = require("../middleware/error");

module.exports = function(app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use("/my-wallet", wallets);
  app.use("/send-recieve-crypto", send_receive);
  //app.use("/buy-sell-crypto", buy_sell);

  app.use(error);
};
