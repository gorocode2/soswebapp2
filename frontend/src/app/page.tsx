'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from './components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    // If auth state is loaded and user is logged in, redirect to dashboard
    if (!isLoading && isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isLoading, isLoggedIn, router]);

  // These handlers are now only for non-authenticated users,
  // as authenticated users will be redirected.
  const handleGetStarted = () => {
    router.push('/auth?redirect=/dashboard');
  };

  const handleViewAnalytics = () => {
    router.push('/auth?redirect=/analytics');
  };

  // While checking auth or if user is logged in, show a loading screen
  // to prevent flashing the homepage content before redirect.
  if (isLoading || isLoggedIn) {
    return (
      <PageLayout showBottomNav={false}>
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">🦈 Loading...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showBottomNav={false}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden pt-16 pb-16">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-indigo-900/30" />
          <div className="relative text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              🦈 <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">School of Sharks</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto">
              High-Tech AI Cycling Training Platform
            </p>
            <p className="text-lg text-slate-300 mb-12 max-w-2xl mx-auto">
              Unleash your inner predator with AI-powered cycling training. 
              Dominate the road with personalized workouts, real-time analytics, and adaptive coaching.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ring-2 ring-blue-500/20"
              >
                🚀 Go to Dashboard
              </button>
              <button 
                onClick={handleViewAnalytics}
                className="border-2 border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 hover:border-blue-600"
              >
                📊 View Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Cutting-Edge Training Features</h2>
            <p className="text-slate-300 text-lg">Powered by AI to maximize your cycling performance</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-white mb-4">AI Coach</h3>
              <p className="text-slate-300">
                Personal AI trainer that adapts to your performance, providing real-time feedback and optimization.
              </p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-2xl font-bold text-white mb-4">Performance Analytics</h3>
              <p className="text-slate-300">
                Advanced metrics and insights to track your progress and identify areas for improvement.
              </p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-white mb-4">Dynamic Workouts</h3>
              <p className="text-slate-300">
                Adaptive training programs that evolve with your fitness level and goals.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-slate-900/70 backdrop-blur-sm py-16 border-t border-slate-800">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">1000+</div>
              <div className="text-slate-300">Active Sharks</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">50K+</div>
              <div className="text-slate-300">Miles Conquered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">95%</div>
              <div className="text-slate-300">Goal Achievement</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">24/7</div>
              <div className="text-slate-300">AI Support</div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-slate-800 to-blue-900 py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Join the School? 🦈
            </h2>
            <p className="text-xl text-slate-200 mb-8">
              Transform your cycling performance with cutting-edge AI technology
            </p>
            <button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-12 rounded-full text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl ring-2 ring-blue-500/30"
            >
              🚀 Get Started Now
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
