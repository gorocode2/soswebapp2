'use client';

import { useState } from 'react';
import PageLayout from '../components/PageLayout';

export default function Videos() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Videos', icon: '🎥' },
    { id: 'technique', name: 'Technique', icon: '🚴‍♂️' },
    { id: 'training', name: 'Training', icon: '💪' },
    { id: 'nutrition', name: 'Nutrition', icon: '🥗' },
    { id: 'maintenance', name: 'Bike Care', icon: '🔧' },
  ];

  const videos = [
    {
      id: 1,
      title: 'Perfect Cycling Posture',
      category: 'technique',
      duration: '12:34',
      thumbnail: '🚴‍♂️',
      description: 'Learn the fundamentals of proper cycling posture for maximum efficiency and comfort.',
      level: 'Beginner',
      views: '15.2K'
    },
    {
      id: 2,
      title: 'High-Intensity Interval Training',
      category: 'training',
      duration: '25:45',
      thumbnail: '⚡',
      description: 'Master HIIT techniques to boost your power and endurance capabilities.',
      level: 'Advanced',
      views: '8.7K'
    },
    {
      id: 3,
      title: 'Pre-Ride Nutrition Guide',
      category: 'nutrition',
      duration: '8:12',
      thumbnail: '🍌',
      description: 'Optimal fueling strategies for peak performance during your rides.',
      level: 'Intermediate',
      views: '12.1K'
    },
    {
      id: 4,
      title: 'Cornering Techniques',
      category: 'technique',
      duration: '15:23',
      thumbnail: '🌪️',
      description: 'Advanced cornering skills for better speed and safety on turns.',
      level: 'Intermediate',
      views: '9.8K'
    },
    {
      id: 5,
      title: 'Chain Maintenance 101',
      category: 'maintenance',
      duration: '18:56',
      thumbnail: '⛓️',
      description: 'Keep your drivetrain running smooth with proper chain care techniques.',
      level: 'Beginner',
      views: '22.3K'
    },
    {
      id: 6,
      title: 'Climbing Like a Pro',
      category: 'technique',
      duration: '20:17',
      thumbnail: '⛰️',
      description: 'Techniques and strategies for conquering steep climbs efficiently.',
      level: 'Advanced',
      views: '11.5K'
    },
  ];

  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-500/20 text-green-400';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'Advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <PageLayout title="Training Videos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Featured Video */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">🌟 Featured This Week</h2>
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl p-6 border border-blue-500/20">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Aerodynamic Positioning</h3>
                <p className="text-slate-300 mb-4">
                  Master the art of aerodynamic positioning to cut through wind resistance 
                  and maximize your speed potential.
                </p>
                <div className="flex gap-4 text-sm text-slate-400 mb-4">
                  <span>🕒 22:15</span>
                  <span>📊 Advanced</span>
                  <span>👁️ 45.2K views</span>
                </div>
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
                  ▶️ Watch Now
                </button>
              </div>
              <div className="text-center">
                <div className="text-8xl mb-4">🏎️</div>
                <div className="text-slate-300">Premium Content</div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">📚 Browse by Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Video Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">
              {selectedCategory === 'all' ? 'All Videos' : categories.find(c => c.id === selectedCategory)?.name}
            </h3>
            <div className="text-slate-400">
              {filteredVideos.length} videos
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                {/* Video Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center relative group cursor-pointer">
                  <div className="text-6xl">{video.thumbnail}</div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <span className="text-2xl">▶️</span>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {video.duration}
                  </div>
                </div>
                
                {/* Video Info */}
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                    {video.title}
                  </h4>
                  <p className="text-slate-300 text-sm mb-3 line-clamp-2">
                    {video.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className={`px-2 py-1 rounded text-xs ${getLevelColor(video.level)}`}>
                      {video.level}
                    </span>
                    <span className="text-slate-400 text-sm">👁️ {video.views}</span>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 text-blue-400 border border-blue-500/30 font-medium py-2 rounded-lg transition-all duration-300">
                    Watch Video
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Path */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">🎯 Recommended Learning Path</h3>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="space-y-4">
              {[
                { step: 1, title: 'Basic Positioning', completed: true },
                { step: 2, title: 'Pedaling Technique', completed: true },
                { step: 3, title: 'Breathing & Rhythm', completed: false, current: true },
                { step: 4, title: 'Advanced Cornering', completed: false },
                { step: 5, title: 'Sprint Techniques', completed: false },
              ].map((item) => (
                <div key={item.step} className={`flex items-center gap-4 p-3 rounded-lg ${
                  item.current ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-slate-700/30'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    item.completed ? 'bg-green-500 text-white' :
                    item.current ? 'bg-blue-500 text-white' :
                    'bg-slate-600 text-slate-300'
                  }`}>
                    {item.completed ? '✓' : item.step}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      item.current ? 'text-blue-400' : 'text-white'
                    }`}>
                      {item.title}
                    </div>
                  </div>
                  {item.current && (
                    <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
