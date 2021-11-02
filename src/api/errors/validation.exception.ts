import HttpException from './http.exception';

export default class ValidationException extends HttpException {
    constructor(msg: string) {
        super(401, `Validation Error: ${msg}`);
    }
}
