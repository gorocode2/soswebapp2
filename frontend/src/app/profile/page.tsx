'use client';

import { useState } from 'react';
import PageLayout from '../components/PageLayout';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
    { id: 'history', name: 'History', icon: '📊' },
    { id: 'goals', name: 'Goals', icon: '🎯' },
  ];

  const achievements = [
    { title: 'Century Rider', description: '100km in a single ride', earned: true, icon: '🏆' },
    { title: 'Speed Demon', description: 'Reached 50km/h average', earned: true, icon: '⚡' },
    { title: 'Consistency King', description: '30 days streak', earned: false, icon: '📅' },
    { title: 'Hill Crusher', description: '1000m elevation gain', earned: true, icon: '⛰️' },
  ];

  const recentActivities = [
    { date: '2025-01-15', type: 'Interval Training', duration: '45 min', distance: '28.5km' },
    { date: '2025-01-13', type: 'Endurance Ride', duration: '90 min', distance: '65.2km' },
    { date: '2025-01-11', type: 'Recovery Spin', duration: '30 min', distance: '15.8km' },
    { date: '2025-01-09', type: 'Hill Training', duration: '60 min', distance: '35.7km' },
  ];

  return (
    <PageLayout title="Profile">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Profile Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl p-6 border border-blue-500/20">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                  JS
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                  <span className="text-xs">🦈</span>
                </div>
              </div>
              
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">John Shark</h2>
                <p className="text-slate-300 mb-4">Apex Predator • Level 47</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-400">1,247km</div>
                    <div className="text-sm text-slate-400">Total Distance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">89</div>
                    <div className="text-sm text-slate-400">Workouts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-400">2,150</div>
                    <div className="text-sm text-slate-400">Total Hours</div>
                  </div>
                </div>
              </div>
              
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-2 border border-slate-700/50 flex flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex-1 min-w-0 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="truncate">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            {/* Achievements */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">🏆 Achievements</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border ${
                      achievement.earned 
                        ? 'border-yellow-500/30 bg-yellow-500/5' 
                        : 'border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl ${achievement.earned ? 'grayscale-0' : 'grayscale'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          achievement.earned ? 'text-yellow-400' : 'text-slate-400'
                        }`}>
                          {achievement.title}
                        </h4>
                        <p className="text-slate-300 text-sm">{achievement.description}</p>
                      </div>
                      {achievement.earned && (
                        <div className="text-green-400">✓</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Chart */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">📈 Performance Trend</h3>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">+15%</div>
                    <div className="text-slate-300">Power Improvement</div>
                    <div className="text-sm text-slate-400">vs last month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">+8%</div>
                    <div className="text-slate-300">Endurance Gain</div>
                    <div className="text-sm text-slate-400">vs last month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">-2%</div>
                    <div className="text-slate-300">Body Fat</div>
                    <div className="text-sm text-slate-400">vs last month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue="John Shark" 
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Email</label>
                  <input 
                    type="email" 
                    defaultValue="john@sharkschool.com" 
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Weight (kg)</label>
                  <input 
                    type="number" 
                    defaultValue="75" 
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm mb-2">FTP (Watts)</label>
                  <input 
                    type="number" 
                    defaultValue="280" 
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Training Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Notifications</span>
                  <button className="bg-blue-600 w-12 h-6 rounded-full relative">
                    <div className="bg-white w-4 h-4 rounded-full absolute right-1 top-1"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Auto-sync workouts</span>
                  <button className="bg-blue-600 w-12 h-6 rounded-full relative">
                    <div className="bg-white w-4 h-4 rounded-full absolute right-1 top-1"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">AI Coaching</span>
                  <button className="bg-slate-600 w-12 h-6 rounded-full relative">
                    <div className="bg-white w-4 h-4 rounded-full absolute left-1 top-1"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">📊 Recent Activities</h3>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-medium">{activity.type}</h4>
                      <p className="text-slate-400 text-sm">{activity.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-400 font-semibold">{activity.distance}</div>
                      <div className="text-slate-400 text-sm">{activity.duration}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">🎯 Current Goals</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">Monthly Distance</span>
                    <span className="text-blue-400">156km / 200km</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">FTP Improvement</span>
                    <span className="text-green-400">280W / 300W</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '93%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">Weight Loss</span>
                    <span className="text-yellow-400">3kg / 5kg</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition-all duration-300">
              Set New Goal 🎯
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
