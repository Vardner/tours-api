import {AppError, catchAsync} from '../utils/app-error.js';
import jwt from 'jsonwebtoken';
import {sendMail} from '../utils/index.js';
import {DB} from '../database/database.js';

const JWT_COOKIE_MAX_AGE = process.env.JWT_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000;

export class AuthController {
    static generateAccessToken (payload, expiresIn = 86400) {
        return jwt.sign(payload, process.env.APP_KEY, {expiresIn});
    }

    static injectAccessToken (res, token) {
        const options = {
            maxAge: JWT_COOKIE_MAX_AGE,
            httpOnly: true,
        };

        if (process.env.NODE_ENV === 'production') {
            options.sameSite = 'lax';
            options.secure = true;
        }

        res.cookie('accessToken', token, options);
    }

    static signUp = catchAsync(async (req, res, next) => {
        const {email, password, name} = req.body;
        if (!password || !email) {
            next(new AppError('Please provide email and password', 400));
            return;
        }

        if (!DB.models.User.isStrongPassword(password)) {
            next(new AppError(DB.models.User.passwordRecommendation, 400));
            return;
        }

        const passwordHash = await DB.models.User.hashPassword(password);
        const createdUser = new DB.models.User(process.env.NODE_ENV === 'development'
            ? {name: name, email: email, password: passwordHash, role: req.body.role}
            : {name: name, email: email, password: passwordHash}
        );

        const validationError = await createdUser.validate();

        if (validationError) {
            next(validationError);
            return;
        }

        const userData = createdUser.toObject({versionKey: false});
        userData.password = undefined;
        await createdUser.save();

        const token = createdUser.generateAccessToken();

        AuthController.injectAccessToken(res, token);

        res.statusCode = 200;
        res.json({
            status: 'success',
            data: {user: userData}
        });
    });

    static signIn = catchAsync(async (req, res, next) => {
        const user = await DB.models.User.findOne({email: req.body.email});

        if (!user) {
            next(new AppError('User not found', 404));
            return;
        }

        const passwordMatch = await user.verifyPassword(req.body.password);

        if (passwordMatch) {
            const token = user.generateAccessToken();
            AuthController.injectAccessToken(res, token);
            res.statusCode = 200;
            res.json({status: 'success'});
        } else {
            next(new AppError('User not found', 404));
        }
    });

    static forgotPassword = catchAsync(async (req, res, next) => {
        const user = await DB.models.User.findOne({email: req.body.email});

        if (!user) {
            next(new AppError(404, 'There is no user with provided email address'));
            return;
        }

        const token = user.createResetToken();
        await user.save({validateModifiedOnly: true});

        const resetUrl = `${req.protocol}://${req.hostname}/api/v1/users/resetPassword?token=${token}`;
        await sendMail({
            email: user.email,
            subject: 'Reset your password',
            message: `We got a request to reset your UAtours password. Send an PATCH request to this url address with your new password ${resetUrl}`
        }).then(
            () => {
                res.statusCode = 200;
                const responseData = {
                    status: 'success',
                    message: 'Reset link will be sent at your email. Remember link will expire within 30 minutes'
                };

                if (process.env.NODE_ENV === 'development') {
                    responseData.data = {token};
                }

                res.json(responseData);
            },
            () => {
                user.resetPassword = undefined;
                user.resetPasswordExp = undefined;
                user.save({validateModifiedOnly: true});

                next(new AppError('Error during an email sending. Try again later', 500));
            }
        );
    });

    static changePassword = catchAsync(async (req, res, next) => {
        const user = req._middlewareData.user;
        const {currentPassword, updatedPassword} = req.body;

        if (!user.verifyPassword(currentPassword)) {
            next(new AppError('Current password doesn\'t match provided one', 400));
            return;
        }

        if (!DB.models.User.isStrongPassword(updatedPassword)) {
            next(new AppError(DB.models.User.passwordRecommendation, 400));
            return;
        }

        user.password = await DB.models.User.hashPassword(updatedPassword);
        await user.save({validateModifiedOnly: true});

        const token = user.generateAccessToken();
        AuthController.injectAccessToken(res, token);
        res.statusCode = 200;
        res.send({
            status: 'success',
            message: 'Your password has been changed',
        });
    });

    static resetPassword = catchAsync(async (req, res, next) => {
        const resetPwdToken = req.query.token;
        const {hash} = DB.models.User.generateResetTokenPair(resetPwdToken);
        // const users = await Models.User.find();
        const users = await DB.models.User.find({resetPassword: hash});

        const validUsers = users.filter(user => +user.resetPasswordExp > Date.now());

        if (validUsers.length > 1 || validUsers.length === 0) {
            next(new AppError('Something went wrong. Please submit a new password reset request', 400));
            return;
        }

        const validUser = validUsers[0];
        validUser.resetPasswordExp = undefined;
        validUser.resetPassword = undefined;
        validUser.password = await DB.models.User.hashPassword(req.body.password);

        await validUser.save({validateModifiedOnly: true});

        const accessToken = validUser.generateAccessToken();
        AuthController.injectAccessToken(res, accessToken);
        res.statusCode = 200;
        res.json({
            status: 'success',
            message: 'Password has been changed',
        });

        users.splice(users.indexOf(validUser), 1);
        users.forEach(user => {
            user.passwordReset = undefined;
            user.resetPasswordExp = undefined;
            user.save({validateModifiedOnly: true}).catch(() => 0);
        });
    });

    static signOut = catchAsync(async (req, res, next) => {

    });

    static refreshTokes = catchAsync(async (req, res) => {

    });
}