const keccak_256 = require("js-sha3").keccak256;

//////// Get ETH balance
module.exports = (infuraEndPt, projectIdEndPt, donContractAddress, account) => {
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
    .then(res => {
      var balance = Web3.utils.fromWei(res.data.result, "ether");
      console.log(balance + " DON");
    })
    .catch(ex => console.log(ex.message));
};
