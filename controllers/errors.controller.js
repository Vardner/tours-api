import {AppError} from '../utils/app-error.js';

function handleValidationError (err) {
    return new AppError('Invalid input data. ' + err.message, 400);
}

function handleDuplicateField (err) {
    let msg = 'Entry with';
    let multiple = false;
    for (let key in err.keyValue) {
        msg += ` ${key} equal "${err.keyValue[key]}"`;
        if (multiple) {
            msg += ', ';
        }

        multiple = true;
    }

    msg += ' already exists';
    return new AppError(msg, 400);
}

function handleCastError (err) {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
}

function sendErrorDev (err, res) {
    res.statusCode = err.statusCode;
    res.json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err
    });
}

function sendErrorProd (err, res) {
    if (err.isOperational) {
        res.statusCode = err.statusCode;
        res.json({
            status: err.status,
            message: err.message,
        });
    } else {
        console.error('Error: ', err);
        res.statusCode = 500;
        res.json({status: 'error', message: 'Something went wrong'});
    }
}


export class ErrorsController {
    static default (err, req, res, next) {

        err.statusCode = err.statusCode ?? 500;
        err.status = err.status ?? 'error';

        if (process.env.NODE_ENV === 'development') {
            sendErrorDev(err, res);
        } else if (process.env.NODE_ENV === 'production') {
            if (err.name === 'CastError') { // Usually Cannot cast id to MongoDB ObjectId
                err = handleCastError(err);
            } else if (err.name === 'ValidationError') { // Fields do not satisfy models restrictions
                err = handleValidationError(err);
            } else if (err.code === 11000) { // Duplicate field
                err = handleDuplicateField(err);
            }

            sendErrorProd(err, res);
        }
    }

}