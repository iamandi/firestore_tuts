const Web3 = require("web3");

const ERROR = `invalid-argument`;
const ERROR_MESSAGE = `The function must be called with valid argument: `;

function sendDonpiaModel(data) {
  const { token, amount, addressTo } = data;

  if (
    !(typeof token === "string") ||
    token.length === 0 ||
    token !== "Donpia"
  ) {
    const error = { error: ERROR, errorMessage: `${ERROR_MESSAGE} token` };
    console.log(error);

    return error;
  }

  if (
    !(typeof addressTo === "string") ||
    addressTo.length === 0 ||
    !Web3.utils.isAddress(addressTo)
  ) {
    const error = { error: ERROR, errorMessage: `${ERROR_MESSAGE} addressTo` };
    console.log(error);

    return error;
  }

  if (!(typeof amount === "string")) {
    const error = { error: ERROR, errorMessage: `${ERROR_MESSAGE} amount` };
    console.log(error);

    return error;
  }

  try {
    const amt = parseFloat(amount);
    if (amt <= 0) {
      const error = {
        error: ERROR,
        errorMessage: `${ERROR_MESSAGE} amount > 0`
      };
      console.log(error);

      return error;
    }
  } catch (ex) {
    console.log("exception", ex);
    const error = {
      error: ERROR,
      errorMessage: `${ERROR_MESSAGE} amount = float`
    };

    return error;
  }

  return {};
}

module.exports = sendDonpiaModel;
