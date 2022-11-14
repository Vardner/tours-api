import express from 'express';
import {UsersController} from '../../controllers/index.js';
import {AuthController} from '../../controllers/auth.controller.js';
import {accessTokenParse, rolePermission} from '../../middleware/index.js';
import hpp from 'hpp';
import {CONSTANTS} from '../../utils/index.js';

export const usersRoute = express.Router();

usersRoute.post('/signup', AuthController.signUp);
usersRoute.post('/login', AuthController.signIn);
usersRoute.post('/forgotPassword', AuthController.forgotPassword);
usersRoute.patch('/resetPassword', hpp(), AuthController.resetPassword);

usersRoute.use(accessTokenParse);


usersRoute.get('/me', UsersController.getMe);


usersRoute.patch('/alter', UsersController.alter);

usersRoute.patch('/changePassword', AuthController.changePassword);
usersRoute.delete('/deleteAccount', UsersController.deleteAccount);

usersRoute.use(rolePermission(CONSTANTS.ROLES.admin));
usersRoute.get('/', UsersController.getAllUsers);
usersRoute.route('/:id')
    .delete(UsersController.deleteUser)
    .get(UsersController.getUser)
    .patch(UsersController.update);
