async function getBalanceEthereum(web3, addressFrom) {
  try {
    const balanceWei = web3.eth.getBalance(addressFrom);

    return { balanceWei };
  } catch (error) {
    console.log("getBalanceEthereum error:", error);
    return { error: error.message };
  }
}

module.export = getBalanceEthereum;

/* web3.eth
          .getBalance(addressFrom)
          .then(balanceWei => {
            const balanceEth = Web3.utils.fromWei(balanceWei, "ether");
            console.log("1.receipt: balance in ETH: ", balanceEth);

            walletsDocRef.update({
              "wallets.ethereum.balance": balanceEth
            });

            return balanceEth;
          })
          .catch(err => console.log(err)); */

/*
web3.eth
            .getBalance(addressFrom)
            .then(balanceWei => {
              const balanceEth = Web3.utils.fromWei(balanceWei, "ether");
              console.log("2.receipt: balance in ETH : ", balanceEth);

              walletsDocRef.update({
                "wallets.ethereum.balance": balanceEth
              });

              return balanceEth;
            })
            .catch(err => console.log(err));*/
