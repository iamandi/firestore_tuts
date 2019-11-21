var BN = web3.utils.BN;
/// get gas price
function getGasPrice() {
  infuraEndPt
    .post(projectIdEndPt, {
      jsonrpc: "2.0",
      method: "eth_gasPrice",
      params: [],
      id: 1
    })
    .then(res => {
      console.log("gasPrice", res.data.result);
      const resData = res.data.result;
      console.log("gasPrice Big number: ", new BN(resData).toString());
      console.log(
        "gasPrice in Gwei",
        web3.utils.fromWei(new BN(resData).toString(), "Gwei")
      );
    })
    .catch(ex => console.log(ex.message));
}
getGasPrice();

/// get gas
function getGasEstimate() {
  infuraEndPt
    .post(projectIdEndPt, {
      jsonrpc: "2.0",
      method: "eth_estimateGas",
      params: [
        {
          from: smallAcct,
          to: bigAcct,
          value: web3.utils.toHex(web3.utils.toWei("0.001", "ether"))
        }
      ],
      id: 1
    })
    .then(res => {
      console.log("getGasEstimate", res.data.result);
      const resData = res.data.result;
      console.log("getGasEstimate Big number: ", new BN(resData).toString());
    })
    .catch(ex => console.log(ex.message));
}
getGasEstimate();
