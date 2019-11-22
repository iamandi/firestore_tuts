const keccak_256 = require("js-sha3").keccak256;
const Web3 = require("web3");

const totalSupply =
  "0x" +
  keccak_256.hex("totalSupply()").substr(0, 8) +
  "000000000000000000000000";

//////// Get ETH balance
module.exports = (infuraEndPt, projectIdEndPt, donContractAddress) => {
  infuraEndPt
    .post(projectIdEndPt, {
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          to: donContractAddress,
          data: totalSupply
        },
        "latest"
      ],
      id: 1
    })
    .then(res => {
      var balance = Web3.utils.fromWei(res.data.result, "ether");
      console.log("TOTAL SUPPLY: ", balance);
    })
    .catch(ex => console.log(ex.message));
};
