import {Database} from '../database/database.js';
import {Models} from '../database/models/index.js';
import {AppError, catchAsync} from '../utils/index.js';
import isEmail from 'validator/lib/isEmail.js';

export class UsersController {
    static getAllUsers = catchAsync(async (req, res, next) => {
        const users = await Models.User
            .find()
            .select(Models.User.selectDefaults.thirdPartyView);

        res.statusCode = 200;
        res.json({status: 'success', data: {users: users}});
    })

    static createUser = catchAsync(async (req, res, next) => {
        const createdUser = await Models.User.create(req.body);

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

    static deleteUser (req, res, next) {
        res.statusCode = 501;
        res.json({status: 'error', message: 'not implemented'});
    }

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

        await user.save({validateModifiedOnly: true});

        res.statusCode = 200;
        res.json({status: 'success'});
    });

    static deleteAccount = catchAsync(async (req, res, next) => {
        const user = req._middlewareData.user;
        user.active = false;

        await user.save();
        res.statusCode = 200;
        res.json({status: 'success'});
    });
}

