import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import redisClient from '../config/redis.config';

/**
 * save client tracking info
 * @param req The request object
 * @param res The response object
 * @param nextThe next middleware
 * @returns success | error
 */
export const searchClientTrackingInfo = async (req: any, res: any, next: any) => {
    try {
        const start = process.hrtime();

        const { search_query, client_id, session_id } = req.body;

        const tokens = search_query.split(' ').map(token => token.toLowerCase());
        const num_of_processed_tokens = tokens.length;

        const key = `search:${client_id}:${session_id}`;
        const value = JSON.stringify({ search_query, tokens, timestamp: Date.now() });
        
        await redisClient.set(key, value);
        
        const [seconds, nanoseconds] = process.hrtime(start);
        const processingTime = (seconds * 1e3) + (nanoseconds / 1e6);

        return res.status(200).json({
            status: "ok",
            processed_tokens: num_of_processed_tokens,
            processing_time: `${processingTime.toFixed(2)}ms`
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Internal server error."
        })
    }
}