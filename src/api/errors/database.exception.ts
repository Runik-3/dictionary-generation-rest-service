import HttpException from './http.exception';

export default class DatabaseException extends HttpException {
    constructor(message: string) {
        super(
            500,
            `Internal Server Error: Database threw error trying: ${message}`,
        );
    }
}
