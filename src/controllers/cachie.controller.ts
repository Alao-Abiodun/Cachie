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
        
        const tokenPairs = [];
        for (let i = 0; i < tokens.length - 1; i++) {
            tokenPairs.push(`${tokens[i]} ${tokens[i + 1]}`);
        }

        console.log('tp', tokenPairs);

        // Store data in Redis for each token pair
        for (const tokenPair of tokenPairs) {
            console.log('t', tokenPair);
            const key = `precomputed_results:${tokenPair}`;
            const currentData = await redisClient.get(key);
            let data = currentData ? JSON.parse(currentData) : {
                exact_matches: 0,
                fuzzy_matches: 0,
                client_distribution: {},
                unique_sessions: 0,
            };

            // Update the data with the current search
            data.exact_matches += 1;
            data.client_distribution[client_id] = (data.client_distribution[client_id] || 0) + 1;
            data.unique_sessions += 1;

            // Save updated data back to Redis
            await redisClient.set(key, JSON.stringify(data));
        }

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

/**
 * Analyse search data
 * @param req The request object
 * @param res The response object
 * @param next The next middleware
 * @returns Analysis results
 */
export const analyseSearchData = async (req: Request, res: any, next: NextFunction) => {
    try {
        const start = process.hrtime();

        const { analysis_token, match_type = 'exact', include_stats = 'false' } = req.query;

        if (!analysis_token) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: "error",
                message: "Missing required query parameter: analysis_token."
            });
        }

        const tokens = (analysis_token as string).split(',');
        const includeStats = include_stats === 'true';

        const results: any = {};
        let totalSearchesAnalyzed = 0;
        let uniqueClients = new Set<string>();
        let uniqueSessions = new Set<string>();

        for (const tokenPair of tokens) {
            const precomputedData = await redisClient.get(`precomputed_results:${tokenPair}`);
            
            if (precomputedData) {
                const data = JSON.parse(precomputedData);
                results[tokenPair] = data;

                totalSearchesAnalyzed += data.exact_matches + data.fuzzy_matches;
                Object.keys(data.client_distribution).forEach(client => uniqueClients.add(client));
                uniqueSessions.add(data.unique_sessions);
            } else {
                results[tokenPair] = {
                    exact_matches: 0,
                    fuzzy_matches: 0,
                    client_distribution: {},
                    unique_sessions: 0,
                };
            }
        }

        const [seconds, nanoseconds] = process.hrtime(start);
        const processingTime = (seconds * 1e3) + (nanoseconds / 1e6);

        const response: any = { results };

        if (includeStats) {
            response.stats = {
                processing_time: `${processingTime.toFixed(2)}ms`,
                total_searches_analyzed: totalSearchesAnalyzed,
                unique_clients: uniqueClients.size,
                unique_sessions: uniqueSessions.size,
            };
        }

        return res.status(StatusCodes.OK).json(response);
    } catch (error) {
        console.error("Error analyzing search data:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Internal server error."
        });
    }
};


