import { Server } from 'http';
import express, { Application, Router } from 'express';

import {
    PORT,
    ENVIRONMENT,
    HEADERS_TIMEOUT,
    KEEP_ALIVE_TIMEOUT,
} from '@utils/secrets.util';
import { logger } from '../api/utils/logger.util';
import errorMiddleware from '../api/middleware/error.middleware';
import expressMiddleware from '../api/middleware/express.middleware';
import ApplicationException from '../api/errors/application.exception';

export default class App {
    private readonly _env: string;

    private readonly _app: Application;

    private _server!: Server;

    private readonly _port: string | number;

    constructor(routes: Router[]) {
        this._port = PORT;
        this._env = ENVIRONMENT;
        this._app = express();

        this.initializeMiddleware();
        this.initializeRoutes(routes);
        this.initializeErrorHandling();
    }

    public get env(): string {
        return this._env;
    }

    public get port(): string | number {
        return this._port;
    }

    public get server(): Application {
        return this._app;
    }

    public close(): void {
        if (this._server) {
            this._server.close(err => {
                if (err) {
                    throw new ApplicationException(
                        '🚨 Error occurred while attempting to close server.',
                    );
                } else {
                    logger.info('💤 Successfully closed server');
                }
            });
        } else {
            logger.warn('⚠️ Server connection is already closed.');
        }
    }

    public listen(): void {
        this._server = this._app.listen(this._port, () => {
            if (this.env === 'development') {
                logger.info(
                    `🚀 Application Started; Listening on port: http://localhost:${this.port}`,
                );
            } else {
                logger.info(
                    `🚀 Application Started; Listening on port: ${this.port}`,
                );
            }
        });
        this._server.timeout = KEEP_ALIVE_TIMEOUT;
        this._server.setTimeout(KEEP_ALIVE_TIMEOUT);
        this._server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT;
        this._server.headersTimeout = HEADERS_TIMEOUT;

        this._server.on('connection', socket => {
            socket.setTimeout(15 * 60 * 1000);
            socket.once('timeout', () => {
                process.nextTick(socket.destroy);
            });
        });
    }

    private initializeMiddleware(): void {
        logger.info('🔨 Initializing Middleware ...');
        expressMiddleware(this._app);
        logger.info('🚀 Finished Initializing All Middleware.');
    }

    private initializeRoutes(routes: Router[]): void {
        logger.info('🔨 Initializing Routes ...');
        routes.forEach((router: Router) => {
            this._app.use('/', router);
        });
        logger.info('🚀 Finished Initializing Routes.');
    }

    private initializeErrorHandling(): void {
        logger.info('🔨 Initializing Error Handling Middleware ...');
        this._app.use(errorMiddleware);
        logger.info('🚀 Finished Initializing Error Handling Middleware.');
    }
}
