const keccak_256 = require("js-sha3").keccak256;
const {
  infuraEndPt,
  projectIdEndPt
} = require("../express-server/startup/infura");
const {
  donContractAddress: contractAddress
} = require("../express-server/startup/donpia");

async function getBalanceDonpia(addressFrom) {
  try {
    const getBalanceOfData =
      "0x" +
      keccak_256.hex("balanceOf(address)").substr(0, 8) +
      "000000000000000000000000" +
      addressFrom.substr(2);

    const response = await infuraEndPt.post(projectIdEndPt, {
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          to: contractAddress,
          data: getBalanceOfData
        },
        "latest"
      ],
      id: 1
    });

    console.log("getBalanceDonpia: response", response);

    const balanceWei = response.data.result;
    console.log("getBalanceDonpia: balanceWei", balanceWei);

    return { balanceWei };
  } catch (ex) {
    console.log("getBalanceDonpia: error:", error);
    return { error: error.message };
  }
}

module.exports = getBalanceDonpia;
