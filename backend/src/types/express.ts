import { Request } from 'express';
import { User, ReadingSession } from './index.js';

// Extend Express Request interface
export interface RequestWithUser extends Request {
  user?: User;
  session?: ReadingSession;
  request_id?: string;
}

// Extend Express Response interface for consistent API responses
export interface ApiRequest extends RequestWithUser {
  start_time: Date;
}

// Custom parameter types for routes
export interface UserParams {
  userId?: string;
}

export interface SessionParams {
  sessionId?: string;
}

export interface TextProcessingParams {
  processId?: string;
}

// Query parameter interfaces
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface TextProcessingQuery extends PaginationQuery {
  action?: string;
  language?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface AnalyticsQuery {
  start_date?: string;
  end_date?: string;
  granularity?: 'day' | 'week' | 'month';
  metric?: string;
}