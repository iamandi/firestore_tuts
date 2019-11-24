const winston = require('winston');
require('winston-mongodb');
require('express-async-errors');

process.on('unhandledRejection', (ex) => {
    throw ex;
});

function ignoreEpipe(err) {
    return err.code !== 'EPIPE';
}

const logger = winston.createLogger({
    level: 'info',
    //exitOnError: false,
    exitOnError: ignoreEpipe,
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'logfile.log' }),
        new winston.transports.Console({ colorize: true, prettyPrint: true, format: winston.format.simple() }),
        new winston.transports.MongoDB({ db: 'mongodb://localhost/vidly', useNewUrlParser: true, useCreateIndex: true })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: 'logfile.log' }),
        new winston.transports.Console({ colorize: true, prettyPrint: true, format: winston.format.simple() })
    ]
});

module.exports = logger;