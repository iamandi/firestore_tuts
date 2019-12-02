function exceptionLogger(err, req, res, next) {
  console.log(err.message, { meta: err });

  res.status(500).send("something failed");
}

module.exports = exceptionLogger;
