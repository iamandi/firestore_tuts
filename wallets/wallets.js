const getCryptoPortfolioUser = async function(walletsRef) {
  const cryptoPortfolio = await walletsRef
    .doc("No2HWNcfzaUNl8AckUKcdI7PQkF3")
    .get();

  const { bitcoin, donpia, ethereum } = cryptoPortfolio.data();
  console.log(`BTC = ${bitcoin.balance}`);
  console.log(`ETH = ${ethereum.balance}`);
  console.log(`DON = ${donpia.balance}`);
};

module.exports = getCryptoPortfolioUser;
