import { Response } from 'express';
import { getReasonPhrase } from 'http-status-codes';

export interface ISuccessResponse {
    success: true;
    message: string;
    payload: {
        [key: string]: any;
    };
}

export interface IErrorResponse {
    success: false;
    error: {
        type: string;
        code: number;
        message: string;
    };
}

/**
 * HTTP success response
 * @param res The response object
 * @param message The success message
 * @param payload The payload
 * @returns ISuccessResponse
 */
export const successResponse = (
    res: any,
    message: string,
    payload?: any,
    statusCode: number = 200
): Response<ISuccessResponse> => {
    return res.status(statusCode).json({
        status: 'ok',
        ...payload
    });
};

/**
 * HTTP error response
 * @param res The response object
 * @param message The error message
 * @param statusCode Http status code
 * @returns IErrorResponse
 */
export const errorResponse = (
    res: any,
    message: any,
    statusCode: number
): Response<IErrorResponse> => {
    const reason = getReasonPhrase(statusCode);
    return res.status(statusCode).json({
        success: false,
        error: {
            type: reason,
            code: statusCode,
            message: message,
        },
    });
};
