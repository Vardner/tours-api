import express from 'express';
import {accessTokenParse, rolePermission} from '../../../middleware/index.js';
import {ReviewsController} from '../../../controllers/reviews.controller.js';
import {CONSTANTS} from '../../../utils/index.js';

export const reviewsRouter = express.Router({mergeParams: true});

reviewsRouter.route('/')
    .post(accessTokenParse, ReviewsController.createReview)
    .get(ReviewsController.getByTour);

reviewsRouter.route('/:id')
    .delete(accessTokenParse, rolePermission(CONSTANTS.ROLES.admin), ReviewsController.deleteOne)
    .get(ReviewsController.getOne)
    .patch(accessTokenParse, rolePermission(CONSTANTS.ROLES.admin), ReviewsController.updateOne);

