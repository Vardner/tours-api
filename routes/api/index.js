import {usersRoute} from './users.js';
import {toursRoute} from './tours.js';
import {reviewsRouter} from './reviews.js';

export const setupRotes = (router) => {
    router.use('/api/v1/tours', toursRoute);
    router.use('/api/v1/users', usersRoute);
    router.use('/api/v1/reviews', reviewsRouter);
};