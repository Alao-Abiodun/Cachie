import { Router } from 'express';
import * as cachieController from '../controllers/cachie.controller';

export default (router: Router) => {
    router.post('/search', cachieController.searchClientTrackingInfo)
}