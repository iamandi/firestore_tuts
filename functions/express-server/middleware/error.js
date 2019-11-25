const logger = require('../startup/logging');

function exceptionLogger(err, req, res, next) {
    logger.error(err.message, { meta: err });

    res.status(500).send('something failed');
}

module.exports = exceptionLogger;