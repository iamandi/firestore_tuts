const Web3 = require("web3");

const ERROR = `invalid-argument`;
const ERROR_MESSAGE = `The function must be called with valid argument: `;

function sendEthereumModel(data) {
  const { token, amount, addressTo } = data;
  console.log(`token = ${token}, amount = ${amount}, addressTo = ${addressTo}`);

  if (
    !(typeof token === "string") ||
    token.length === 0 ||
    token !== "Ethereum"
  ) {
    return { error: ERROR, errorMessage: `${ERROR_MESSAGE} token` };
  }

  if (
    !(typeof addressTo === "string") ||
    addressTo.length === 0 ||
    !Web3.utils.isAddress(addressTo)
  ) {
    return { error: ERROR, errorMessage: `${ERROR_MESSAGE} addressTo` };
  }

  if (!(typeof amount === "string")) {
    return { error: ERROR, errorMessage: `${ERROR_MESSAGE} amount` };
  }

  try {
    const amt = parseFloat(amount);
    if (amt <= 0) {
      return { error: ERROR, errorMessage: `${ERROR_MESSAGE} amount > 0` };
    }
  } catch (ex) {
    console.log("exception", ex);
    return { error: ERROR, errorMessage: `${ERROR_MESSAGE} amount = float` };
  }

  return {};
}

module.exports = sendEthereumModel;
