import express from 'express';
import {accessTokenParse, rolePermission} from '../../../middleware/index.js';
import {ReviewsController} from '../../../controllers/reviews.controller.js';
import {CONSTANTS} from '../../../utils/index.js';

export const reviewsRouter = express.Router({mergeParams: true});

reviewsRouter.route('/')
    .post(accessTokenParse, ReviewsController.post)
    .get(ReviewsController.get);

reviewsRouter.delete('/:id', accessTokenParse, rolePermission(CONSTANTS.ROLES.admin, CONSTANTS.ROLES.leadGuide), ReviewsController.delete)

