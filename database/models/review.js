import mongoose from 'mongoose';
import {Names} from './models-names.js';

const types = mongoose.Types;

export const Review = new mongoose.Schema(
    {
        user: {
            type: types.ObjectId,
            required: [true, 'Review must be long to some user'],
            ref: Names.Users
        },
        tour: {
            type: types.ObjectId,
            required: [true, 'Review must be long to some tour'],
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