export class AppError extends Error {
    constructor (message, statusCode = 400) {
        super(message);

        this.statusCode = statusCode;
        this.status = statusCode.toString()[0] === '4' ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export function catchAsync (fn) {
    return (req, res, next) => fn(req, res, next).catch(next);
}