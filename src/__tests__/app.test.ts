import { describe, it, expect, jest, test } from '@jest/globals';
import app from '../app';
import request from 'supertest';

describe('GET /', () => {
    test('should return 200 OK', () => {
        return request(app).get('/cachie').expect(200);
    })
})