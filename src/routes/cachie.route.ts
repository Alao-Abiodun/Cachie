import { Router } from 'express';
import * as cachieController from '../controllers/cachie.controller';
import { rateLimiterMiddleware } from '../utils/lib/rateLimiter';

export default (router: Router) => {
    router.post('/search', rateLimiterMiddleware, cachieController.searchClientTrackingInfo);
    router.get('/analyze', cachieController.analyseSearchData);
}

//search document
/**
 * {
 *   id: Object.ID
 *   search_query: String,
 *   client_id: String,
 *   session_id: String,
 * }
 */

// analyze document
/**
 * {
 *   exact_matches: Number,
 *  fuzzy_matches: Number,
 *  search: ref(search document)
 * }
 */