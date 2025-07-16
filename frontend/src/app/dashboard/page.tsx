'use client';

import { useState } from 'react';
import PageLayout from '../components/PageLayout';

export default function Dashboard() {
  const [selectedMetric, setSelectedMetric] = useState<'power' | 'speed' | 'endurance'>('power');

  const stats = [
    { label: 'Training Hours', value: '127', change: '+12%', icon: '⏱️' },
    { label: 'Avg Power (W)', value: '285', change: '+8%', icon: '⚡' },
    { label: 'Max Speed', value: '48.2', change: '+5%', icon: '🚴‍♂️' },
    { label: 'Apex Score', value: '8.7', change: '+15%', icon: '🦈' },
  ];

  const recentWorkouts = [
    { date: '2025-07-15', type: 'Interval Training', duration: '45 min', intensity: 'High', power: '295W' },
    { date: '2025-07-14', type: 'Endurance Ride', duration: '90 min', intensity: 'Medium', power: '250W' },
    { date: '2025-07-13', type: 'Recovery Spin', duration: '30 min', intensity: 'Low', power: '180W' },
    { date: '2025-07-12', type: 'Hill Climbing', duration: '60 min', intensity: 'High', power: '310W' },
  ];

  return (
    <PageLayout title="Training Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Welcome back, Apex Cyclist! 🦈</h2>
            <p className="text-blue-100">Ready to unleash your predatory performance on the road?</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, statIndex) => (
            <div key={statIndex} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  stat.change.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-slate-300 text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Today&apos;s Training */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">🎯 Today&apos;s Apex Training</h3>
            <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-lg p-4 border border-blue-500/30">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-blue-400">Interval Training</h4>
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">High Intensity</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Duration:</span>
                  <p className="text-white font-medium">45 minutes</p>
                </div>
                <div>
                  <span className="text-slate-400">Target Power:</span>
                  <p className="text-white font-medium">290-320W</p>
                </div>
                <div>
                  <span className="text-slate-400">Intervals:</span>
                  <p className="text-white font-medium">8 x 3min</p>
                </div>
                <div>
                  <span className="text-slate-400">Recovery:</span>
                  <p className="text-white font-medium">2min each</p>
                </div>
              </div>
              <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                🚀 Start Workout
              </button>
            </div>
          </div>

          {/* Performance Chart Placeholder */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">📈 Weekly Performance</h3>
            <div className="space-y-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => {
                const intensity = [0.8, 0.6, 0.9, 0.4, 0.7, 0.95, 0.5][dayIndex];
                return (
                  <div key={day} className="flex items-center space-x-3">
                    <span className="text-slate-400 text-sm w-8">{day}</span>
                    <div className="flex-1 bg-slate-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          intensity > 0.8 ? 'bg-red-500' : 
                          intensity > 0.6 ? 'bg-orange-500' : 
                          intensity > 0.3 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${intensity * 100}%` }}
                      />
                    </div>
                    <span className="text-slate-300 text-sm w-12">{Math.round(intensity * 100)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">🏆 Recent Apex Sessions</h3>
          <div className="space-y-3">
            {recentWorkouts.map((workout, workoutIndex) => (
              <div key={workoutIndex} className="flex items-center justify-between py-3 px-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {workout.type.includes('Interval') ? '⚡' : 
                     workout.type.includes('Endurance') ? '🚴‍♂️' : 
                     workout.type.includes('Recovery') ? '🌊' : '⛰️'}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{workout.type}</h4>
                    <p className="text-sm text-slate-400">{workout.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <p className="text-slate-400">Duration</p>
                    <p className="text-white font-medium">{workout.duration}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400">Power</p>
                    <p className="text-white font-medium">{workout.power}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    workout.intensity === 'High' ? 'bg-red-500/20 text-red-400' :
                    workout.intensity === 'Medium' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {workout.intensity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageLayout>
  );
}