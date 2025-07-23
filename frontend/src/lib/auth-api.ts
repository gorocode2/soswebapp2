import { User, RegisterData } from '../models/types';
import { debugAPI } from './debug-api';

const API_URL = debugAPI.getAPIUrl();

// Generic API response structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Specific data structure for auth responses
export interface AuthData {
  token: string;
  user: User;
}

// Specific response types for login and register
export type AuthResponse = ApiResponse<AuthData>;
export type RegisterResponse = ApiResponse<AuthData>;


async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  debugAPI.logRequest(endpoint, options.body);

  try {
    const response = await fetch(url, { ...options, headers });
    // The server sends back a structure that includes a 'data' property on success
    const responseData = await response.json();
    
    debugAPI.logResponse(endpoint, responseData);

    if (!response.ok) {
      return { success: false, error: responseData.message || 'An error occurred' };
    }
    // The actual payload is nested in responseData.data
    return { success: true, data: responseData.data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    debugAPI.logResponse(endpoint, { error: message });
    return { success: false, error: message };
  }
}

export const authApi = {
  login: (email: string, password: string): Promise<AuthResponse> => {
    return request<AuthData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  register: (userData: RegisterData): Promise<RegisterResponse> => {
    return request<AuthData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};
