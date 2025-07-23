import { debugAPI } from './debug-api';

const API_URL = debugAPI.getAPIUrl();

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  debugAPI.logRequest(endpoint, options.body);

  try {
    const response = await fetch(url, { ...options, headers });
    const responseData = await response.json();
    
    debugAPI.logResponse(endpoint, responseData);

    if (!response.ok) {
      return { success: false, error: responseData.message || 'An error occurred' };
    }
    return { success: true, data: responseData.data };
  } catch (error: any) {
    debugAPI.logResponse(endpoint, { error: error.message });
    return { success: false, error: error.message || 'Network error' };
  }
}

export const authApi = {
  login: (email: string, password: string) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  register: (userData: any) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};
