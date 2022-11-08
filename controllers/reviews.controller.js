import {AppError, catchAsync} from '../utils/index.js';
import {DB} from '../database/database.js';
import {QueryParser} from './utilities/query-parser.js';
import {HandlerFactory} from './utilities/handler-factory.js';

export class ReviewsController {
    static post = catchAsync(async (req, res, next) => {
        const user = req._middlewareData.user;
        const relatedTour = req.params.tour;
        const tour = await DB.models.Tour.findById(relatedTour);

        if (!tour) {
            next(new AppError('No tour was found', 404));
            return;
        }

        const review = await DB.models.Review.create({
            tour: tour._id,
            user: user._id,
            review: req.body.content,
            rating: req.body.rating
        });

        res.status = 201;
        res.json({status: 'success', data: {review}});
    });

    static get = catchAsync(async (req, res, next) => {
        const tourId = req.params.tour;

        if (!tourId) {
            next(new AppError('No tour was found', 404));
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

    static delete = HandlerFactory.deleteOne(DB.models.Review);
}