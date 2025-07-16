'use client';

import { useState } from 'react';
import PageLayout from '../components/PageLayout';

export default function Workout() {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

  const weeklyWorkouts = [
    { day: 'Monday', workout: 'Rest Day', intensity: 'Rest', duration: '0 min', color: 'slate' },
    { day: 'Tuesday', workout: 'Interval Training', intensity: 'High', duration: '45 min', color: 'red' },
    { day: 'Wednesday', workout: 'Endurance Ride', intensity: 'Medium', duration: '90 min', color: 'blue' },
    { day: 'Thursday', workout: 'Recovery Spin', intensity: 'Low', duration: '30 min', color: 'green' },
    { day: 'Friday', workout: 'Tempo Training', intensity: 'High', duration: '60 min', color: 'orange' },
    { day: 'Saturday', workout: 'Hill Climbing', intensity: 'High', duration: '75 min', color: 'purple' },
    { day: 'Sunday', workout: 'Long Ride', intensity: 'Medium', duration: '120 min', color: 'indigo' },
  ];

  const monthlyOverview = [
    { week: 'Week 1', focus: 'Base Building', load: '8 hours', progress: 85 },
    { week: 'Week 2', focus: 'Intensity', load: '9 hours', progress: 92 },
    { week: 'Week 3', focus: 'Peak Training', load: '10 hours', progress: 78 },
    { week: 'Week 4', focus: 'Recovery', load: '6 hours', progress: 100 },
  ];

  return (
    <PageLayout title="Workout Schedule">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* View Toggle */}
        <div className="mb-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-2 border border-slate-700/50 inline-flex">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                viewMode === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              📅 Weekly View
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                viewMode === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              🗓️ Monthly View
            </button>
          </div>
        </div>

        {viewMode === 'weekly' ? (
          <>
            {/* Weekly Schedule */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">This Week's Training</h2>
                <div className="text-slate-300">
                  Week 2 of 4 • Peak Phase
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {weeklyWorkouts.map((workout, index) => (
                  <div
                    key={index}
                    className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 ${
                      workout.day === 'Tuesday' ? 'ring-2 ring-blue-500/30 bg-blue-500/5' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-white">{workout.day}</h3>
                      {workout.day === 'Tuesday' && (
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
                          Today
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-white font-medium mb-2">{workout.workout}</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Intensity:</span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          workout.intensity === 'High' ? 'bg-red-500/20 text-red-400' :
                          workout.intensity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          workout.intensity === 'Low' ? 'bg-green-500/20 text-green-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {workout.intensity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Duration:</span>
                        <span className="text-white">{workout.duration}</span>
                      </div>
                    </div>
                    
                    {workout.workout !== 'Rest Day' && (
                      <button className="w-full mt-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 text-blue-400 border border-blue-500/30 font-medium py-2 rounded-lg transition-all duration-300">
                        View Details
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Workout Details */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">🔥 Today's Session: Interval Training</h3>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Workout Structure</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-slate-700/50 rounded-lg">
                        <span className="text-slate-300">Warm-up</span>
                        <span className="text-white">10 min @ 60% FTP</span>
                      </div>
                      <div className="flex justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <span className="text-slate-300">Main Set</span>
                        <span className="text-white">6 x 3 min @ 105% FTP</span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-700/50 rounded-lg">
                        <span className="text-slate-300">Recovery</span>
                        <span className="text-white">2 min @ 50% FTP</span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-700/50 rounded-lg">
                        <span className="text-slate-300">Cool-down</span>
                        <span className="text-white">10 min @ 55% FTP</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Performance Targets</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Target Power:</span>
                        <span className="text-blue-400 font-semibold">280W</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Heart Rate Zone:</span>
                        <span className="text-red-400 font-semibold">Zone 4-5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cadence:</span>
                        <span className="text-yellow-400 font-semibold">90-95 RPM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Estimated TSS:</span>
                        <span className="text-green-400 font-semibold">85</span>
                      </div>
                    </div>
                    
                    <button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition-all duration-300">
                      Start Workout 🚀
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Monthly Overview */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Monthly Training Plan</h2>
                <div className="text-slate-300">
                  January 2025 • Peak Phase
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {monthlyOverview.map((week, index) => (
                  <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-white">{week.week}</h3>
                      <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                        {week.focus}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Training Load:</span>
                        <span className="text-white font-semibold">{week.load}</span>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-slate-400">Progress:</span>
                          <span className="text-blue-400 font-semibold">{week.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${week.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Stats */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">📊 Monthly Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-2xl font-bold text-blue-400">33h</div>
                  <div className="text-sm text-slate-300">Total Training</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-2xl font-bold text-green-400">24</div>
                  <div className="text-sm text-slate-300">Workouts</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-2xl font-bold text-yellow-400">856</div>
                  <div className="text-sm text-slate-300">TSS Points</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-2xl font-bold text-purple-400">92%</div>
                  <div className="text-sm text-slate-300">Compliance</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
