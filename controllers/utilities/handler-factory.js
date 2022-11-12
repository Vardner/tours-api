import {AppError, catchAsync} from '../../utils/index.js';

export class HandlerFactory {
    static deleteOne (Model, config = {}) {
        const {idRetriever, sanitizer} = config;
        return catchAsync(async (req, res, next) => {
            const id = idRetriever ? idRetriever(req, res) : req.params.id;
            if (!id) {
                next(new AppError('Not found', 404));
                return ;
            }
            const document = await Model.findByIdAndDelete(id);

            if (!document) {
                return next(new AppError('Requested data was not found', 404));
            }

            res.statusCode = 200;
            res.json({status: 'success'});
        });
    }

    static updateOne (Model, config) {
        const {idRetriever, sanitizer} = config;

        return catchAsync(async (req, res, next) => {
            const id = idRetriever ? idRetriever(req, res) : req.params.id;
            if (!id) {
                next(new AppError('Not found', 404));
                return ;
            }
            const modelName = Model.modelName.toLowerCase();
            const sanitizedBody = (sanitizer && await sanitizer(req.body)) || req.body;
            const updatedDocument = await Model.findByIdAndUpdate(id, {$set: sanitizedBody}, {
                new: true,
                runValidators: true
            });

            if (!updatedDocument) {
                return next(new AppError(`No ${modelName} to update was found`, 404));
            }

            res.statusCode = 200;
            res.json({status: 'success', data: {[modelName]: updatedDocument}});
        });
    }

    static createOne (Model, config) {
        const {idRetriever, sanitizer} = config;

        return catchAsync(async (req, res, next) => {
            const id = idRetriever ? idRetriever(req, res) : req.params.id;
            if (!id) {
                next(new AppError('Not found', 404));
                return ;
            }

            const sanitizedBody = (sanitizer && await sanitizer(req.body)) || req.body;
            const document = Model.create(sanitizedBody);

            res.statusCode = 201;
            res.json({status: 'success', data: {[Model.modelName.toLowerCase()]: document}});
        });
    }

    static getOne (Model, config) {
        const {idRetriever, populates, projection} = config;

        return catchAsync(async (req, res, next) => {
            const id = idRetriever ? idRetriever(req, res) : req.params.id;
            const query = Model.findById(id);

            if (projection) {
                query.select(projection);
            }

            if (populates) {
                query.populate(populates);
            }

            const modelName = Model.modelName.toLowerCase();
            const document = await query;

            if (!document) {
                next(new AppError(`No ${modelName} was found`));
            }

            res.statusCode = 200;
            res.json({status: 'success', data: {[modelName]: document}});
        });
    }

    static getAll (Model, config) {
        const {populates, projection} = config;

        return catchAsync(async (req, res, next) => {
            const id = idRetriever ? idRetriever(req, res) : req.params.id;
            const query = Model.findById(id);

            if (projection) {
                query.select(projection);
            }

            if (populates) {
                query.populate(populates);
            }

            const modelName = Model.modelName.toLowerCase();
            const document = await query;

            if (!document) {
                next(new AppError(`No ${modelName} was found`));
            }

            res.statusCode = 200;
            res.json({status: 'success', data: {[modelName]: document}});
        });
    }
}