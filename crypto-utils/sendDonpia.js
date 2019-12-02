const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;

const gasPrice = Web3.utils.toHex(Web3.utils.toWei("10", "Gwei"));
const gas = Web3.utils.toHex("50000");

module.exports = (
  web3,
  amount,
  addressFrom,
  addressTo,
  privKey,
  contractAddress,
  contract
) => {
  contract.from = addressFrom;
  const data = contract.methods
    .transfer(addressTo, web3.utils.toWei(amount, "ether"))
    .encodeABI();

  web3.eth
    .getTransactionCount(addressFrom)
    .then(txCount => {
      const txData = {
        nonce: web3.utils.toHex(txCount),
        gas,
        gasPrice,
        to: contractAddress,
        from: addressFrom,
        value: "0x0",
        data,
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
    })
    .catch(err => {
      console.log(err);
    });
};
