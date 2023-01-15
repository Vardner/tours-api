import express from 'express';
import {ToursController} from '../../../controllers/index.js';
import {accessTokenParse, rolePermission} from '../../../middleware/index.js';
import {CONSTANTS} from '../../../utils/index.js';
import hpp from 'hpp';
import {reviewsRouter} from './reviews.js';

export const toursRoute = express.Router();


toursRoute.get('/top-5-cheap', ToursController.getTop5Cheap);

toursRoute.get('/stats', ToursController.getTourStats);
toursRoute.get('/monthly-plan/:year', accessTokenParse, rolePermission(CONSTANTS.ROLES.admin, CONSTANTS.ROLES.leadGuide, CONSTANTS.ROLES.guide), ToursController.getMonthlyPlan);

toursRoute.route('/')
    .get(hpp(), ToursController.getAllTours)
    .post(accessTokenParse, rolePermission(CONSTANTS.ROLES.admin, CONSTANTS.ROLES.leadGuide),ToursController.createOne);

toursRoute.get('/tours-within/:distance/center/:latlng/unit/:unit', ToursController.getToursWithin);

toursRoute.route('/:id')
    .get(ToursController.getOne)
    .patch(accessTokenParse, rolePermission(CONSTANTS.ROLES.admin, CONSTANTS.ROLES.leadGuide), ToursController.updateOne)
    .delete(accessTokenParse, rolePermission(CONSTANTS.ROLES.admin, CONSTANTS.ROLES.leadGuide), ToursController.deleteOne);

toursRoute.use('/:tour/reviews', reviewsRouter);
