// Backend API Configuration
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3001/api';
/**
 * API Client for backend communication
 */
export class BackendApiClient {
    constructor(baseUrl = API_BASE_URL) {
        this.token = null;
        this.baseUrl = baseUrl;
        this.token = localStorage.getItem('auth_token');
    }
    /**
     * Set authentication token
     */
    setToken(token) {
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
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };
        // Add authorization header if token is available
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        const config = {
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
        }
        catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }
    /**
     * Process text using backend AI services
     */
    async processText(request) {
        return this.request('/text/process', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }
    /**
     * Analyze text readability without processing
     */
    async analyzeText(text) {
        return this.request('/text/analyze', {
            method: 'POST',
            body: JSON.stringify({ text }),
        });
    }
    /**
     * Get user settings (works for both authenticated and anonymous users)
     */
    async getSettings() {
        return this.request('/settings');
    }
    /**
     * Update user settings (requires authentication)
     */
    async updateSettings(settings) {
        return this.request('/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    }
    /**
     * Register new user
     */
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }
    /**
     * Login user
     */
    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }
    /**
     * Get current user profile
     */
    async getProfile() {
        return this.request('/auth/me');
    }
    /**
     * Get processing history
     */
    async getProcessingHistory(params) {
        const searchParams = new URLSearchParams();
        if (params?.page)
            searchParams.set('page', params.page.toString());
        if (params?.limit)
            searchParams.set('limit', params.limit.toString());
        if (params?.action)
            searchParams.set('action', params.action);
        return this.request(`/text/history?${searchParams.toString()}`);
    }
    /**
     * Get analytics dashboard data
     */
    async getDashboard() {
        return this.request('/analytics/dashboard');
    }
    /**
     * Check API health
     */
    async healthCheck() {
        return this.request('/health');
    }
}
// Export singleton instance
export const backendApi = new BackendApiClient();
