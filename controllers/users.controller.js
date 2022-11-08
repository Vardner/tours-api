import {AppError, catchAsync} from '../utils/index.js';
import isEmail from 'validator/lib/isEmail.js';
import {AuthController} from './auth.controller.js';
import {DB} from '../database/database.js';
import {HandlerFactory} from './utilities/handler-factory.js';

export class UsersController {
    static getAllUsers = catchAsync(async (req, res, next) => {
        const users = await DB.models.User
            .find()
            .select(DB.filters.User.thirdPartyView);

        res.statusCode = 200;
        res.json({status: 'success', data: {users: users}});
    });

    static createUser = catchAsync(async (req, res, next) => {
        const createdUser = await DB.models.User.create(req.body);

        res.statusCode = 200;
        res.json({status: 'success', data: {user: createdUser}});
    });

    static getUser (req, res, next) {
        res.statusCode = 501;
        res.json({status: 'error', message: 'not implemented'});
    }

    static updateUser (req, res, next) {
        res.statusCode = 501;
        res.json({status: 'error', message: 'not implemented'});
    }

    static deleteUser = HandlerFactory.deleteOne(DB.models.User)

    static alter = catchAsync(async (req, res, next) => {
        const user = req._middlewareData.user;
        const data = {email: req.body.email, name: req.body.name};

        if (data.email && !isEmail(data.email)) {
            return next(new AppError('Received invalid email', 400));
        }

        for (let key in data) {
            if (data[key] === undefined) {
                continue;
            }

            user[key] = data[key];
        }

        let needAccessUpdate = user.needAccessTokenUpdate();

        await user.save({validateModifiedOnly: true});

        res.statusCode = 200;
        if (needAccessUpdate) {
            const token = user.generateAccessToken();
            AuthController.injectAccessToken(res, token);
        }

        res.json({status: 'success', message: 'Your information was successfully updated'});
    });

    static deleteAccount = catchAsync(async (req, res, next) => {
        const user = req._middlewareData.user;
        user.active = false;

        await user.save();
        res.statusCode = 200;
        res.json({status: 'success'});
    });
}

