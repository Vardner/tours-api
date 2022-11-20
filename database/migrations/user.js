import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import * as path from 'path';
import {models} from '../models/index.js';
import {Names as ModelNames} from '../models/models-names.js';

dotenv.config({path: './env/config.env', debug: true});

const operation = process.env.operation === 'up' ? 'up' : 'down';

const DATABASE_URL = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD);
await mongoose.connect(DATABASE_URL);
const modelName = ModelNames.Users;
const controller = {
    up: async () => {
        try {
            console.log(`Migration ${modelName} running up operation`);
            const toursList = fs.readFileSync(path.resolve(process.cwd(), './dev-data/data/users.json'), {encoding: 'utf8'})
            await models[modelName].insertMany(JSON.parse(toursList), {rawResult: true});
            console.log(`Migration ${modelName} Result: migration succeed`);
        } catch (e) {
            console.error(`Migration ${modelName} Result: migration failed, ` + e);
        }
    },
    down: async () => {
        try {
            console.log(`Migration ${modelName} running down operation`);
            const result = await models[modelName].deleteMany({});
            console.log(`Migration ${modelName} Result: migration succeed`)
        } catch (e) {
            console.error(`Migration ${modelName} Result: migration failed, ` + e);
        }
    }
}

await controller[operation]();

process.exit(0);


