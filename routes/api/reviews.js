import express from 'express';
import {accessTokenParse} from '../../middleware/index.js';
import {ReviewsController} from '../../controllers/reviews.controller.js';

export const reviewsRouter = express.Router();

reviewsRouter.route('/')
    .post(accessTokenParse, ReviewsController.post)
    .get(ReviewsController.get);

