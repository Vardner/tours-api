import {models} from './models/index.js';
import {projections} from './models/projections/index.js';
import mongoose from 'mongoose';

function connect (url, isDevMode) {
    return mongoose.connect(url, {autoIndex: isDevMode, autoCreate: isDevMode}).then(() => true, () => false);
}

function runDelay(time) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), time);
    });
}

function connectToServer (isDevMode) {
    let retries = 3;
    const delay = 3000;
    const DATABASE_URL = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD);

    return  new Promise(async (res, rej) => {
        do {
            const result = await connect(DATABASE_URL, isDevMode);
            if (result === false) {
                if (retries) {
                    console.warn('Can\'t connect to the DB server');
                    await runDelay(delay);
                } else {
                    rej('DB server doesn\'t response');
                }
            } else {
                console.log('Successfully connected to the DB server');
                res();
                break;
            }
        } while (retries--);
    });
}

async function openConnection (isDevMode) {
    await connectToServer(isDevMode);

    if (isDevMode) {
        await mongoose.syncIndexes();
    }
}


export const DB = {
    models: models,
    projections: projections,
    openConnection: openConnection
}