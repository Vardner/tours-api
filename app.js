import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import {setupRoutes} from './routes/index.js';
import {AppError} from './utils/app-error.js';
import * as path from 'path';
import {ErrorsController} from './controllers/index.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

export const app = express();

const middleware = [
    cors(),
    helmet(),
    express.json({limit: '10kb'}),
    mongoSanitize({replaceWith: '_', allowDots: false}),
    xss(),
    express.static(path.join(process.cwd(), 'public'))
];

if (process.env.NODE_ENV === 'development') {
    middleware.splice(1, 0, morgan('dev'));
}

app.disable('x-powered-by');
app.use(...middleware);
app.use('/api', rateLimit({
    windowMs: 1000 * 60 * 10,
    max: 100,
    standardHeaders: false,
    message: 'Too many requests from this IP. Try later!'
}))
setupRoutes(app);


app.all('*', (req, res, next) => {
    next(new AppError(`Cant find ${req.path}`, 404));
});

app.use(ErrorsController.default);