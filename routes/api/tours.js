import express from 'express';
import {ToursController} from '../../controllers/index.js';
import {accessTokenParse, rolePermission} from '../../middleware/index.js';
import {CONSTANTS} from '../../utils/index.js';
import hpp from 'hpp';

export const toursRoute = express.Router();


toursRoute.get('/top-5-cheap', ToursController.getTop5Cheap);

toursRoute.get('/stats', ToursController.getTourStats);
toursRoute.get('/monthly-plan/:year', ToursController.getMonthlyPlan);

toursRoute.route('/')
    .get(hpp(), accessTokenParse, ToursController.getAllTours)
    .post(ToursController.createTour);

toursRoute.route('/:id')
    .get(ToursController.getTour)
    .patch(ToursController.updateTour)
    .delete(accessTokenParse, rolePermission(CONSTANTS.ROLES.admin, CONSTANTS.ROLES.leadGuide), ToursController.deleteTour);