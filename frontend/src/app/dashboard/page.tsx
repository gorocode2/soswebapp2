'use client';

import PageLayout from '../components/PageLayout';

export default function Dashboard() {
  return (
    <PageLayout title="Training Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl p-6 border border-blue-500/20">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back, Shark! 🦈</h2>
            <p className="text-slate-300">Ready to dominate today's training session?</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-blue-400">12</div>
            <div className="text-sm text-slate-300">Workouts This Week</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-blue-400">156km</div>
            <div className="text-sm text-slate-300">Distance This Month</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-blue-400">89%</div>
            <div className="text-sm text-slate-300">Goal Progress</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-blue-400">4.2</div>
            <div className="text-sm text-slate-300">Avg Performance</div>
          </div>
        </div>

        {/* Today's Workout */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">🚴‍♂️ Today's Training</h3>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white">Interval Power Training</h4>
                <p className="text-slate-300">High-intensity intervals to boost your power output</p>
              </div>
              <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                ⚡ High Intensity
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-slate-400">Duration</div>
                <div className="text-white font-semibold">45 min</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Target Power</div>
                <div className="text-white font-semibold">280W</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Calories</div>
                <div className="text-white font-semibold">~520</div>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition-all duration-300">
              Start Workout 🚀
            </button>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">📈 Weekly Progress</h3>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-300">Training Load</span>
              <span className="text-blue-400 font-semibold">+12% vs last week</span>
            </div>
            <div className="space-y-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="text-slate-400 w-8 text-sm">{day}</span>
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                      style={{ width: `${Math.random() * 80 + 20}%` }}
                    ></div>
                  </div>
                  <span className="text-slate-300 text-sm w-12">{Math.floor(Math.random() * 50 + 50)}min</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Workouts */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">📅 Upcoming Sessions</h3>
          <div className="space-y-4">
            {[
              { title: 'Endurance Ride', time: 'Tomorrow 7:00 AM', type: 'Endurance', duration: '90 min' },
              { title: 'Recovery Spin', time: 'Friday 6:00 PM', type: 'Recovery', duration: '30 min' },
              { title: 'Hill Climbing', time: 'Saturday 8:00 AM', type: 'Strength', duration: '60 min' },
            ].map((workout, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-semibold">{workout.title}</h4>
                    <p className="text-slate-400 text-sm">{workout.time}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-sm">
                      {workout.type}
                    </span>
                    <p className="text-slate-400 text-sm mt-1">{workout.duration}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
