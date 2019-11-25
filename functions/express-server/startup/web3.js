const Web3 = require("web3");
const { projectIdEndPtUrl } = require("../startup/infura");

const web3 = new Web3(new Web3.providers.HttpProvider(projectIdEndPtUrl));

module.exports.web3 = web3;
