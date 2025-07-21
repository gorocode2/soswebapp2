/**
 * 🦈 School of Sharks - API Debug Helper
 * Unleash debugging power to track down signup issues!
 */

export const debugAPI = {
  getAPIUrl: () => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    console.log('🔍 Frontend using API URL:', url);
    return url;
  },

  logRequest: (endpoint: string, data: any) => {
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
