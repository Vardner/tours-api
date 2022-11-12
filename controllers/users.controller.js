import {AppError, catchAsync} from '../utils/index.js';
import isEmail from 'validator/lib/isEmail.js';
import {AuthController} from './auth.controller.js';
import {DB} from '../database/database.js';
import {HandlerFactory} from './utilities/handler-factory.js';

const UserModel = DB.models.User;

export class UsersController {
    static getAllUsers = catchAsync(async (req, res, next) => {
        const users = await UserModel
            .find()
            .select(DB.projections.User.thirdPartyView);

        res.statusCode = 200;
        res.json({status: 'success', data: {users: users}});
    });

    static getUser = HandlerFactory.getOne(UserModel, {projection: DB.projections.User.thirdPartyView})

    static update = HandlerFactory.updateOne(UserModel, {
        sanitizer: (body) => {
            body.resetPassword = undefined;
            body.resetPasswordExp = undefined;
            body.sUpdatedAt = undefined;
            return body;
        }
    });

    static deleteUser = HandlerFactory.deleteOne(UserModel);

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

    static getMe (req, res, next) {
        const me = req._middlewareData.user.toObject({virtuals: true, versionKey: false});
        const meView = {};

        for (let key in me) {
            if (DB.projections.User.ownData[key] !== false) {
                meView[key] = me[key];
            }
        }

        res.statusCode = 200;
        res.json({status: 'success', data: {user: meView}});
    }
}

