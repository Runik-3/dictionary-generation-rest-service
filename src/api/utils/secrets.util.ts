import dotenv from 'dotenv';
import IOHandler from './iohandler.util';
import { logger } from './logger.util';

if (IOHandler.dirExists('.env')) {
    logger.info('Using .env file to supply config environment variables');
    dotenv.config({ path: '.env' });
} else {
    logger.info(
        'Using .env.example file to supply config environment variables',
    );
    dotenv.config({ path: '.env.example' });
}

export const PORT = process.env.PORT || 3000;
export const { WIKI_USERNAME } = process.env || '';
export const { WIKI_PASSWORD } = process.env || '';
export const ENVIRONMENT = process.env.NODE_ENV || 'development';
