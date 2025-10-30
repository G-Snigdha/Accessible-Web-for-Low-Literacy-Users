// AI Types for Chrome Built-in AI APIs
export interface SummarizeOptions {
  maxSentences?: number;
  readingLevel?: 'very-simple' | 'simple' | 'intermediate' | 'advanced';
  preserveFormat?: boolean;
}

export interface TranslateOptions {
  sourceLanguage?: string;
  targetLanguage: string;
  preserveFormatting?: boolean;
}

export interface RewriteOptions {
  style?: 'simple' | 'formal' | 'casual' | 'friendly';
  tone?: 'positive' | 'neutral' | 'encouraging';
  readingLevel?: 'very-simple' | 'simple' | 'intermediate';
}

export interface ProofreadOptions {
  checkGrammar?: boolean;
  checkSpelling?: boolean;
  suggestions?: boolean;
  simplifyLanguage?: boolean;
}

export interface ReadAloudOptions {
  voice?: string;
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
  language?: string;
}

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interim?: boolean;
}

// Result types
export interface AIResult<T = string> {
  success: boolean;
  data?: T;
  error?: string;
  isOfflineFallback?: boolean;
}

export interface SummarizeResult {
  summary: string;
  originalLength: number;
  summaryLength: number;
  readingLevel: string;
  vocabularyList?: Array<{ word: string; simple: string }>;
  estimatedReadingTime?: number; // minutes
}

export interface TranslateResult {
  translatedText: string;
  detectedLanguage?: string;
  confidence?: number;
}

export interface RewriteResult {
  rewrittenText: string;
  improvements: string[];
  readabilityScore?: number;
}

export interface ProofreadResult {
  correctedText: string;
  errors: ProofreadError[];
  suggestions: string[];
}

export interface ProofreadError {
  type: 'grammar' | 'spelling' | 'clarity';
  original: string;
  suggestion: string;
  position: { start: number; end: number };
  severity: 'low' | 'medium' | 'high';
}

// Chrome Built-in AI API types (future implementation)
export interface ChromeAI {
  summarizer?: {
    create(options?: any): Promise<any>;
  };
  translator?: {
    create(options?: any): Promise<any>;
  };
  rewriter?: {
    create(options?: any): Promise<any>;
  };
  prompter?: {
    create(options?: any): Promise<any>;
  };
}

// Extend the global chrome object
declare global {
  interface Window {
    chrome?: {
      ai?: ChromeAI;
    };
    speechSynthesis: SpeechSynthesis;
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}