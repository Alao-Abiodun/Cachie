import { Router } from 'express';
import cachieRoute from './cachie.route';

const router = Router();

cachieRoute(router);

export default router;