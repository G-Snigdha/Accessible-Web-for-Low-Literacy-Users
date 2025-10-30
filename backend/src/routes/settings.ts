import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { validateAuth, optionalAuth } from '../middleware/auth.js';
import { userService } from '../services/userService.js';

const router = Router();

/**
 * @route GET /api/settings
 * @desc Get user settings (with optional auth for defaults)
 * @access Public/Private
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    if (req.user) {
      // Authenticated user - return their settings
      const preferences = await userService.getPreferences(req.user.id);
      
      if (!preferences) {
        return res.status(404).json({
          success: false,
          error: 'User preferences not found',
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        data: preferences,
        timestamp: new Date().toISOString()
      });
    } else {
      // Anonymous user - return default settings
      const defaultSettings = {
        font_size: 'medium',
        language: 'en',
        high_contrast: false,
        reduce_motion: false,
        dark_mode: false,
        tts_enabled: true,
        tts_speed: 1.0,
        tts_voice: null,
        auto_simplify: false,
        reading_level_preference: 'auto',
        notification_preferences: {
          email_notifications: true,
          reading_reminders: false,
          progress_updates: true,
          new_features: false
        }
      };

      res.json({
        success: true,
        data: defaultSettings,
        message: 'Default settings (not authenticated)',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get settings',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route PUT /api/settings
 * @desc Update user settings
 * @access Private
 */
router.put('/',
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
        message: 'Settings updated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update settings',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route POST /api/settings/reset
 * @desc Reset user settings to defaults
 * @access Private
 */
router.post('/reset', validateAuth, async (req, res) => {
  try {
    const defaultPreferences = {
      font_size: 'medium' as const,
      language: 'en',
      high_contrast: false,
      reduce_motion: false,
      dark_mode: false,
      tts_enabled: true,
      tts_speed: 1.0,
      tts_voice: null,
      auto_simplify: false,
      reading_level_preference: 'auto' as const,
      notification_preferences: {
        email_notifications: true,
        reading_reminders: false,
        progress_updates: true,
        new_features: false
      }
    };

    const preferences = await userService.updatePreferences(req.user!.id, defaultPreferences);

    res.json({
      success: true,
      data: preferences,
      message: 'Settings reset to defaults',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset settings',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/settings/export
 * @desc Export user settings as JSON
 * @access Private
 */
router.get('/export', validateAuth, async (req, res) => {
  try {
    const preferences = await userService.getPreferences(req.user!.id);
    
    if (!preferences) {
      return res.status(404).json({
        success: false,
        error: 'User preferences not found',
        timestamp: new Date().toISOString()
      });
    }

    // Remove sensitive data for export
    const { id, user_id, created_at, updated_at, ...exportData } = preferences;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="accessible-web-settings.json"');
    
    res.json({
      export_date: new Date().toISOString(),
      application: 'Accessible Web Low-Literacy',
      version: '1.0.0',
      settings: exportData
    });

  } catch (error) {
    console.error('Export settings error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export settings',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;