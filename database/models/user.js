import mongoose from 'mongoose';
import isEmail from 'validator/lib/isEmail.js';
import argon2 from 'argon2';
import isStrongPassword from 'validator/lib/isStrongPassword.js';
import {CONSTANTS} from '../../utils/constants.js';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import {Names} from './models-names.js';

const passwordDefault = Object.freeze({
    hashLength: 64,
    minLength: 8,
    max: 30,
    minNumbers: 1,
    minLowercase: 1,
    minUppercase: 1
});

function isArgonPwd (str) {
    return str.length > passwordDefault.max && /^\$argon2.{0,2}\$/.test(str);
}

function hash (message) {
    return argon2.hash(message, {hashLenght: passwordDefault.hashLength, timeCost: 2 ** 8});
}

const types = mongoose.Schema.Types;

const schema = new mongoose.Schema({
    name: {
        type: types.String,
        required: [true, 'Name is required']
    },
    email: {
        type: types.String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: {
            validator: isEmail,
            message: 'Email appears to be invalid'
        }
    },
    emailConfirmed: {
        type: types.Boolean,
        required: false,
        default: false
    },
    photo: {
        type: types.String,
        required: false
    },
    role: {
        type: types.String,
        enum: Object.values(CONSTANTS.ROLES),
        default: 'user'
    },
    password: {
        type: types.String,
        required: [true, 'Password is required'],
        validate: {
            validator: (val) => {
                console.log('model validator trigger');
                return isArgonPwd(val);
            },
            message: process.env.NODE_ENV === 'development' ? 'Password in DB must be hashed' : 'Something went wrong'
        }
    },
    resetPassword: {
        type: types.String
    },
    resetPasswordExp: {
        type: Date
    },
    /** Timestamp of last sensitive data update (like email, password and so on) in order to invalidate dumb JWT token*/
    sUpdatedAt: {
        type: Date,
        default: Date.now()
    },
    active: {
        type: types.Boolean,
        default: true,
        select: false
    }
});

schema.statics.selectDefaults = {
    thirdPartyView: {
        __v: false,
        email: false,
        emailConfirmed: false,
        role: false,
        password: false,
        resetPassword: false,
        resetPasswordExp: false,
        sUpdatedAt: false,
    },
    omitTech: {
        __v: false,
        _id: false,
        role: false,
        emailConfirmed: false,
        resetPassword: false,
        resetPasswordExp: false,
        sUpdatedAt: false,
        active: false,
    },
};

schema.statics.password = passwordDefault;

schema.statics.isStrongPassword = (password) => {
    return isStrongPassword(password, {
        minSymbols: 0,
        minLength: passwordDefault.minLength,
        minLowercase: passwordDefault.minLowercase,
        minNumbers: passwordDefault.minNumbers,
        minUppercase: passwordDefault.minUppercase,
    });
};

schema.statics.passwordRecommendation = `Password must be at least ${passwordDefault.minLength} characters long; `
    + `contain at least: ${passwordDefault.minUppercase} uppercase character, ${passwordDefault.minLowercase} `
    + `lowercase character, and ${passwordDefault.minNumbers} number`;

schema.statics.hashPassword = hash;

schema.statics.generateResetToken = function () {
    return crypto.randomBytes(32).toString('hex');
};

schema.statics.generateResetTokenPair = (token = schema.statics.generateResetToken()) => {
    return {token, hash: crypto.createHash('sha256').update(token).digest('hex')};
};

schema.methods.verifyPassword = function (candidate) {
    return argon2.verify(this.password, candidate);
};

schema.methods.createResetToken = function () {
    const pair = schema.statics.generateResetTokenPair();
    const token = pair.token;
    this.resetPassword = pair.hash;
    this.resetPasswordExp = Date.now() + 30 * 60 * 1000;
    return token;
};

schema.methods.generateAccessToken = function (expiresIn = 86400) {
    return jwt.sign({id: this._id}, process.env.APP_KEY, {expiresIn});
};

schema.methods.needAccessTokenUpdate = function () {
    return this.isModified('password email name')
}

function addSUpdateAtTS (next) {
    const updateSet = Object.keys(this.getUpdate().$set).toString();
    if (/\w(password|email|name)\w/.test(updateSet)) {
        this.getUpdate().$set.sUpdatedAt = Date.now();
        console.log('sUpdate ' + Date.now());
    }
    next();
}

async function hashPwdOnUpdateQuery (next) {
    console.log('update middleware trigger');
    const pwd = this.getUpdate().$set.password;
    if (pwd && !isArgonPwd(pwd)) {
        this.getUpdate().$set.password = await hash(pwd);
    }
    next();
}

schema
    .pre('save', function sUpdateTS (next) {
        if (this.isModified('password email name')) {
            this.sUpdatedAt = Date.now();
        }
        next();
    });

schema.pre('find', function (next) {
    this.find({active: {$ne: false}});
    next();
});

schema
    .pre('updateOne', {query: true, document: false}, hashPwdOnUpdateQuery)
    .pre('updateOne', {query: true, document: false}, addSUpdateAtTS)
    .pre('findOneAndUpdate', hashPwdOnUpdateQuery)
    .pre('findOneAndUpdate', addSUpdateAtTS);

export const User = mongoose.model(Names.Users, schema);