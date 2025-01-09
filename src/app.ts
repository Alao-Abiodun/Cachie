import express, { Request, Response, Application, NextFunction } from 'express';
import expressOpenapi from 'express-openapi';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import yaml from 'js-yaml';
import { StatusCodes } from 'http-status-codes';
import AppError from './utils/lib/appError';
import logger from './services/logger.service';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const apiDoc = yaml.load(fs.readFileSync(path.join(__dirname, './api-v1/api-doc.yml'), 'utf-8')) as any;

const app: Application = express();

//get routes
import routes from './routes/index.route';

// setup middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    '/cachie/v1/docs',
    swaggerUi.serve,
    swaggerUi.setup(apiDoc)
  );

// Initialize OpenAPI middleware
expressOpenapi.initialize({
    app,
    apiDoc,
    paths: path.resolve(__dirname, './routes'),
  });

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