/**
 * Optional: Gemini API Fallback Service
 * Use this as a fallback when Chrome Built-in AI is not available
 * For Chrome Built-in AI Challenge, this is OPTIONAL enhancement
 */
export class GeminiAPIFallback {
    constructor(config = {}) {
        this.config = {
            apiKey: config.apiKey || '',
            model: config.model || 'gemini-pro',
            backendUrl: config.backendUrl || 'http://localhost:3001'
        };
    }
    /**
     * Check if Gemini API is configured
     */
    isAvailable() {
        // Check if backend is available (recommended for security)
        return !!this.config.backendUrl;
    }
    /**
     * Generate text using Gemini API through backend
     */
    async generate(prompt, options) {
        try {
            const response = await fetch(`${this.config.backendUrl}/api/ai/gemini`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt,
                    systemPrompt: options?.systemPrompt,
                    temperature: options?.temperature ?? 0.7,
                    maxTokens: options?.maxTokens ?? 1000
                })
            });
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }
            const result = await response.json();
            return result;
        }
        catch (error) {
            console.error('Gemini API error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Gemini API request failed'
            };
        }
    }
    /**
     * Summarize text using Gemini API
     */
    async summarize(text, options) {
        const summaryPrompt = `Please provide a ${options?.length || 'short'} ${options?.type || 'summary'} of the following text:\n\n${text}`;
        return this.generate(summaryPrompt, {
            systemPrompt: 'You are an expert at summarizing text clearly and concisely.',
            temperature: 0.3
        });
    }
    /**
     * Translate text using Gemini API
     */
    async translate(text, options) {
        const translatePrompt = `Translate the following text to ${options.targetLanguage}:\n\n${text}`;
        return this.generate(translatePrompt, {
            systemPrompt: `You are a professional translator. Provide only the translation, no explanations.`,
            temperature: 0.2
        });
    }
    /**
     * Rewrite text using Gemini API
     */
    async rewrite(text, options) {
        const tone = options?.tone || 'neutral';
        const length = options?.length || 'same length';
        const rewritePrompt = `Rewrite the following text with a ${tone} tone and make it ${length}:\n\n${text}`;
        return this.generate(rewritePrompt, {
            systemPrompt: 'You are an expert writer. Rewrite the text as requested while preserving the core meaning.',
            temperature: 0.5
        });
    }
    /**
     * Proofread text using Gemini API
     */
    async proofread(text) {
        const proofreadPrompt = `Proofread the following text and provide corrections. Return a JSON object with:
1. "correctedText": the fully corrected text
2. "corrections": array of {original, corrected, reason} for each change

Text to proofread:
${text}`;
        const result = await this.generate(proofreadPrompt, {
            systemPrompt: 'You are an expert proofreader. Provide corrections in valid JSON format only.',
            temperature: 0.2
        });
        if (!result.success || !result.data) {
            return result;
        }
        try {
            // Try to parse JSON response
            const parsed = JSON.parse(result.data);
            return {
                success: true,
                data: parsed
            };
        }
        catch {
            // If parsing fails, return as corrected text
            return {
                success: true,
                data: {
                    correctedText: result.data,
                    corrections: []
                }
            };
        }
    }
}
// Example usage with hybrid approach
export async function generateWithHybridAI(prompt, chromeAI, // Your ChromeAIService instance
geminiAPI) {
    // Try Chrome Built-in AI first (preferred for hackathon)
    try {
        const availability = await chromeAI.checkAvailability();
        if (availability.promptAPI === 'readily') {
            const result = await chromeAI.prompt(prompt);
            if (result.success) {
                return {
                    ...result,
                    source: 'chrome-ai'
                };
            }
        }
    }
    catch (error) {
        console.log('Chrome Built-in AI not available, trying Gemini API...');
    }
    // Fallback to Gemini API
    if (geminiAPI.isAvailable()) {
        const result = await geminiAPI.generate(prompt);
        return {
            ...result,
            source: 'gemini-api'
        };
    }
    // Neither available
    return {
        success: false,
        error: 'No AI service available',
        source: 'chrome-ai'
    };
}
// Export singleton (optional)
export const geminiAPI = new GeminiAPIFallback({
    backendUrl: 'http://localhost:3001'
});
