import {usersRoute} from './users.js';
import {toursRoute} from './tours/tours.js';

export const setupRotes = (router) => {
    router.use('/api/v1/tours', toursRoute);
    router.use('/api/v1/users', usersRoute);
};