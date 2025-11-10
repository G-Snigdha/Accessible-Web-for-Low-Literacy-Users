import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { RequestWithUser, User } from '../types/index.js';
import { userService } from '../services/userService.js';

/**
 * Middleware to validate JWT token and authenticate user
 */
export const validateAuth = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Get user from database
    const user = await userService.findById(decoded.userId);
    if (!user || !user.is_active) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Add user to request object
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth validation error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Middleware to validate API key for extension/external access
 */
export const validateApiKey = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    // First try JWT authentication
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return validateAuth(req, res, next);
    }

    // Fall back to API key or session-based auth for anonymous users
    const apiKey = req.headers['x-api-key'] as string;
    
    // For development, allow requests without API key
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    // In production, you would validate the API key here
    if (!apiKey) {
      // For anonymous users, create a session
      req.user = undefined; // No user, but allow access
      return next();
    }

    // Validate API key (placeholder implementation)
    if (apiKey === process.env.API_KEY) {
      return next();
    }

    res.status(401).json({
      success: false,
      error: 'Invalid API key',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API key validation error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Middleware to check if user has admin privileges
 */
export const requireAdmin = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Check if user is admin (you'd add an is_admin field to User type)
  // For now, we'll use a simple check
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');
  if (!adminEmails.includes(req.user.email)) {
    res.status(403).json({
      success: false,
      error: 'Admin privileges required',
      timestamp: new Date().toISOString()
    });
    return;
  }

  next();
};

/**
 * Middleware to extract user from token without requiring authentication
 * Useful for optional authentication endpoints
 */
export const optionalAuth = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await userService.findById(decoded.userId);
        
        if (user && user.is_active) {
          req.user = user;
        }
      } catch (error) {
        // Invalid token, but continue without user
        console.log('Invalid token in optional auth:', error);
      }
    }

    next();

  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue without user
  }
};