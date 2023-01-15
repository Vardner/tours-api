import dotenv from 'dotenv';

dotenv.config({path: './env/config.env', override: true});
export const DATABASE_URL = process.env.DB_URL_LOCAL.replace('<PASSWORD>', process.env.DB_PASSWORD);