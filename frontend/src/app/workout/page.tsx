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
              📊 Monthly View
            </button>
          </div>
        </div>

        {/* Training Overview */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">🦈 Apex Training Schedule</h2>
            <p className="text-blue-100">Unleash your predatory performance with structured training</p>
          </div>
        </div>

        {viewMode === 'weekly' ? (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">This Week&apos;s Training Plan</h3>
            
            <div className="grid gap-4">
              {weeklyWorkouts.map((workout, workoutIndex) => (
                <div key={workoutIndex} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${
                        workout.color === 'red' ? 'bg-red-500' :
                        workout.color === 'blue' ? 'bg-blue-500' :
                        workout.color === 'green' ? 'bg-green-500' :
                        workout.color === 'orange' ? 'bg-orange-500' :
                        workout.color === 'purple' ? 'bg-purple-500' :
                        workout.color === 'indigo' ? 'bg-indigo-500' :
                        'bg-slate-500'
                      }`} />
                      <div>
                        <h4 className="text-lg font-semibold text-white">{workout.day}</h4>
                        <p className="text-slate-300">{workout.workout}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{workout.duration}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        workout.intensity === 'High' ? 'bg-red-500/20 text-red-400' :
                        workout.intensity === 'Medium' ? 'bg-orange-500/20 text-orange-400' :
                        workout.intensity === 'Low' ? 'bg-green-500/20 text-green-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {workout.intensity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Training Compliance */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h4 className="text-xl font-bold text-white mb-4">📈 Weekly Progress</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400 mb-1">6/7</div>
                  <div className="text-slate-300 text-sm">Sessions Complete</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400 mb-1">405</div>
                  <div className="text-slate-300 text-sm">Total Minutes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400 mb-1">286W</div>
                  <div className="text-slate-300 text-sm">Avg Power</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400 mb-1">94%</div>
                  <div className="text-slate-300 text-sm">Compliance</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Monthly Training Overview</h3>
            
            <div className="grid gap-4">
              {monthlyOverview.map((week, weekIndex) => (
                <div key={weekIndex} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{week.week}</h4>
                      <p className="text-slate-300">{week.focus}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{week.load}</p>
                      <p className="text-slate-400 text-sm">Training Load</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${week.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-blue-400 font-medium">{week.progress}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Monthly Summary */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h4 className="text-xl font-bold text-white mb-4">🏆 Monthly Performance Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400 mb-1">33</div>
                  <div className="text-slate-300 text-sm">Total Hours</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400 mb-1">28</div>
                  <div className="text-slate-300 text-sm">Sessions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400 mb-1">+12W</div>
                  <div className="text-slate-300 text-sm">FTP Gain</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400 mb-1">89%</div>
                  <div className="text-slate-300 text-sm">Monthly Goal</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}