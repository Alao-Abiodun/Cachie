import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SearchData } from '../interface/search.interface';
import logger from '../services/logger.service';
import { errorResponse, successResponse } from '../utils/lib/response';
import AppError from '../utils/lib/appError';

// In-memory storage for search data
const searchData: Record<string, SearchData> = {};

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

      if (!search_query || !client_id || !session_id) {
        throw new AppError('Missing credentials', StatusCodes.BAD_REQUEST)
      }
  
      const tokens = search_query.split(' ').map(token => token.toLowerCase());
      const num_of_processed_tokens = tokens.length;
  
      // Generate token pairs
      const tokenPairs: string[] = [];
      for (let i = 0; i < tokens.length - 1; i++) {
        tokenPairs.push(`${tokens[i]} ${tokens[i + 1]}`);
      }
  
      // Update searchData for each token pair
      for (const tokenPair of tokenPairs) {
        if (!searchData[tokenPair]) {
          searchData[tokenPair] = {
            exact_matches: 0,
            fuzzy_matches: 0,
            client_distribution: {},
            unique_sessions: new Set(),
          };
        }
  
        searchData[tokenPair].exact_matches++;
        searchData[tokenPair].client_distribution[client_id] = 
          (searchData[tokenPair].client_distribution[client_id] || 0) + 1;
        searchData[tokenPair].unique_sessions.add(session_id);
  
        // Handle fuzzy matches
        for (const token of tokens) {
          if (tokenPair.includes(token) && token !== tokenPair.split(' ')[0]) { 
            searchData[tokenPair].fuzzy_matches += 1; 
  
            // Find potential fuzzy matches in searchData
            const potentialFuzzyPairs = Object.keys(searchData)
              .filter(key => key.includes(token) && key !== tokenPair);
  
            potentialFuzzyPairs.forEach(fuzzyPair => {
              for (const session of searchData[fuzzyPair].unique_sessions) {
                searchData[tokenPair].unique_sessions.add(session); 
              }
            });
  
            break;
          }
        }
      }
  
      const [seconds, nanoseconds] = process.hrtime(start);
      const processingTime = (seconds * 1e3) + (nanoseconds / 1e6);
  
      return successResponse(res, 'ok', {
        processed_tokens: num_of_processed_tokens,
        processing_time: `${processingTime.toFixed(2)}ms`
      })
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
 * @param nextThe next middleware
 * @returns Analysis results
 */
export const analyseSearchData = async (req: Request, res: any, next: NextFunction) => {
  try {
    const start = process.hrtime();

    const { analysis_token, match_type = 'exact', include_stats = 'false' } = req.query;

    if (!analysis_token) {
      throw new AppError('Missing required query parameter: analysis_token.', StatusCodes.BAD_REQUEST)
    }

    const tokens = (analysis_token as string).split(',');
    const includeStats = include_stats === 'true';

    const results: any = {};
    let totalSearchesAnalyzed = 0;
    let uniqueClients = new Set<string>();
    let uniqueSessions = new Set<string>();

    for (const tokenPair of tokens) {
      results[tokenPair] = searchData[tokenPair] || {
        exact_matches: 0,
        fuzzy_matches: 0,
        client_distribution: {},
        unique_sessions: new Set<string>(),
      };

      totalSearchesAnalyzed += results[tokenPair].exact_matches + results[tokenPair].fuzzy_matches;
      for (const client in results[tokenPair].client_distribution) {
        uniqueClients.add(client);
      }
      for (const session of results[tokenPair].unique_sessions) {
        uniqueSessions.add(session);
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

    return successResponse(res, 'Analyzed successfully', {
        response
    }, StatusCodes.OK);
  } catch (error) {
    console.error("Error analyzing search data:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Internal server error."
    });
  }
};


