import { Request, Response, NextFunction } from 'express';

import { logger } from '../utils/logger.util';
import HttpException from '../errors/http.exception';

const errorMiddleware = (
    error: HttpException,
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    try {
        logger.error(error);
        const status: number = error.status || 500;
        const message: string = error.message || 'Internal Server Error';
        const errorLog = `Status: ${status}, Message: ${message}`;
        logger.error(errorLog);

        res.status(status).json({ error: message });
    } catch (e) {
        next(e);
    }
};

export default errorMiddleware;
