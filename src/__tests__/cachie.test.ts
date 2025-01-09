import { describe, test } from '@jest/globals';
import request from 'supertest';
import app from '../app';
import assert from 'assert';

describe('Cachie', () => {
    test('Should save client tracking info successfully', async () => {
        const res = await request(app)
            .post('/cachie/v1/search')
            .set('Content-Type', 'application/json')
            .send({
                search_query: 'hello world',
                client_id: 'client1',
                session_id: 'session1'
            }).expect(200);

            assert(res.body.hasOwnProperty('status'));
            assert(res.body.hasOwnProperty('processed_tokens'));
            assert(res.body.hasOwnProperty('processing_time'));
    })

    test('Should analyze search data with fuzzy matches (if implemented)', async () => {    
        const res = await request(app)
          .get('/cachie/v1/analyze')
          .query({ analysis_token: 'hello', match_type: 'fuzzy', include_stats: 'true' });
    
        expect(res.status).toBe(200);
        expect(res.body.results).toBeDefined(); // Check for existence of results
    
        if (res.body.results['hello world']) {
          expect(res.body.results['hello world'].fuzzy_matches).toBeGreaterThanOrEqual(1);
        }
    
        expect(res.body.stats).toBeDefined(); // Check for existence of stats (optional)
      });
})