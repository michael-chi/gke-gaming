const winston = require('winston');
const {LoggingWinston} = require('@google-cloud/logging-winston');
const loggingWinston = new LoggingWinston();

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    loggingWinston,
  ],
});

// Writes some log entries
module.exports = function log(msg, param, source, severity) {
    try{
        logger.info({
            message:msg,
            timestamp:Date.now(),
            param:param,
            source:source,
            severity:severity
        });
    }catch(ex){
        console.log(`error:${ex}`);
    }
}