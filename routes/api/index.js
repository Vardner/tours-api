import {usersRoute} from './users.js';
import {toursRoute} from './tours/tours.js';
import {reviewsRouter} from './tours/reviews.js';

export const setupRotes = (router) => {
    router.use('/api/v1/tours', toursRoute);
    router.use('/api/v1/users', usersRoute);
    router.use('/api/v1/reviews', reviewsRouter);
};