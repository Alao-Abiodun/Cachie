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

// setup middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// mount routes
app.use('/cachie/v1', routes);

// index route
app.get('/cachie', async (req: Request, res: Response, next: NextFunction) => {
    console.log(res);
})

// handle 404 routes
app.get('*', async (req: Request, res: Response, next: NextFunction) => {
    console.log(res);
})

export default app;