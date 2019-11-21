//////// Get ETH balance
module.exports = (infuraEndPt, projectIdEndPt, txHash) => {
  infuraEndPt
    .post(projectIdEndPt, {
      jsonrpc: "2.0",
      method: "eth_getTransactionByHash",
      params: [txHash],
      id: 1
    })
    .then(res => {
      console.log(res.data);
    })
    .catch(ex => console.log(ex.message));
};
