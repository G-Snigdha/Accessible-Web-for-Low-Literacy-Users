/**
 * Chrome Built-in AI Service
 * Interfaces with Chrome's built-in AI APIs powered by Gemini Nano
 * For Google Chrome Built-in AI Challenge 2025
 */
export class ChromeAIService {
    constructor() {
        this.languageModel = null;
        this.summarizer = null;
        this.writer = null;
        this.rewriter = null;
        this.translator = null;
    }
    /**
     * Check availability of all Chrome Built-in AI APIs
     */
    async checkAvailability() {
        const availability = {
            promptAPI: 'not-supported',
            summarizerAPI: 'not-supported',
            writerAPI: 'not-supported',
            rewriterAPI: 'not-supported',
            translatorAPI: 'not-supported',
            proofreaderAPI: 'not-supported',
            isAnyAvailable: false
        };
        try {
            // Check Prompt API (Language Model)
            if (window.ai?.languageModel) {
                const capabilities = await window.ai.languageModel.capabilities();
                availability.promptAPI = capabilities.available;
            }
            // Check Summarizer API
            if (window.ai?.summarizer) {
                const capabilities = await window.ai.summarizer.capabilities();
                availability.summarizerAPI = capabilities.available;
            }
            // Check Writer API
            if (window.ai?.writer) {
                const capabilities = await window.ai.writer.capabilities();
                availability.writerAPI = capabilities.available;
            }
            // Check Rewriter API
            if (window.ai?.rewriter) {
                const capabilities = await window.ai.rewriter.capabilities();
                availability.rewriterAPI = capabilities.available;
            }
            // Check Translator API
            if (window.ai?.translator) {
                const capabilities = await window.ai.translator.capabilities();
                availability.translatorAPI = capabilities.available;
            }
            // Proofreader uses Prompt API with specific system prompt
            availability.proofreaderAPI = availability.promptAPI;
            // Check if any API is available
            availability.isAnyAvailable =
                availability.promptAPI !== 'no' && availability.promptAPI !== 'not-supported' ||
                    availability.summarizerAPI !== 'no' && availability.summarizerAPI !== 'not-supported' ||
                    availability.writerAPI !== 'no' && availability.writerAPI !== 'not-supported' ||
                    availability.rewriterAPI !== 'no' && availability.rewriterAPI !== 'not-supported' ||
                    availability.translatorAPI !== 'no' && availability.translatorAPI !== 'not-supported';
        }
        catch (error) {
            console.error('Error checking AI availability:', error);
        }
        return availability;
    }
    /**
     * Prompt API - General purpose language model (Gemini Nano)
     * Use for creative tasks, question answering, and proofreading
     */
    async prompt(userPrompt, options) {
        try {
            if (!window.ai?.languageModel) {
                return {
                    success: false,
                    error: 'Prompt API not available. Please use Chrome Dev/Canary 127+ with AI features enabled.'
                };
            }
            // Create language model if not exists
            if (!this.languageModel) {
                this.languageModel = await window.ai.languageModel.create({
                    systemPrompt: options?.systemPrompt,
                    temperature: options?.temperature ?? 0.7,
                    topK: options?.topK ?? 40
                });
            }
            // Generate response
            const response = await this.languageModel.prompt(userPrompt);
            return {
                success: true,
                data: response
            };
        }
        catch (error) {
            console.error('Prompt API error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate response'
            };
        }
    }
    /**
     * Summarizer API - Distill complex information into clear insights
     */
    async summarize(text, options) {
        try {
            if (!window.ai?.summarizer) {
                return {
                    success: false,
                    error: 'Summarizer API not available. Please use Chrome Dev/Canary with AI features enabled.'
                };
            }
            // Create summarizer
            const summarizer = await window.ai.summarizer.create({
                type: options?.type ?? 'tl;dr',
                format: options?.format ?? 'plain-text',
                length: options?.length ?? 'short',
                sharedContext: options?.context
            });
            // Generate summary
            const summary = await summarizer.summarize(text);
            // Clean up
            summarizer.destroy();
            return {
                success: true,
                data: summary
            };
        }
        catch (error) {
            console.error('Summarizer API error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to summarize text'
            };
        }
    }
    /**
     * Writer API - Create original and engaging text
     */
    async write(prompt, options) {
        try {
            if (!window.ai?.writer) {
                return {
                    success: false,
                    error: 'Writer API not available. Please use Chrome Dev/Canary with AI features enabled.'
                };
            }
            // Create writer
            const writer = await window.ai.writer.create({
                tone: options?.tone ?? 'neutral',
                format: options?.format ?? 'plain-text',
                length: options?.length ?? 'medium',
                sharedContext: options?.context
            });
            // Generate content
            const content = await writer.write(prompt);
            // Clean up
            writer.destroy();
            return {
                success: true,
                data: content
            };
        }
        catch (error) {
            console.error('Writer API error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to write content'
            };
        }
    }
    /**
     * Rewriter API - Improve content with alternative phrasing
     */
    async rewrite(text, options) {
        try {
            if (!window.ai?.rewriter) {
                return {
                    success: false,
                    error: 'Rewriter API not available. Please use Chrome Dev/Canary with AI features enabled.'
                };
            }
            // Create rewriter
            const rewriter = await window.ai.rewriter.create({
                tone: options?.tone ?? 'as-is',
                format: options?.format ?? 'as-is',
                length: options?.length ?? 'as-is',
                sharedContext: options?.context
            });
            // Rewrite content
            const rewritten = await rewriter.rewrite(text);
            // Clean up
            rewriter.destroy();
            return {
                success: true,
                data: rewritten
            };
        }
        catch (error) {
            console.error('Rewriter API error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to rewrite text'
            };
        }
    }
    /**
     * Translator API - Add multilingual capabilities
     */
    async translate(text, options) {
        try {
            if (!window.ai?.translator) {
                return {
                    success: false,
                    error: 'Translator API not available. Please use Chrome Dev/Canary with AI features enabled.'
                };
            }
            // Check if translation is supported
            const capabilities = await window.ai.translator.capabilities();
            if (capabilities.available === 'no') {
                return {
                    success: false,
                    error: 'Translation not available for this language pair'
                };
            }
            // Create translator
            const translator = await window.ai.translator.create({
                sourceLanguage: options.sourceLanguage,
                targetLanguage: options.targetLanguage
            });
            // Translate text
            const translated = await translator.translate(text);
            // Clean up
            translator.destroy();
            return {
                success: true,
                data: translated
            };
        }
        catch (error) {
            console.error('Translator API error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to translate text'
            };
        }
    }
    /**
     * Proofreader - Correct grammar mistakes with ease
     * Uses Prompt API with specialized system prompt
     */
    async proofread(text, options) {
        try {
            if (!window.ai?.languageModel) {
                return {
                    success: false,
                    error: 'Proofreader (Prompt API) not available. Please use Chrome Dev/Canary with AI features enabled.'
                };
            }
            // Simplified approach - just return corrected text
            const tasksToPerform = [];
            if (options?.correctGrammar !== false)
                tasksToPerform.push('Fix grammar mistakes');
            if (options?.correctSpelling !== false)
                tasksToPerform.push('Correct spelling errors');
            if (options?.improvePunctuation !== false)
                tasksToPerform.push('Improve punctuation');
            const systemPrompt = `You are an expert proofreader and grammar checker. 
      
Your task:
${tasksToPerform.map((task, i) => `${i + 1}. ${task}`).join('\n')}

IMPORTANT: Return ONLY the corrected text. Do not add explanations, do not add "Here is the corrected text:", just return the corrected version directly.

If the text is already perfect, return it unchanged.`;
            const result = await this.prompt(text, {
                systemPrompt,
                temperature: 0.2 // Low temperature for consistent corrections
            });
            if (!result.success || !result.data) {
                return result;
            }
            // Clean up the response (remove any preambles)
            let correctedText = result.data.trim();
            // Remove common preambles
            const preambles = [
                'Here is the corrected text:',
                'Here\'s the corrected text:',
                'Corrected text:',
                'Here you go:',
                'Here it is:',
            ];
            for (const preamble of preambles) {
                if (correctedText.toLowerCase().startsWith(preamble.toLowerCase())) {
                    correctedText = correctedText.substring(preamble.length).trim();
                    break;
                }
            }
            // Remove surrounding quotes if present
            if ((correctedText.startsWith('"') && correctedText.endsWith('"')) ||
                (correctedText.startsWith("'") && correctedText.endsWith("'"))) {
                correctedText = correctedText.substring(1, correctedText.length - 1);
            }
            // Simple comparison to generate corrections
            const corrections = [];
            if (correctedText !== text) {
                corrections.push({
                    original: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
                    corrected: correctedText.substring(0, 50) + (correctedText.length > 50 ? '...' : ''),
                    reason: 'Text has been proofread and corrected'
                });
            }
            return {
                success: true,
                data: {
                    correctedText,
                    corrections
                }
            };
        }
        catch (error) {
            console.error('Proofreader error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to proofread text'
            };
        }
    }
    /**
     * Simplify text for low-literacy users
     * Tries Rewriter API first, falls back to Prompt API
     */
    async simplify(text) {
        // Try Rewriter API first
        if (window.ai?.rewriter) {
            const rewriteResult = await this.rewrite(text, {
                tone: 'more-casual',
                length: 'shorter'
            });
            if (rewriteResult.success) {
                return rewriteResult;
            }
            // If rewriter fails, fall through to Prompt API
        }
        // Fallback: Use Prompt API to simplify
        try {
            if (!window.ai?.languageModel) {
                return {
                    success: false,
                    error: 'Neither Rewriter API nor Prompt API is available. Please enable AI features in Chrome Canary.'
                };
            }
            const systemPrompt = `You are a text simplification expert. Your task is to:
1. Rewrite the text using simpler, everyday words
2. Break long sentences into shorter ones
3. Use active voice instead of passive voice
4. Keep the same meaning but make it easier to read
5. Aim for 5th-8th grade reading level

Return ONLY the simplified text, nothing else.`;
            const result = await this.prompt(text, {
                systemPrompt,
                temperature: 0.5
            });
            return result;
        }
        catch (error) {
            console.error('Simplify error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to simplify text'
            };
        }
    }
    /**
     * Clean up all AI instances
     */
    destroy() {
        if (this.languageModel) {
            this.languageModel.destroy();
            this.languageModel = null;
        }
        if (this.summarizer) {
            this.summarizer.destroy();
            this.summarizer = null;
        }
        if (this.writer) {
            this.writer.destroy();
            this.writer = null;
        }
        if (this.rewriter) {
            this.rewriter.destroy();
            this.rewriter = null;
        }
        if (this.translator) {
            this.translator.destroy();
            this.translator = null;
        }
    }
}
// Export singleton instance
export const chromeAI = new ChromeAIService();
