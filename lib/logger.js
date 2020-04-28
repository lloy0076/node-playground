const winston = require('winston');

require('dotenv').config();

const Logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.splat(),
        winston.format.simple(),
    ),
    transports: [new winston.transports.Console()],
});

module.exports = Logger;
