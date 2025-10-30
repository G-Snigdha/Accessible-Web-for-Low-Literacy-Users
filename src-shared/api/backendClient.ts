// Backend API Configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * API Client for backend communication
 */
export class BackendApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Set authentication token
   */
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add authorization header if token is available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Process text using backend AI services
   */
  async processText(request: {
    text: string;
    action: 'simplify' | 'translate' | 'rewrite' | 'proofread' | 'analyze';
    options?: {
      target_language?: string;
      reading_level?: 'elementary' | 'middle' | 'high';
      tone?: 'formal' | 'casual' | 'friendly';
      max_sentences?: number;
    };
  }) {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        original_text: string;
        processed_text: string;
        action: string;
        analysis: {
          reading_level: {
            grade: number;
            level: string;
            description: string;
          };
          complexity_score: number;
          word_count: number;
          sentence_count: number;
          difficult_words: string[];
          sentiment: 'positive' | 'neutral' | 'negative';
        };
        processing_time_ms: number;
      };
      message: string;
      timestamp: string;
    }>('/text/process', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Analyze text readability without processing
   */
  async analyzeText(text: string) {
    return this.request<{
      success: boolean;
      data: {
        reading_level: {
          grade: number;
          level: string;
          description: string;
        };
        complexity_score: number;
        word_count: number;
        sentence_count: number;
        difficult_words: string[];
        sentiment: 'positive' | 'neutral' | 'negative';
        readability_scores: {
          flesch_kincaid: number;
          flesch_reading_ease: number;
          gunning_fog: number;
          avg_score: number;
        };
      };
    }>('/text/analyze', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  /**
   * Get user settings (works for both authenticated and anonymous users)
   */
  async getSettings() {
    return this.request<{
      success: boolean;
      data: {
        font_size: 'small' | 'medium' | 'large' | 'extra-large';
        language: string;
        high_contrast: boolean;
        reduce_motion: boolean;
        dark_mode: boolean;
        tts_enabled: boolean;
        tts_speed: number;
        auto_simplify: boolean;
        reading_level_preference: 'elementary' | 'middle' | 'high' | 'auto';
      };
    }>('/settings');
  }

  /**
   * Update user settings (requires authentication)
   */
  async updateSettings(settings: Partial<{
    font_size: 'small' | 'medium' | 'large' | 'extra-large';
    language: string;
    high_contrast: boolean;
    reduce_motion: boolean;
    dark_mode: boolean;
    tts_enabled: boolean;
    tts_speed: number;
    auto_simplify: boolean;
    reading_level_preference: 'elementary' | 'middle' | 'high' | 'auto';
  }>) {
    return this.request<{
      success: boolean;
      data: any;
      message: string;
    }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  /**
   * Register new user
   */
  async register(userData: {
    email: string;
    username: string;
    password: string;
    confirm_password: string;
  }) {
    return this.request<{
      success: boolean;
      data: {
        user: {
          id: string;
          email: string;
          username: string;
        };
        token: string;
        expires_at: string;
      };
      message: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Login user
   */
  async login(credentials: {
    email: string;
    password: string;
    remember_me?: boolean;
  }) {
    return this.request<{
      success: boolean;
      data: {
        user: {
          id: string;
          email: string;
          username: string;
        };
        token: string;
        expires_at: string;
      };
      message: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  /**
   * Get current user profile
   */
  async getProfile() {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        email: string;
        username: string;
        created_at: string;
        preferences: any;
      };
    }>('/auth/me');
  }

  /**
   * Get processing history
   */
  async getProcessingHistory(params?: {
    page?: number;
    limit?: number;
    action?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.action) searchParams.set('action', params.action);

    return this.request<{
      success: boolean;
      data: Array<{
        id: string;
        original_text: string;
        processed_text: string;
        action: string;
        created_at: string;
        analysis: any;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        has_next: boolean;
        has_prev: boolean;
      };
    }>(`/text/history?${searchParams.toString()}`);
  }

  /**
   * Get analytics dashboard data
   */
  async getDashboard() {
    return this.request<{
      success: boolean;
      data: {
        reading_time_today: number;
        texts_processed_today: number;
        reading_level_progress: string;
        weekly_stats: {
          total_reading_time: number;
          texts_processed: number;
          most_used_feature: string;
        };
      };
    }>('/analytics/dashboard');
  }

  /**
   * Check API health
   */
  async healthCheck() {
    return this.request<{
      status: string;
      timestamp: string;
      uptime: number;
    }>('/health');
  }
}

// Export singleton instance
export const backendApi = new BackendApiClient();