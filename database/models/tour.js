import mongoose from 'mongoose';
import slugify from 'slugify';
import {Names} from './models-names.js';
import {projections} from './projections/index.js';

const types = mongoose.Schema.Types;

export const Tour = new mongoose.Schema(
    {
        name: {type: types.String, required: true, unique: true, trim: true, maxLength: 40, minLength: 10},

        slug: types.String,

        ratingsAverage: {
            type: types.Number,
            default: 0,
            min: [0, 'Average rating can\'t be lower than 0'],
            max: [5, 'Average rating can\'t be higher than 5'],
        },

        ratingsQuantity: {type: types.Number, default: 0, min: [0, 'Ratings quantity must be a positive integer']},

        duration: {type: types.Number, required: [true, 'Tour duration is required']},

        maxGroupSize: {type: types.Number, required: false},

        difficulty: {
            type: types.String,
            required: [true, 'difficulty is required'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Possible difficulties are easy, medium, difficult'
            }
        },

        price: {
            type: types.Number,
            required: [true, 'Tour price is required'],
            min: [0.01, 'Price can\'t be lower than penny'],
            validate: {
                validator: function (val) {
                    return !this.discount || this.discount < val;
                },
                message: 'Price cannot be lower than thew discount price'
            }
        },

        priceDiscount: {
            type: types.Number,
            min: [0.01, 'Discount price can\'t be lower than penny'],
            validate: {
                validator: function (val) {
                    return val < this.price;
                },
                message: 'Discount must be lower than default price'
            }
        },

        summary: {type: types.String, trim: true, required: [true, 'Tour summary is required']},

        description: {type: types.String, trim: true},

        imageCover: {type: types.String, trim: true, required: false},

        images: [types.String],

        createdAt: {
            type: Date,
            default: Date.now,
            select: false
        },

        startDates: [Date],

        startLocation: {
            type: {
                type: types.String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: {
                type: [types.Number],
            },
            address: {type: types.String},
            description: {type: types.String}
        },

        locations: {
            type: [{
                    type: {
                        type: types.String,
                        default: 'Point',
                        enum: ['Point']
                    },
                    coordinates: {
                        type: [types.Number],
                    },
                    address: {type: types.String},
                    description: {type: types.String}
                }]
        },

        guides: {
            type: [types.ObjectId],
            ref: Names.Users,
            default: []
        },

        secret: {type: types.Boolean, default: false},
    },
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
);

Tour.index({price: 1, ratingsAverage: -1});
Tour.index({price: 1, ratingsAverage: 1});
Tour.index({startLocation: '2dsphere'});
Tour.index({slug: 1});


Tour.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

Tour.virtual('reviews', {
    ref: Names.Reviews,
    localField: '_id',
    foreignField: 'tour'
})

Tour.pre('save', function (next) {
    console.log(this);
    this.slug = slugify(this.name, {lower: true});
    next();
});

Tour.pre('find', function (next) {
    this.find({secret: {$ne: true}});
    next();
});

Tour.pre('find', function (next)  {
    this.populate({path: 'guides', select: projections.User.thirdPartyView});
    next();
})

Tour.pre('findOne', function (next) {
    this.find({secret: {$ne: true}});
    next();
});

Tour.pre('aggregate', function (next) {
    this.pipeline().unshift({$match: {secret: {$ne: true}}});
    next();
});


