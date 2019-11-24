const logger = require('../startup/logging');
const mongoose = require('mongoose');
const config = require('config');

module.exports = function() {
    const db = config.get('db');
    mongoose.connect(db, { useNewUrlParser: true, useCreateIndex: true })
        .then(() => logger.info(`connected to ${db} ...`));
}