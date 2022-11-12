import express from 'express';
import {UsersController} from '../../controllers/index.js';
import {AuthController} from '../../controllers/auth.controller.js';
import {accessTokenParse, rolePermission} from '../../middleware/index.js';
import hpp from 'hpp';
import {CONSTANTS} from '../../utils/index.js';

export const usersRoute = express.Router();

usersRoute.get('/', UsersController.getAllUsers);
usersRoute.get('/me', accessTokenParse, UsersController.getMe);

usersRoute.post('/signup', AuthController.signUp);
usersRoute.post('/login', AuthController.signIn);
usersRoute.patch('/alter', accessTokenParse, UsersController.alter);

usersRoute.patch('/changePassword', accessTokenParse, AuthController.changePassword);
usersRoute.post('/forgotPassword', AuthController.forgotPassword);
usersRoute.patch('/resetPassword', hpp(), AuthController.resetPassword);
usersRoute.delete('/deleteAccount', accessTokenParse, UsersController.deleteAccount);

usersRoute.route('/:id')
    .delete(accessTokenParse, rolePermission(CONSTANTS.ROLES.admin), UsersController.deleteUser)
    .get(accessTokenParse, UsersController.getUser)
    .patch(accessTokenParse, rolePermission(CONSTANTS.ROLES.admin), UsersController.update);
