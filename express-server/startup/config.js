module.exports = function() {
  if (process.env.jwtPrivateKey) {
    throw new Error(
      "FATAL ERROR: jwtPrivateKey is not defined - export vidly_jwtPrivateKey environment variable."
    );
  }
};
