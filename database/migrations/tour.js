import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import {models} from '../models/index.js';
import * as path from 'path';

dotenv.config({path: './env/config.env', debug: true});

const DATABASE_URL = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD);
await mongoose.connect(DATABASE_URL);
const migrationName = 'Tour';
const controller = {
    up: async () =>{
        try {
            console.log(`Migration ${migrationName} running up operation`);
            const toursList = fs.readFileSync(path.resolve(process.cwd(), './dev-data/data/tours.json'), {encoding: 'utf8'})
            await models.Tour.insertMany(JSON.parse(toursList), {rawResult: true});
            console.log(`Migration ${migrationName} Result: migration succeed`);
        } catch (e) {
            console.error(`Migration ${migrationName} Result: migration failed, ` + e);
        }
    },
    down: async () => {
        try {
            console.log(`Migration ${migrationName} running down operation`);
            const result = await models.Tour.deleteMany({});
            console.log(`Migration ${migrationName} Result: migration succeed`)
        } catch (e) {
            console.error(`Migration ${migrationName} Result: migration failed, ` + e);
        }
    }
}

await controller[process.env.operation || 'up']();

process.exit(0);


