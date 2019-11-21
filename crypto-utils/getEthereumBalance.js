//////// Get ETH balance
module.exports = (infuraEndPt, projectIdEndPt, account) => {
  infuraEndPt
    .post(projectIdEndPt, {
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [account, "latest"],
      id: 1
    })
    .then(res => {
      var balance = Web3.utils.fromWei(res.data.result, "ether");
      console.log(balance + " ETH in small Account");
    })
    .catch(ex => console.log(ex.message));
};
