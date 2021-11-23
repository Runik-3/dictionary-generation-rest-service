import dotenv from 'dotenv';
import IOHandler from './iohandler.util';
import { logger } from './logger.util';

export const HEADERS_TIMEOUT = 15 * 60 * 1000;
export const KEEP_ALIVE_TIMEOUT = 14.5 * 60 * 1000;
export const PORT = process.env.PORT || 3000;

export const { WIKI_USERNAME } = process.env || '';
export const { WIKI_PASSWORD } = process.env || '';
export const ENVIRONMENT = process.env.NODE_ENV || 'development';

if (IOHandler.dirExists('.env')) {
    logger.info('Using .env file to supply config environment variables');
    dotenv.config({ path: '.env' });
} else if (WIKI_PASSWORD && WIKI_PASSWORD) {
    logger.info('Environment variables loaded successfully');
} else {
    logger.warn('Unable to load all required environment variables');
}
