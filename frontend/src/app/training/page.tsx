'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '../components/PageLayout';

interface UserSession {
  user_id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  cycling_experience: string;
  apex_score: number;
  subscription_type: string;
}

export default function TrainingPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const userSession = localStorage.getItem('user_session');
    if (!userSession) {
      router.push('/auth?redirect=/training');
      return;
    }

    try {
      const userData = JSON.parse(userSession) as UserSession;
      setUser(userData);
    } catch (error) {
      console.error('Invalid session data:', error);
      router.push('/auth?redirect=/training');
      return;
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <PageLayout showBottomNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-2xl text-blue-400">🦈 Loading training modules...</div>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <PageLayout showBottomNav={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-blue-900 rounded-2xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🚴‍♂️ Training Center
          </h1>
          <p className="text-blue-200 text-lg">
            Welcome {user.first_name}! Ready to push your limits?
          </p>
          <div className="mt-4 text-sm text-slate-300">
            Experience Level: <span className="capitalize text-blue-400">{user.cycling_experience}</span> | 
            Current Apex Score: <span className="text-blue-400">{user.apex_score}/10</span>
          </div>
        </div>

        {/* Training Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">Interval Training</h3>
            <p className="text-slate-300 mb-4">High-intensity intervals to boost power and speed</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
              Start Session
            </button>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="text-4xl mb-4">🏔️</div>
            <h3 className="text-xl font-bold text-white mb-2">Hill Climb</h3>
            <p className="text-slate-300 mb-4">Conquer virtual mountains and build endurance</p>
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
              Start Climb
            </button>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-white mb-2">AI Coach</h3>
            <p className="text-slate-300 mb-4">Personalized training with AI guidance</p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
              Start AI Session
            </button>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="text-4xl mb-4">🌊</div>
            <h3 className="text-xl font-bold text-white mb-2">Recovery Ride</h3>
            <p className="text-slate-300 mb-4">Easy-paced recovery sessions</p>
            <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
              Start Recovery
            </button>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="text-4xl mb-4">🏁</div>
            <h3 className="text-xl font-bold text-white mb-2">Time Trial</h3>
            <p className="text-slate-300 mb-4">Test your speed against the clock</p>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
              Start TT
            </button>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-bold text-white mb-2">Virtual Racing</h3>
            <p className="text-slate-300 mb-4">Compete with other sharks worldwide</p>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
              Join Race
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">🔥 Today&apos;s Recommended Training</h2>
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Power Endurance Build</h3>
                <p className="text-slate-300 mt-2">
                  Based on your {user.cycling_experience} level and recent performance
                </p>
                <div className="mt-3 text-sm text-blue-400">
                  Duration: 60 min • Intensity: Moderate-Hard • Focus: Threshold Power
                </div>
              </div>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
                Start Now
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center">
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-slate-400 hover:text-white transition-colors duration-300"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
