import {AppError, catchAsync} from '../../utils/index.js';

export class HandlerFactory {
    static deleteOne (Model, idRetriever) {
        return catchAsync(async (req, res, next) => {
            const id = idRetriever ? idRetriever(req, res) : req.params.id;
            const document = await Model.findByIdAndDelete(id);

            if (!document) {
                return next(new AppError('Requested data was not found', 404));
            }

            res.statusCode = 200;
            res.json({status: 'success'});
        });
    }
}