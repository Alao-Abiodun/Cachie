import { Router } from 'express';
import * as cachieController from '../controllers/cachie.controller';
import { rateLimiterMiddleware } from '../utils/lib/rateLimiter';

export default (router: Router) => {
    router.post('/search', cachieController.searchClientTrackingInfo);
    router.get('/analyze', cachieController.analyseSearchData);
}