import mongoose from 'mongoose';
import {Names} from './models-names.js';
import {User} from './user.js';
import {Tour} from './tour.js';
import {Review} from './review.js';

export const models = {
    Tour: mongoose.model(Names.Tours, Tour),
    User: mongoose.model(Names.Users, User),
    Review: mongoose.model(Names.Reviews, Review)
}