import jwt from 'jsonwebtoken';
import {AppError} from '../utils/app-error.js';
import {Models} from '../database/models/index.js';

function notAuthorizedHandle (next) {
    next(new AppError('Authorization is required', 401));
}

export function verifyAccessToken (token, callback) {
    jwt.verify(token, process.env.APP_KEY, callback);
}

export function accessTokenParse (req, res, next) {
    const token = req.cookies.accessToken;

    if (!token) {
        notAuthorizedHandle(next);
        return;
    }


    // if (!req.headers.authorization) {
    //     notAuthorizedHandle(next);
    //     return;
    // }
    //
    // const authScheme = req.headers.authorization.split(' ')[0];
    // if (authScheme !== 'Bearer') {
    //     notAuthorizedHandle(next);
    //     return;
    // }
    // const token = req.headers.authorization.split(' ')[1];

    verifyAccessToken(token, async (err, decoded) => {
        if (err) {
            notAuthorizedHandle(next);
        } else {
            const user = await Models.User.findById(decoded.id);
            // When "iat" or "expin" is generated it trunks ms from number.
            // As a result it may lose up to 1 sec in comparison with sUpdatedAt.
            // To prevent accidental unauthorized result we will add 1 sec to it.
            if (!user || (decoded.iat * 1000 + 999) < +user.sUpdatedAt) {
                notAuthorizedHandle(next);
                return;
            }

            if (!req._middlewareData) {
                req._middlewareData = {}
            }

            req._middlewareData.user = user;

            next();
        }
    });
}

export function rolePermission (...roles) {
    return (req, res, next) => {
        if (!req._middlewareData || !req._middlewareData.user) {
            next(new AppError('Not authorized', 401));
        }

        if (roles.includes(req._middlewareData.user.role)) {
            next();
        } else {
            next(new AppError('No permission to this route', 403))
        }
    }
}