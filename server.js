import dotenv from 'dotenv';
import {DB} from './database/database.js';

export let server;

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

await DB.openConnection(process.env.NODE_ENV === 'development')
    .then(() => import('./app.js'))
    .then(module => {
        server = module.app.listen(process.env.PORT || 8080, 'localhost', () => {
            console.log(`App started ${new Date()}...`);
        });
    });

