import HttpException from './http.exception';

export default class ParserException extends HttpException {
    constructor(message: string) {
        super(500, `Internal Server Error: ${message}`);
    }
}
