// Development testing utility for bypassing authentication
// This should ONLY be used in development/testing environments

export const DEV_TEST_USER = {
  id: 1,
  uuid: '12345678-1234-5678-9012-123456789012',
  email: 'testing@only.com',
  username: 'testcoach',
  firstName: 'Test',
  lastName: 'Coach',
  fitnessLevel: 'intermediate' as const,
  createdAt: new Date().toISOString(),
};

export const DEV_TEST_TOKEN = 'dev-test-token-12345';

// Function to programmatically set authentication for testing
export const setTestAuthentication = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem('sharks_auth_token', DEV_TEST_TOKEN);
    localStorage.setItem('sharks_user_data', JSON.stringify(DEV_TEST_USER));
    console.log('🦈 DEV: Test authentication set successfully');
    return true;
  } catch (error) {
    console.error('❌ DEV: Failed to set test authentication:', error);
    return false;
  }
};

// Function to clear test authentication
export const clearTestAuthentication = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('sharks_auth_token');
  localStorage.removeItem('sharks_user_data');
  console.log('🦈 DEV: Test authentication cleared');
};

// Function to check if test auth is set
export const isTestAuthSet = () => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('sharks_auth_token');
  const userData = localStorage.getItem('sharks_user_data');
  
  return token === DEV_TEST_TOKEN && userData !== null;
};
