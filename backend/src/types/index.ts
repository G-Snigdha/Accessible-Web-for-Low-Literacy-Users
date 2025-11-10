// Base types
export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
  is_active: boolean;
  email_verified: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  font_size: 'small' | 'medium' | 'large' | 'extra-large';
  language: string;
  high_contrast: boolean;
  reduce_motion: boolean;
  dark_mode: boolean;
  tts_enabled: boolean;
  tts_speed: number;
  tts_voice: string | null;
  auto_simplify: boolean;
  reading_level_preference: 'elementary' | 'middle' | 'high' | 'auto';
  notification_preferences: NotificationPreferences;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  reading_reminders: boolean;
  progress_updates: boolean;
  new_features: boolean;
}

// Text Processing Types
export interface TextProcessingRequest {
  text: string;
  action: 'simplify' | 'translate' | 'rewrite' | 'proofread' | 'analyze';
  options?: ProcessingOptions;
  user_id?: string;
  session_id?: string;
}

export interface ProcessingOptions {
  target_language?: string;
  reading_level?: 'elementary' | 'middle' | 'high';
  level?: 'elementary' | 'middle' | 'high'; // Alternative naming for reading level
  source_language?: string;
  from?: string; // Source language code
  to?: string; // Target language code
  style?: 'formal' | 'casual' | 'professional' | 'creative';
  tone?: string;
  max_sentences?: number;
  preserve_meaning?: boolean;
  grammar?: boolean; // For proofreading
  spelling?: boolean; // For proofreading
  voice?: string; // For text-to-speech
  rate?: number; // For text-to-speech
  pitch?: number; // For text-to-speech
}

export interface TextProcessingResult {
  id: string;
  user_id: string | null;
  session_id: string;
  original_text: string;
  processed_text: string;
  action: string;
  options: ProcessingOptions;
  analysis: TextAnalysis;
  created_at: Date;
  processing_time_ms: number;
}

export interface TextAnalysis {
  reading_level: ReadingLevel;
  complexity_score: number;
  word_count: number;
  sentence_count: number;
  avg_sentence_length: number;
  difficult_words: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  language_detected: string;
  readability_scores: ReadabilityScores;
}

export interface ReadingLevel {
  grade: number;
  level: 'elementary' | 'middle' | 'high' | 'college' | 'graduate';
  description: string;
}

export interface ReadabilityScores {
  flesch_kincaid: number;
  flesch_reading_ease: number;
  gunning_fog: number;
  coleman_liau: number;
  automated_readability: number;
  avg_score: number;
}

// Reading Session Types
export interface ReadingSession {
  id: string;
  user_id: string | null;
  session_token: string;
  start_time: Date;
  end_time: Date | null;
  total_duration_seconds: number;
  texts_processed: number;
  words_read: number;
  actions_performed: SessionAction[];
  user_agent: string;
  ip_address: string;
  created_at: Date;
  updated_at: Date;
}

export interface SessionAction {
  action: string;
  timestamp: Date;
  text_length: number;
  processing_time_ms: number;
  success: boolean;
}

// Analytics Types
export interface UserAnalytics {
  user_id: string;
  date: Date;
  sessions_count: number;
  total_reading_time: number;
  words_processed: number;
  texts_simplified: number;
  texts_translated: number;
  texts_rewritten: number;
  texts_proofread: number;
  avg_complexity_score: number;
  preferred_actions: string[];
  improvement_metrics: ImprovementMetrics;
}

export interface ImprovementMetrics {
  reading_speed_wpm: number;
  comprehension_score: number;
  vocabulary_growth: number;
  complexity_tolerance: number;
  engagement_score: number;
}

// API Request/Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  request_id?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirm_password: string;
  preferences?: Partial<UserPreferences>;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
  refresh_token: string;
  expires_at: Date;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface RequestWithUser extends Request {
  user?: User;
  session?: ReadingSession;
}

// Database Types
export interface DatabaseConfig {
  path: string;
  backup_interval_hours: number;
  max_connections: number;
  query_timeout_ms: number;
}

// AI Service Types
export interface AIServiceConfig {
  provider: 'openai' | 'local' | 'fallback';
  api_key?: string;
  model: string;
  max_tokens: number;
  temperature: number;
  timeout_ms: number;
}

export interface AIPrompt {
  system: string;
  user: string;
  max_tokens?: number;
  temperature?: number;
}

// Cache Types
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  expires_at: Date;
  created_at: Date;
}

// Error Types
export interface AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;
  timestamp: Date;
  request_id?: string;
}

// Configuration Types
export interface AppConfig {
  port: number;
  environment: 'development' | 'production' | 'test';
  database: DatabaseConfig;
  ai: AIServiceConfig;
  security: SecurityConfig;
  logging: LoggingConfig;
}

export interface SecurityConfig {
  jwt_secret: string;
  jwt_expire: string;
  bcrypt_rounds: number;
  rate_limit: RateLimitConfig;
  cors: CorsConfig;
}

export interface RateLimitConfig {
  window_ms: number;
  max_requests: number;
  skip_successful_requests?: boolean;
}

export interface CorsConfig {
  origins: string[];
  methods: string[];
  allowed_headers: string[];
  credentials: boolean;
}

export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  file?: string;
  max_file_size: string;
  max_files: number;
}

// Utility Types
export type Timestamp = Date | string | number;
export type UUID = string;
export type JSONObject = Record<string, any>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Export all types for easier importing
export * from './express.js';