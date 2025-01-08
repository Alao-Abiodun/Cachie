import express, { Request, Response, Application, NextFunction } from 'express';

const app: Application = express();

// setup middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// index route
app.get('/cachie', async (req: Request, res: Response, next: NextFunction) => {
    // return res.status(200).json({
    //     message: 'Welcome to Cachie 🚀'
    // })
    console.log(res);
})

// handle 404 routes
app.get('*', async (req: Request, res: Response, next: NextFunction) => {
    console.log(res);
})

export default app;