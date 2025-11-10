/**
 * Gemini API Routes
 * Backend endpoint for Gemini API integration
 * Keeps API key secure on server side
 */

import { Router, Request, Response } from 'express';

const router = Router();

// Note: Install @google/generative-ai if you want to use this
// npm install @google/generative-ai

/**
 * POST /api/ai/gemini
 * Generate content using Gemini API
 */
router.post('/gemini', async (req: Request, res: Response) => {
  try {
    const { prompt, systemPrompt, temperature, maxTokens } = req.body;
    
    if (!prompt) {
      res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
      return;
    }
    
    // Check if Gemini API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        success: false,
        error: 'Gemini API not configured. Use Chrome Built-in AI instead.'
      });
      return;
    }
    
    // Import Gemini SDK
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-pro' 
    });
    
    // Build the full prompt with system context
    const fullPrompt = systemPrompt 
      ? `${systemPrompt}\n\nUser: ${prompt}`
      : prompt;
    
    // Generate content
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({
      success: true,
      data: text,
      source: 'gemini-api'
    });
    
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ai/gemini/status
 * Check if Gemini API is available
 */
router.get('/status', async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  res.json({
    success: true,
    data: {
      configured: !!apiKey,
      model: process.env.GEMINI_MODEL || 'gemini-pro',
      message: apiKey 
        ? 'Gemini API is configured and ready to use'
        : 'Gemini API not configured. Using Chrome Built-in AI.',
      recommendation: 'For the Chrome Built-in AI Challenge, use Chrome Built-in AI as primary approach.'
    }
  });
});

export default router;
