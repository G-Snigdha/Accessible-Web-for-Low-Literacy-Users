import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Generate request ID
  const requestId = uuidv4();
  req.headers['x-request-id'] = requestId;

  // Log request start
  const startTime = Date.now();
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, {
    requestId,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    headers: req.headers
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data: any) {
    const duration = Date.now() - startTime;
    
    console.log(`[${new Date().toISOString()}] Response sent`, {
      requestId,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      method: req.method,
      url: req.url
    });

    return originalJson.call(this, data);
  };

  next();
};