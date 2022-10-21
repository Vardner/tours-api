import dotenv from 'dotenv';
import mongoose from 'mongoose';

let server;

process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection! 💥. Shutting down...');
    console.error(err);

    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception! 💥. Shutting down...');
    console.error(err);

    if (server) {
        server.close();
        process.exit(1);
    }
});

dotenv.config({path: './env/config.env', debug: true});

const DATABASE_URL = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose.connect(DATABASE_URL)
    .then((connection) => import('./app.js'))
    .then(module => {
        server = module.app.listen(process.env.PORT || 8080, 'localhost', () => {
            console.log('server started...');
        });
    });

