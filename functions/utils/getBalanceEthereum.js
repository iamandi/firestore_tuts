const {
  infuraEndPt,
  projectIdEndPt
} = require("../express-server/startup/infura");

async function getBalanceEthereum(addressFrom) {
  try {
    const response = await infuraEndPt.post(projectIdEndPt, {
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [addressFrom, "latest"],
      id: 1
    });

    if (response.data && response.data.result) {
      const balanceWei = response.data.result;
      return { balanceWei };
    } else {
      throw new Error("BAD response", response);
    }
  } catch (error) {
    console.log("getBalanceEthereum error:", error);
    return { error: error.message };
  }
}

module.export = getBalanceEthereum;
