'use client';

import React, { useState } from 'react';
import { debugAPI } from '@/lib/debug-api';
import { authApi, apiConfig, envInfo } from '@/lib/api';

interface TestResult {
  test: string;
  status: 'success' | 'failed' | 'pending';
  message: string;
  data?: any;
  timestamp: string;
}

export default function DebugPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: Omit<TestResult, 'timestamp'>) => {
    setTestResults(prev => [...prev, {
      ...result,
      timestamp: new Date().toISOString()
    }]);
  };

  const testAPIConnection = async () => {
    setIsRunning(true);
    setTestResults([]);

    const apiUrl = debugAPI.getAPIUrl();
    
    addResult({
      test: 'Environment Check',
      status: 'success',
      message: `Using API URL: ${apiUrl}`,
      data: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NODE_ENV: process.env.NODE_ENV,
        calculated_url: apiUrl,
        api_config: apiConfig,
        env_info: envInfo
      }
    });

    // Test 1: Health endpoint
    try {
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      
      addResult({
        test: 'Health Endpoint',
        status: response.ok ? 'success' : 'failed',
        message: response.ok ? '🦈 Health check successful' : 'Health check failed',
        data: { status: response.status, response: data }
      });
    } catch (error: any) {
      addResult({
        test: 'Health Endpoint',
        status: 'failed',
        message: `Connection failed: ${error.message}`,
        data: { error: error.message }
      });
    }

    // Test 2: API Health endpoint
    try {
      const response = await fetch(`${apiUrl}/api/health`);
      const data = await response.json();
      
      addResult({
        test: 'API Health Endpoint',
        status: response.ok ? 'success' : 'failed',
        message: response.ok ? '🦈 API health successful' : 'API health failed',
        data: { status: response.status, response: data }
      });
    } catch (error: any) {
      addResult({
        test: 'API Health Endpoint',
        status: 'failed',
        message: `API connection failed: ${error.message}`,
        data: { error: error.message }
      });
    }

    // Test 3: Database connection check
    try {
      const response = await fetch(`${apiUrl}/api/debug/database-status`);
      const data = await response.json();
      
      addResult({
        test: 'Database Connection',
        status: response.ok ? 'success' : 'failed',
        message: response.ok ? '🦈 Database connected' : 'Database connection failed',
        data: { status: response.status, response: data }
      });
    } catch (error: any) {
      addResult({
        test: 'Database Connection',
        status: 'failed',
        message: `Database check failed: ${error.message}`,
        data: { error: error.message }
      });
    }

    // Test 4: Test user creation with debug endpoint
    try {
      const response = await fetch(`${apiUrl}/api/debug/test-user-creation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      addResult({
        test: 'Direct User Creation',
        status: response.ok ? 'success' : 'failed',
        message: response.ok ? '🦈 Direct user creation successful!' : `Direct creation failed: ${data.message}`,
        data: { 
          status: response.status, 
          response: data
        }
      });
    } catch (error: any) {
      addResult({
        test: 'Direct User Creation',
        status: 'failed',
        message: `Direct creation error: ${error.message}`,
        data: { error: error.message }
      });
    }

    // Test 5: Test registration through auth API (like frontend does)
    try {
      const testUser = {
        email: `frontend.test.${Date.now()}@soscycling.com`,
        username: `frontend_user_${Date.now()}`,
        password: 'FrontendTest123!',
        firstName: 'Frontend',
        lastName: 'Tester',
        cycling_experience: 'intermediate' as const,
        weight_kg: 70,
        height_cm: 175,
        country: 'Debug Country',
        city: 'Debug City'
      };

      console.log('🦈 Frontend Debug: Testing registration through authApi...');
      const result = await authApi.register(testUser);
      
      addResult({
        test: 'Frontend Registration (authApi)',
        status: 'success',
        message: '🦈 Frontend registration successful!',
        data: { 
          request_data: { ...testUser, password: '[HIDDEN]' },
          response: result
        }
      });
    } catch (error: any) {
      addResult({
        test: 'Frontend Registration (authApi)',
        status: 'failed',
        message: `Frontend registration failed: ${error.message}`,
        data: { error: error.message }
      });
    }

    // Test 6: Test auth route behavior
    try {
      const testAuthData = {
        email: `auth.test.${Date.now()}@soscycling.com`,
        username: `auth_user_${Date.now()}`,
        password: 'AuthTest123!',
        first_name: 'Auth',
        last_name: 'Tester',
        cycling_experience: 'beginner'
      };

      const response = await fetch(`${apiUrl}/api/debug/test-auth-route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testAuthData)
      });

      const data = await response.json();
      
      addResult({
        test: 'Auth Route Test',
        status: response.ok ? 'success' : 'failed',
        message: response.ok ? '🦈 Auth route validation successful!' : `Auth route failed: ${data.message}`,
        data: { 
          status: response.status, 
          response: data,
          request_data: { ...testAuthData, password: '[HIDDEN]' }
        }
      });
    } catch (error: any) {
      addResult({
        test: 'Auth Route Test',
        status: 'failed',
        message: `Auth route error: ${error.message}`,
        data: { error: error.message }
      });
    }

    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-600 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🦈 School of Sharks Debug Console
          </h1>
          <p className="text-blue-100 text-lg">
            Unleash apex debugging power to track down signup issues
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
          <button
            onClick={testAPIConnection}
            disabled={isRunning}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            {isRunning ? '🔄 Running Debug Tests...' : '🚀 Test API Connection & Registration'}
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-4">🔍 Debug Results:</h3>
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.status === 'success'
                    ? 'bg-green-500/20 border-green-400'
                    : result.status === 'failed'
                    ? 'bg-red-500/20 border-red-400'
                    : 'bg-yellow-500/20 border-yellow-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{result.test}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/70">{result.timestamp}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      result.status === 'success' 
                        ? 'bg-green-600 text-white' 
                        : result.status === 'failed'
                        ? 'bg-red-600 text-white'
                        : 'bg-yellow-600 text-white'
                    }`}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <p className="text-white/90 text-sm mb-2">{result.message}</p>
                {result.data && (
                  <details className="mt-2">
                    <summary className="text-xs text-white/70 cursor-pointer hover:text-white">
                      📊 View Details
                    </summary>
                    <pre className="text-xs bg-black/20 p-2 rounded mt-2 overflow-auto text-white/80 max-h-96">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-yellow-500/20 border border-yellow-400 rounded-lg">
          <h4 className="font-semibold text-yellow-100 mb-2">🔍 Debugging Tips:</h4>
          <ul className="text-yellow-100/80 text-sm space-y-1">
            <li>• Check if your backend server is running on the correct port</li>
            <li>• Verify the API URL in your environment variables</li>
            <li>• Look for CORS issues in browser console</li>
            <li>• Check database connection and permissions</li>
            <li>• Compare successful test script vs web signup flow</li>
            <li>• Check if debug routes are enabled in backend</li>
            <li>• Verify database field names match between frontend and backend</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
