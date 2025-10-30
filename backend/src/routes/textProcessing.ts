import { Router } from 'express';
import type { ApiResponse, TextProcessingRequest, TextProcessingResult } from '../types/index.js';
import { textProcessingService } from '../services/textProcessingService.js';
import { body, query, validationResult } from 'express-validator';

const router = Router();

/**
 * @route POST /api/text/process
 * @desc Process text with various AI operations (simplify, translate, rewrite, proofread)
 * @access Public (rate limited)
 */
router.post('/process',
  [
    body('text')
      .isString()
      .isLength({ min: 1, max: 50000 })
      .withMessage('Text must be between 1 and 50,000 characters'),
    
    body('action')
      .isIn(['simplify', 'translate', 'rewrite', 'proofread', 'analyze'])
      .withMessage('Action must be one of: simplify, translate, rewrite, proofread, analyze'),
    
    body('options.target_language')
      .optional()
      .isString()
      .isLength({ min: 2, max: 5 })
      .withMessage('Target language must be a valid language code'),
    
    body('options.reading_level')
      .optional()
      .isIn(['elementary', 'middle', 'high'])
      .withMessage('Reading level must be elementary, middle, or high'),
    
    body('options.max_sentences')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Max sentences must be between 1 and 20'),
    
    body('user_id')
      .optional()
      .isUUID()
      .withMessage('User ID must be a valid UUID'),
    
    body('session_id')
      .optional()
      .isString()
      .withMessage('Session ID must be a string')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          timestamp: new Date().toISOString(),
          data: errors.array()
        };
        return res.status(400).json(response);
      }

      const request: TextProcessingRequest = req.body;
      const startTime = Date.now();

      // Process the text
      const result = await textProcessingService.processText(request);
      const processingTime = Date.now() - startTime;

      const response: ApiResponse<TextProcessingResult> = {
        success: true,
        data: {
          ...result,
          processing_time_ms: processingTime
        },
        message: `Text ${request.action} completed successfully`,
        timestamp: new Date().toISOString()
      };

      res.json(response);

    } catch (error) {
      console.error('Text processing error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  }
);

/**
 * @route GET /api/text/analyze
 * @desc Analyze text readability and complexity without processing
 * @access Public (rate limited)
 */
router.post('/analyze',
  [
    body('text')
      .isString()
      .isLength({ min: 1, max: 50000 })
      .withMessage('Text must be between 1 and 50,000 characters')
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

      const { text } = req.body;
      const analysis = await textProcessingService.analyzeText(text);

      const response: ApiResponse = {
        success: true,
        data: analysis,
        message: 'Text analysis completed',
        timestamp: new Date().toISOString()
      };

      res.json(response);

    } catch (error) {
      console.error('Text analysis error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /api/text/history
 * @desc Get user's text processing history
 * @access Private
 */
router.get('/history',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('action')
      .optional()
      .isIn(['simplify', 'translate', 'rewrite', 'proofread', 'analyze'])
      .withMessage('Action filter must be valid'),
    
    query('start_date')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    
    query('end_date')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date')
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

      const {
        page = 1,
        limit = 20,
        action,
        start_date,
        end_date
      } = req.query;

      // For now, return empty history since we don't have user authentication fully set up
      const history = await textProcessingService.getProcessingHistory({
        user_id: req.user?.id,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        action: action as string,
        start_date: start_date as string,
        end_date: end_date as string
      });

      res.json({
        success: true,
        data: history.data,
        pagination: history.pagination,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('History retrieval error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /api/text/languages
 * @desc Get list of supported languages for translation
 * @access Public
 */
router.get('/languages', async (req, res) => {
  try {
    const languages = await textProcessingService.getSupportedLanguages();
    
    res.json({
      success: true,
      data: languages,
      message: 'Supported languages retrieved',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Languages retrieval error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route DELETE /api/text/history/:id
 * @desc Delete a specific text processing record
 * @access Private
 */
router.delete('/history/:id',
  async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Processing ID is required',
          timestamp: new Date().toISOString()
        });
      }

      await textProcessingService.deleteProcessingRecord(id, req.user?.id);

      res.json({
        success: true,
        message: 'Processing record deleted successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Delete record error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

export default router;