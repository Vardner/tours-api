import {AppError, catchAsync} from '../utils/index.js';
import {DB} from '../database/database.js';
import {QueryParser} from './utilities/query-parser.js';

export class ReviewsController {
    static post = catchAsync(async (req, res, next) => {
        const user = req._middlewareData.user;
        const relatedTour = req.body.tour;
        const tour = await DB.models.Tour.findById(relatedTour);

        if (!tour) {
            res.status = 404;
            res.json(new AppError('No tour was found', res.status));
            return;
        }

        const review = await DB.models.Review.create({
            tour: tour._id,
            user: user._id,
            review: req.body.review.content,
            rating: req.body.review.rating
        });

        res.status = 201;
        res.json({status: 'success', data: {review}});
    });

    static get = catchAsync(async (req, res, next) => {
        const tourId = req.query.tour;

        if (!tourId) {
            res.status = 404;
            res.json(new AppError('No reviews was found', res.status));
            return;
        }

        const query = new QueryParser(req.params);
        query.parseFunctionalKeys(['page']);
        const limit = 20;
        const offset = query.page * limit;
        const reviews = await DB.models.Review
            .find({tour: tourId})
            .limit(limit)
            .skip(offset);

        res.status = 200;
        res.json({status: 'success', results: reviews.length, data: {reviews}});
    });
}