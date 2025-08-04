'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterData } from '@/models/types';

// Define a more specific type for the form state, excluding fields that are not part of the form
type RegisterFormState = Omit<RegisterData, 'id' | 'uuid' | 'createdAt'> & {
  confirmPassword?: string;
};

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  
  const { login, register, isLoggedIn, isLoading: isAuthLoading } = useAuth();

  const [isLoginView, setIsLoginView] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if user is already logged in
  useEffect(() => {
    if (!isAuthLoading && isLoggedIn) {
      router.push(redirectPath);
    }
  }, [isAuthLoading, isLoggedIn, router, redirectPath]);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState<RegisterFormState>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    fitnessLevel: 'beginner',
    is_coach: false, // Default to false for regular users
  });

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    const result = await login(loginData.email, loginData.password);

    if (result.success) {
      setSuccess('🦈 Welcome back! Redirecting...');
      // The useEffect will handle the redirect
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  // Handle register form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (registerData.password && registerData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setIsSubmitting(true);
    const result = await register(registerData);

    if (result.success) {
      setSuccess('🦈 Account created! Welcome. Redirecting...');
      // The useEffect will handle the redirect
    } else {
      setError(result.error || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // While checking auth or submitting, show a loading screen
  if (isAuthLoading) {
    return (
       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-300">🦈 Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              School of Sharks 🦈
            </h1>
          </Link>
          <p className="text-slate-300 mt-2">
            {isLoginView ? 'Welcome back, apex predator!' : 'Join the apex cycling community!'}
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="flex bg-slate-700/50 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setIsLoginView(true); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${isLoginView ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:text-white'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLoginView(false); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${!isLoginView ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">{success}</div>}

          {isLoginView ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? 'Logging in...' : '🦈 Login & Dominate'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-2">First Name *</label>
                  <input
                    type="text" required value={registerData.firstName}
                    onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Last Name *</label>
                  <input
                    type="text" required value={registerData.lastName}
                    onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-2">Email Address *</label>
                <input
                  type="email" required value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-2">Username *</label>
                <input
                  type="text" required value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Password *</label>
                  <input
                    type="password" required value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Confirm Password *</label>
                  <input
                    type="password" required value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3 rounded-xl"
              >
                {isSubmitting ? 'Creating Account...' : '🦈 Join the Apex Pack'}
              </button>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-300">🦈 Loading authentication...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
