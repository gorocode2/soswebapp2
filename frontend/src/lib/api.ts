// 🦈 School of Sharks API Configuration
// Environment-aware API configuration for development and production

import { debugAPI } from './debug-api';

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  endpoints: {
    auth: {
      login: string;
      register: string;
      logout: string;
    };
    users: string;
    health: string;
    testDb: string;
  };
}

// Type definitions for API requests and responses
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  // Database field names for compatibility
  first_name?: string;
  last_name?: string;
  cycling_experience?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  weight_kg?: number;
  height_cm?: number;
  country?: string;
  city?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  database: {
    connected: boolean;
    host?: string;
    database?: string;
  };
}

// Get API base URL based on environment
const getApiBaseUrl = (): string => {
  // For production, always use HTTPS
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://soscycling.com/api';
  }
  
  // For development
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
};

// API Configuration
export const apiConfig: ApiConfig = {
  baseUrl: getApiBaseUrl(),
  timeout: 10000, // 10 seconds
  retries: 3,
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout'
    },
    users: '/users',
    health: '/health',
    testDb: '/test-db'
  }
};

// API Helper Functions
export const api = {
  // Build full URL for endpoint
  url: (endpoint: string): string => {
    const cleanBaseUrl = apiConfig.baseUrl.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    return `${cleanBaseUrl}/${cleanEndpoint}`;
  },

  // Common headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // Request with retry logic
  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = api.url(endpoint);
    let lastError: Error = new Error('No attempts made');

    // Debug logging
    debugAPI.logRequest(endpoint, {
      url,
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body ? JSON.parse(options.body as string) : undefined
    });

    for (let attempt = 1; attempt <= apiConfig.retries; attempt++) {
      try {
        console.log(`🦈 API Request (attempt ${attempt}):`, url);
        
        const response = await fetch(url, {
          ...options,
          headers: {
            ...api.headers,
            ...options.headers,
          },
          signal: AbortSignal.timeout(apiConfig.timeout),
        });

        const data = await response.json();
        
        // Enhanced debug logging
        debugAPI.logResponse(endpoint, {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          data: data
        });

        if (!response.ok) {
          console.error(`🚨 API Error ${response.status}:`, {
            url,
            status: response.status,
            statusText: response.statusText,
            data: data
          });
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${data.message || 'Unknown error'}`);
        }

        console.log(`✅ API Success:`, data);
        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`⚠️  API attempt ${attempt} failed:`, lastError.message);
        
        // Don't retry on the last attempt
        if (attempt === apiConfig.retries) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    console.error(`❌ All API attempts failed for ${url}:`, lastError);
    throw lastError;
  },

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return api.request<T>(endpoint, { method: 'GET' });
  },

  // POST request
  async post<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    return api.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  // PUT request
  async put<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    return api.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return api.request<T>(endpoint, { method: 'DELETE' });
  }
};

// Authentication API
export const authApi = {
  async login(email: string, password: string) {
    console.log('🦈 Login attempt for:', email);
    return api.post(apiConfig.endpoints.auth.login, { email, password });
  },

  async register(userData: RegisterRequest) {
    console.log('🦈 Registration attempt:', {
      email: userData.email,
      username: userData.username,
      hasFirstName: !!userData.firstName || !!userData.first_name,
      hasLastName: !!userData.lastName || !!userData.last_name,
      cycling_experience: userData.cycling_experience,
      apiUrl: apiConfig.baseUrl,
      endpoint: apiConfig.endpoints.auth.register
    });
    
    // Ensure we're using the database field names
    const registrationData = {
      email: userData.email,
      username: userData.username,
      password: userData.password,
      first_name: userData.firstName || userData.first_name || '',
      last_name: userData.lastName || userData.last_name || '',
      cycling_experience: userData.cycling_experience || 'beginner',
      weight_kg: userData.weight_kg,
      height_cm: userData.height_cm,
      country: userData.country,
      city: userData.city
    };

    console.log('🦈 Sending registration data:', {
      ...registrationData,
      password: '[HIDDEN]'
    });

    return api.post(apiConfig.endpoints.auth.register, registrationData);
  },

  async logout() {
    return api.post(apiConfig.endpoints.auth.logout);
  }
};

// Users API
export const usersApi = {
  async getUsers() {
    return api.get(apiConfig.endpoints.users);
  }
};

// Health Check API
export const healthApi = {
  async check() {
    return api.get(apiConfig.endpoints.health);
  },

  async testDatabase() {
    return api.get(apiConfig.endpoints.testDb);
  }
};

// Environment info
export const envInfo = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  apiUrl: apiConfig.baseUrl,
  debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'
};

console.log('🦈 API Configuration initialized:', {
  environment: process.env.NODE_ENV,
  apiUrl: apiConfig.baseUrl,
  debugMode: envInfo.debugMode
});
