import {QueryParser} from './utilities/query-parser.js';
import {catchAsync} from '../utils/index.js';
import {DB} from '../database/database.js';
import {HandlerFactory} from './utilities/handler-factory.js';

const TourModel = DB.models.Tour;

export class ToursController {
    static getAllTours = catchAsync(async (req, res, next) => {
        const queryHelper = new QueryParser(req.query);
        queryHelper.filterFunctionalKeys();
        queryHelper.parseFunctionalKeys();
        queryHelper.parseComparisonOperators();
        // TODO protect this part of code from pollution because it fails when pass double sort,
        //  thus transforming the "sort" value into an object
        const tours = await TourModel
            .find(queryHelper.query)
            .select(queryHelper.fields)
            .sort(queryHelper.sort)
            .skip(queryHelper.page * queryHelper.limit)
            .limit(queryHelper.limit);

        res.statusCode = 200;
        res.json({status: 'success', results: tours.length, data: {tours: tours}});
    });

    static getOne = HandlerFactory.getOne(TourModel, {populates: [{path: 'reviews'}]});

    static createOne = HandlerFactory.createOne(TourModel, {
        sanitizer: async (body) => {
            let guides = [];

            if (Array.isArray(body.guides)) {
                for (const guideId of body.guides) {
                    const user = await DB.models.User.findById(guideId);

                    if (user && user.active !== false) {
                        guides.push(guideId);
                    }
                }
            }

            body.guides = guides;
            return body;
        }
    });

    static updateOne = HandlerFactory.updateOne(TourModel, {
        sanitizer: (body) => {
            body.slug = undefined;
            body.ratingsAverage = undefined;
            body.ratingsQuantity = undefined;
            body.createdAt = undefined;
            return body;
        }
    });

    static deleteOne = HandlerFactory.deleteOne(TourModel);

    static getTop5Cheap (req, res, next) {
        console.log('getTop5Cheap');
        req.query.sort = 'price,ratingsAverage';
        req.query.limit = 5;
        ToursController.getAllTours(req, res, next);
    }

    static getTourStats = catchAsync(async (req, res, next) => {
        const stats = await TourModel
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
        const plan = await TourModel.aggregate([
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
}