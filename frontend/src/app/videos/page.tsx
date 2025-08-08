'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/app/components/Header';
import BottomNavigation from '@/app/components/BottomNavigation';
import YouTubeVideoPlayer from '@/components/YouTubeVideoPlayer';

// SVG Icon Components
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
  </svg>
);

const MagnifyingGlassIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
  </svg>
);

// Your YouTube Short
const youtubeVideos = [
  {
    id: 'youtube-1',
    title: 'SOS Training Tip - Cycling Technique',
    description: 'Quick cycling technique tip from School of Sharks',
    videoId: '_R0MPOCwnQQ',
    category: 'Training',
    isShort: true
  }
];

export default function VideosPage() {
  const { user, logout } = useAuth();
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#101a23] group/design-root overflow-x-hidden">
      <Header user={user} onLogout={logout} />
      <main className="flex-grow pb-20">
        <div className="flex items-center bg-[#101a23] p-4 pb-2 justify-between">
          <button className="text-white flex size-12 shrink-0 items-center">
            <ArrowLeftIcon />
          </button>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Video Library</h2>
        </div>
        
        {/* Search Bar */}
        <div className="px-4 py-3">
          <label className="flex flex-col min-w-40 h-12 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-[#90adcb] flex border-none bg-[#223649] items-center justify-center pl-4 rounded-l-lg border-r-0">
                <MagnifyingGlassIcon />
              </div>
              <input
                placeholder="Search"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-[#223649] focus:border-none h-full placeholder:text-[#90adcb] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </label>
        </div>

        {/* Your YouTube Short */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {youtubeVideos.map((video) => (
              <YouTubeVideoPlayer
                key={video.id}
                videoId={video.videoId}
                title={video.title}
                description={video.description}
                category={video.category}
                isShort={video.isShort}
              />
            ))}
          </div>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
