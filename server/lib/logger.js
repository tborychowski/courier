const winston = require('winston');
require('winston-daily-rotate-file');

function print (info) {
	const {timestamp, level, message} = info;
	const ts = timestamp.slice(0, 19).replace('T', ' ');
	return `${ts} [${level}] ${message}`;
}

const fileFormat = winston.format.combine(
	winston.format.timestamp(),
	winston.format.printf(print)
);

const consoleFormat = winston.format.combine(
	winston.format.colorize(),
	winston.format.timestamp({ format: '[[]HH:mm:ss[]]' }),
	winston.format.printf(print)
);

const fileLog = new winston.transports.DailyRotateFile({
	filename: 'logs/%DATE%.log',
	datePattern: 'YYYY-MM-DD',
	// zippedArchive: true,
	maxSize: '20m',
	maxFiles: '7d'
});

const errorLog = new winston.transports.File({ filename: 'logs/error.log', level: 'error' });
const consoleLog = new winston.transports.Console({ format: consoleFormat });


const logger = winston.createLogger({
	level: 'info',
	format: fileFormat,
	transports: [
		errorLog,
		fileLog,
		consoleLog
	]
});

module.exports = logger;
