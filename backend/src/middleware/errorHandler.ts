import { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '../types/index.js';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Not found';
  } else if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File too large';
  } else if (error.message) {
    message = error.message;
  }

  // Custom error response format
  const errorResponse: ApiResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    request_id: req.headers['x-request-id'] as string || undefined
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    (errorResponse as any).stack = error.stack;
    (errorResponse as any).details = error;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ApiResponse = {
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString()
  };

  res.status(404).json(errorResponse);
};

/**
 * Async error wrapper
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};