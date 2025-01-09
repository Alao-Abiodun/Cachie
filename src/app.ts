import express, { Request, Response, Application, NextFunction } from 'express';

declare module 'express-serve-static-core' {
    interface Response {
        error: (code: number, message: string) => Response;
        success: (code: number, message: string, result: any) => Response
    }
}

const app: Application = express();

//get routes
import routes from './routes/index.route';
import { StatusCodes } from 'http-status-codes';
import AppError from './utils/lib/appError';
import logger from './services/logger.service';
import { errorResponse } from './utils/lib/response';

// setup middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// mount routes
app.use('/cachie/v1', routes);

// index route
app.get('/cachie', async (req: Request, res: any, next: NextFunction) => {
    return res.status(200).json({
        message: "Welcome to Cachie 🚀"
    })
})

// handle 404 routes
app.get('*', async (req: Request, res: any, next: NextFunction) => {
    return res.status(StatusCodes.NOT_FOUND).json({
        message: `Resource ${req.originalUrl} does not exist`
    })
})

// handle global error
app.use((error: AppError, req: any, res: any, next: any) => {
    logger.error(error);
    console.log('error', error);
    const message =
        error.name === 'Error' ? 'Something went wrong' : error.message;
    const statusCode =
        error.name === 'Error'
            ? StatusCodes.INTERNAL_SERVER_ERROR
            : error.statusCode ?? StatusCodes.BAD_REQUEST;
    return res.status(statusCode).json({
        message
    })
});

export default app;