import {Names} from './models-names.js';
import {User} from './user.js';
import {Tour} from './tour.js';
import mongoose from 'mongoose';

export const models = {
    Tour: mongoose.model(Names.Tours, Tour),
    User: mongoose.model(Names.Users, User)
}