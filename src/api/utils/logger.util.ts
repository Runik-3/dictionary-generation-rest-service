import path from 'path';
import WinstonDaily from 'winston-daily-rotate-file';
import winston, { format, LoggerOptions } from 'winston';

import IOHandler from './iohandler.util';
import loggerConfig from '../../config/logger.config';

const { combine, timestamp, printf, prettyPrint, colorize, errors } = format;

// Directories
let logDir = path.join(__dirname, '..', '..', '..', 'logs');

if (process.env.NODE_ENV === 'production') {
    logDir = path.join(__dirname, '..', '..', '..', '..', 'logs');
}
const errorsDir = path.join(logDir, 'errors');

IOHandler.createDirs([logDir, errorsDir]);

// eslint-disable-next-line no-shadow
const logFormatter = printf(info => {
    const log = `${info.timestamp} ${info.level}: ${info.message}`;
    return info.stack ? `${log}\n${info.stack}` : log;
});

const errorsTransport: winston.transport = new WinstonDaily({
    json: false,
    maxSize: '10m',
    level: 'error',
    frequency: '1h',
    dirname: errorsDir,
    handleExceptions: true,
    datePattern: 'YYYY-MM-DD',
    filename: 'errors-%DATE%.log',
});

const logTransport: winston.transport = new WinstonDaily({
    json: false,
    maxSize: '10m',
    level: 'data',
    frequency: '1h',
    dirname: logDir,
    handleExceptions: true,
    datePattern: 'YYYY-MM-DD',
    filename: 'log-%DATE%.log',
});

const logFormat = combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.simple(),
    prettyPrint(),
    logFormatter,
    errors({ stack: true }),
);

const consoleLogFormat = combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.simple(),
    prettyPrint(),
    logFormatter,
    colorize({ all: true }),
    errors({ stack: true }),
);

const transports = [errorsTransport, logTransport];

const options: LoggerOptions = {
    levels: loggerConfig.levels,
    format: logFormat,
    transports,
};

winston.addColors(loggerConfig.colors);
const logger: winston.Logger = winston.createLogger(options);

/**
 * Silence logger when running tests
 */
if (process.env.NODE_ENV === 'development') {
    logger.add(
        new winston.transports.Console({
            level: 'data',
            format: consoleLogFormat,
        }),
    );
} else if (process.env.NODE_ENV === 'production') {
    logger.add(
        new winston.transports.Console({
            level: 'warn',
            format: consoleLogFormat,
        }),
    );
}

const stream = {
    write: (message: string): void => {
        logger.http(message.substring(0, message.lastIndexOf('\n')));
    },
};

// TODO: Turn this logger into a [static??] class
export { stream, logger };
