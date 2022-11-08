import {QueryParser} from './utilities/query-parser.js';
import {AppError, catchAsync} from '../utils/app-error.js';
import {DB} from '../database/database.js';
import {HandlerFactory} from './utilities/handler-factory.js';

export class ToursController {
    static getAllTours = catchAsync(async (req, res, next) => {
        const queryHelper = new QueryParser(req.query);
        queryHelper.filterFunctionalKeys();
        queryHelper.parseFunctionalKeys();
        queryHelper.parseComparisonOperators();
        // TODO protect this part of code from pollution because it fails when pass double sort with that transforms into object
        const tours = await DB.models.Tour
            .find(queryHelper.query)
            .select(queryHelper.fields)
            .sort(queryHelper.sort)
            .skip(queryHelper.page * queryHelper.limit)
            .limit(queryHelper.limit);

        res.statusCode = 200;
        res.json({status: 'success', results: tours.length, data: {tours: tours}});
    });

    static createTour = catchAsync(async (req, res, next) => {
        let guides = [];

        if (Array.isArray(req.body.guides)) {
            for (const guideId of req.body.guides) {
                const user = await DB.models.User.findById(guideId);

                if (user && user.active !== false) {
                    guides.push(guideId);
                }
            }
        }

        req.body.guides = guides;

        const createdTour = await DB.models.Tour.create(req.body);
        res.statusCode = 200;
        res.json({status: 'success', data: {tour: createdTour}});
    });

    static getTour = catchAsync(async (req, res, next) => {
        const searchedTour = await DB.models.Tour
            .findById(req.params.id)
            .populate({path: 'reviews'});

        if (!searchedTour) {
            return next(new AppError('No tour found', 404));
        }

        res.statusCode = 200;
        res.send({status: 'success', data: {tour: searchedTour}});
    });

    static updateTour = catchAsync(async (req, res, next) => {
        const updatedTour = await DB.models.Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedTour) {
            return next(new AppError('No tour found', 404));
        }

        res.statusCode = 200;
        res.json({status: 'success', data: {tour: updatedTour}});
    });

    // static deleteTour = catchAsync(async (req, res, next) => {
    //     const tour = await DB.models.Tour.findByIdAndDelete(req.params.id, {new: true});
    //
    //     if (!tour) {
    //         return next(new AppError('No tour found', 404));
    //     }
    //
    //     res.statusCode = 200;
    //     res.json({status: 'success'});
    // });

    static deleteTour = HandlerFactory.deleteOne(DB.models.Tour);

    static getTop5Cheap (req, res, next) {
        console.log('getTop5Cheap');
        req.query.sort = 'price,ratingsAverage';
        req.query.limit = 5;
        ToursController.getAllTours(req, res, next);
    }

    static getTourStats = catchAsync(async (req, res, next) => {
        const stats = await DB.models.Tour
            .aggregate([
                {$match: {ratingsAverage: {$gte: 4.5}}},
                {
                    $group: {
                        _id: {$toUpper: '$difficulty'},
                        avgRating: {$avg: '$ratingsAverage'},
                        avgPrice: {$avg: '$price'},
                        minPrice: {$min: '$price'},
                        maxPrice: {$max: '$price'},
                        numTours: {$count: {}},
                        numRatings: {$sum: '$ratingsQuantity'}
                    }
                },
                {$sort: {avgPrice: 1}}
            ]);

        res.statusCode = 200;
        res.json({
            status: 'success',
            data: {
                stats
            }
        });
    });

    static getMonthlyPlan = catchAsync(async (req, res, next) => {
        const year = +req.params.year;
        const plan = await DB.models.Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: {$month: '$startDates'},
                    numToursStart: {$sum: 1},
                    tours: {$push: '$name'}
                },
            },
            {$addFields: {month: '$_id'}},
            {$project: {_id: 0}},
            {$sort: {month: 1}}
        ]);

        res.statusCode = 200;
        res.json({status: 'success', data: {plan}});
    });

    static retrieveTourFromParams = catchAsync(async (req, res, next) => {
        console.log('tour retrieve');
        console.log(req.params);
        if (!req._middlewareData) {
            req._middlewareData = {};
        }

        const tour = await DB.models.Tour.findById(req.params.id);
        if (!tour) {
            next(new AppError('Tour was not found', 404));
            return;
        }

        req._middlewareData.tour = tour;
        next();
    });
}