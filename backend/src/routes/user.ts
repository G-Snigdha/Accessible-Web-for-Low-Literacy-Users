import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import type { ApiResponse, UserPreferences } from '../types/index.js';
import { userService } from '../services/userService.js';
import { validateAuth } from '../middleware/auth.js';

const router = Router();

/**
 * @route GET /api/user/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', validateAuth, async (req, res) => {
  try {
    const user = await userService.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    const { password_hash: _, ...userProfile } = user;

    res.json({
      success: true,
      data: userProfile,
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

/**
 * @route PUT /api/user/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile',
  validateAuth,
  [
    body('username')
      .optional()
      .isLength({ min: 3, max: 30 })
      .isAlphanumeric()
      .withMessage('Username must be 3-30 characters and alphanumeric'),
    
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required')
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

      const updates = req.body;
      const updatedUser = await userService.updateProfile(req.user!.id, updates);

      const { password_hash: _, ...userProfile } = updatedUser;

      res.json({
        success: true,
        data: userProfile,
        message: 'Profile updated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /api/user/preferences
 * @desc Get user preferences
 * @access Private
 */
router.get('/preferences', validateAuth, async (req, res) => {
  try {
    const preferences = await userService.getPreferences(req.user!.id);

    res.json({
      success: true,
      data: preferences,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get preferences',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route PUT /api/user/preferences
 * @desc Update user preferences
 * @access Private
 */
router.put('/preferences',
  validateAuth,
  [
    body('font_size')
      .optional()
      .isIn(['small', 'medium', 'large', 'extra-large'])
      .withMessage('Font size must be small, medium, large, or extra-large'),
    
    body('language')
      .optional()
      .isLength({ min: 2, max: 5 })
      .withMessage('Language must be a valid language code'),
    
    body('high_contrast')
      .optional()
      .isBoolean()
      .withMessage('High contrast must be a boolean'),
    
    body('reduce_motion')
      .optional()
      .isBoolean()
      .withMessage('Reduce motion must be a boolean'),
    
    body('dark_mode')
      .optional()
      .isBoolean()
      .withMessage('Dark mode must be a boolean'),
    
    body('tts_enabled')
      .optional()
      .isBoolean()
      .withMessage('TTS enabled must be a boolean'),
    
    body('tts_speed')
      .optional()
      .isFloat({ min: 0.5, max: 2.0 })
      .withMessage('TTS speed must be between 0.5 and 2.0'),
    
    body('auto_simplify')
      .optional()
      .isBoolean()
      .withMessage('Auto simplify must be a boolean'),
    
    body('reading_level_preference')
      .optional()
      .isIn(['elementary', 'middle', 'high', 'auto'])
      .withMessage('Reading level preference must be elementary, middle, high, or auto')
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

      const preferences = await userService.updatePreferences(req.user!.id, req.body);

      res.json({
        success: true,
        data: preferences,
        message: 'Preferences updated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update preferences',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route DELETE /api/user/account
 * @desc Delete user account
 * @access Private
 */
router.delete('/account', validateAuth, async (req, res) => {
  try {
    await userService.deleteUser(req.user!.id);

    res.json({
      success: true,
      message: 'Account deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete account',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;