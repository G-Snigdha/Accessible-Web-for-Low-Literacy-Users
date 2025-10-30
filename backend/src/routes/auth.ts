import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { ApiResponse, LoginRequest, RegisterRequest, AuthResponse, User } from '../types/index.js';
import { userService } from '../services/userService.js';
import { validateAuth } from '../middleware/auth.js';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    
    body('username')
      .isLength({ min: 3, max: 30 })
      .isAlphanumeric()
      .withMessage('Username must be 3-30 characters and alphanumeric'),
    
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
    
    body('confirm_password')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      })
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          data: errors.array(),
          timestamp: new Date().toISOString()
        };
        return res.status(400).json(response);
      }

      const { email, username, password, preferences }: RegisterRequest = req.body;

      // Check if user already exists
      const existingUser = await userService.findByEmailOrUsername(email, username);
      if (existingUser) {
        const response: ApiResponse = {
          success: false,
          error: existingUser.email === email ? 'Email already registered' : 'Username already taken',
          timestamp: new Date().toISOString()
        };
        return res.status(409).json(response);
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await userService.createUser({
        email,
        username,
        password_hash,
        preferences: preferences || {}
      });

      // Generate JWT tokens
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      const refresh_token = jwt.sign(
        { userId: user.id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
      );

      // Remove password hash from response
      const { password_hash: _, ...userResponse } = user;

      const authResponse: AuthResponse = {
        user: userResponse as Omit<User, 'password_hash'>,
        token,
        refresh_token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };

      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: authResponse,
        message: 'User registered successfully',
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);

    } catch (error) {
      console.error('Registration error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  }
);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    
    body('password')
      .isLength({ min: 1 })
      .withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          data: errors.array(),
          timestamp: new Date().toISOString()
        });
      }

      const { email, password, remember_me }: LoginRequest = req.body;

      // Find user
      const user = await userService.findByEmail(email);
      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
          timestamp: new Date().toISOString()
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
          timestamp: new Date().toISOString()
        });
      }

      // Update last login
      await userService.updateLastLogin(user.id);

      // Generate tokens
      const tokenExpiry = remember_me ? '30d' : (process.env.JWT_EXPIRE || '7d');
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: tokenExpiry }
      );

      const refresh_token = jwt.sign(
        { userId: user.id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
      );

      const { password_hash: _, ...userResponse } = user;

      const authResponse: AuthResponse = {
        user: userResponse as Omit<User, 'password_hash'>,
        token,
        refresh_token,
        expires_at: new Date(Date.now() + (remember_me ? 30 : 7) * 24 * 60 * 60 * 1000)
      };

      res.json({
        success: true,
        data: authResponse,
        message: 'Login successful',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh JWT token
 * @access Public
 */
router.post('/refresh',
  [
    body('refresh_token')
      .isString()
      .withMessage('Refresh token is required')
  ],
  async (req, res) => {
    try {
      const { refresh_token } = req.body;

      // Verify refresh token
      const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET!) as any;
      
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token',
          timestamp: new Date().toISOString()
        });
      }

      // Get user
      const user = await userService.findById(decoded.userId);
      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          error: 'User not found or inactive',
          timestamp: new Date().toISOString()
        });
      }

      // Generate new token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.json({
        success: true,
        data: {
          token,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        message: 'Token refreshed successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user (invalidate token)
 * @access Private
 */
router.post('/logout', validateAuth, async (req, res) => {
  try {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return success as the client will remove the token
    
    res.json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', validateAuth, async (req, res) => {
  try {
    const user = await userService.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    const { password_hash: _, ...userResponse } = user;

    res.json({
      success: true,
      data: userResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get profile',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;