/**
 * 🦈 School of Sharks - API Debug Helper
 * Unleash debugging power to track down signup issues!
 */

export const debugAPI = {
  getAPIUrl: () => {
    let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Force HTTPS in production environment
    if (process.env.NODE_ENV === 'production' && url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
      console.log('🔒 Forced HTTPS for production:', url);
    }
    
    return url;
  },

  showEnvironment: () => {
    console.log('🦈 Frontend Environment Variables:', {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE,
      NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS
    });
  },

  logRequest: (endpoint: string, data: any) => {
    debugAPI.showEnvironment(); // Show env vars with each request
    console.log('🦈 API Request:', {
      url: `${debugAPI.getAPIUrl()}${endpoint}`,
      timestamp: new Date().toISOString(),
      data: data
    });
  },

  logResponse: (endpoint: string, response: any) => {
    console.log('🦈 API Response:', {
      endpoint,
      timestamp: new Date().toISOString(),
      response
    });
  }
};
