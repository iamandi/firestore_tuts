const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;

module.exports = (web3, amount, addressFrom, addressTo, privKey) => {
  const amt = web3.utils.toHex(web3.utils.toWei(amount, "ether"));
  const gasPrice = web3.utils.toHex(web3.utils.toWei("20", "Gwei"));
  const gas = web3.utils.toHex("21000");

  web3.eth.getTransactionCount(addressFrom).then(txCount => {
    // construct the transaction data
    const txData = {
      nonce: web3.utils.toHex(txCount),
      gas,
      gasPrice,
      to: addressTo,
      from: addressFrom,
      value: amt,
      chainId: 1
    };

    const privateKey = Buffer.from(privKey.substr(2), "hex");
    const transaction = new Tx(txData);
    transaction.sign(privateKey);
    const serializedTx = transaction.serialize().toString("hex");
    web3.eth
      .sendSignedTransaction("0x" + serializedTx)
      .on("transactionHash", function(hash) {
        console.log("hash recvd", hash);
      })
      .on("receipt", function(receipt) {
        console.log("receipt recvd", receipt);
      })
      .on("confirmation", function(confirmationNumber, receipt) {
        console.log(
          `confirmation recvd with confirmationNumber: ${confirmationNumber} and receipt: ${receipt}`
        );
        if (confirmationNumber > 8) {
          console.log("Transaction successful. Exiting");
          return;
        }
      })
      .on("error", console.error);
  });
};
