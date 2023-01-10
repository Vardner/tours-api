import mongoose from 'mongoose';
import {Names} from './models-names.js';
import {projections} from './projections/index.js';
import {models} from './index.js';

const types = mongoose.Schema.Types;

export const Review = new mongoose.Schema(
    {
        user: {
            type: types.ObjectId,
            required: [true, 'Review must be long to a user'],
            ref: Names.Users
        },
        tour: {
            type: types.ObjectId,
            required: [true, 'Review must be long to a tour'],
            ref: Names.Tours
        },
        review: {
            type: types.String,
            required: [true, 'Review cannot be empty']
        },
        rating: {
            type: types.Number,
            min: [0, 'Rating can\'t be lower than 0'],
            max: [5, 'Average rating can\'t be higher than 5'],
            default: 0,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            required: true
        }
    },
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    }
);

Review.statics.calcAvgRatings = async function (tourId) {
    const stats = (await models.Review.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                total: {$count: {}},
                avg: {$avg: '$rating'}
            }
        },
        {
            $set: {
                avg: {$round: ['$avg', 1]},
            }
        }
    ]))[0];

    console.log(stats);

    models.Tour.findOneAndUpdate(
        {_id: tourId},
        {ratingsAverage: stats.avg, ratingsQuantity: stats.total},
        undefined,
        () => 0 // Somehow this shit function refuses to work without await or callback
    );
};

Review.pre(/^find/, function (next) {
    this.populate({path: 'user', select: projections.User.thirdPartyView});
    next();
});
// Run avg rating of tours update on each new review
Review.post('save', function () {
    Review.statics.calcAvgRatings(this.tour);
});