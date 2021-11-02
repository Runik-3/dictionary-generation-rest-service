import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import express, { Application } from 'express';

import { logger, stream } from '../utils/logger.util';
import { CSP, CSPDirectives } from '../../config/helmet.config';

const publicDir = path.join(__dirname, '..', '..', 'public');

const expressMiddleware = (app: Application): void => {
    // TODO: Configure differently if in prod or dev
    logger.info('🔨 Initializing Express Middleware ...');

    app.use(express.static(publicDir));

    app.use(cors());
    app.use(morgan('tiny', { stream }));

    app.use(helmet({ ...CSP }));
    app.use(helmet.contentSecurityPolicy({ ...CSPDirectives }));

    app.use(compression());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    logger.info('🚀 Finished Initializing Express Middleware.');
};

export default expressMiddleware;
