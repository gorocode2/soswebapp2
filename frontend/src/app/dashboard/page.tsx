'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '../components/BottomNavigation'; // Import the shared component

// Helper components for icons to keep the main component clean
const GearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"></path>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
  </svg>
);

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M232,64H208V56a16,16,0,0,0-16-16H64A16,16,0,0,0,48,56v8H24A16,16,0,0,0,8,80V96a40,40,0,0,0,40,40h3.65A80.13,80.13,0,0,0,120,191.61V216H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V191.58c31.94-3.23,58.44-25.64,68.08-55.58H208a40,40,0,0,0,40-40V80A16,16,0,0,0,232,64ZM48,120A24,24,0,0,1,24,96V80H48v32q0,4,.39,8Zm144-8.9c0,35.52-28.49,64.64-63.51,64.9H128a64,64,0,0,1-64-64V56H192ZM232,96a24,24,0,0,1-24,24h-.5a81.81,81.81,0,0,0,.5-8.9V80h24Z"></path>
  </svg>
);

export default function DashboardPage() {
  const { user, isLoading, isLoggedIn, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/auth?redirect=/dashboard');
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
    return (
      <div className="flex size-full min-h-screen flex-col bg-[#101a23] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <p className="text-white mt-4">Loading Dashboard...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // or a redirect component
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#101a23] dark justify-between group/design-root overflow-x-hidden">
      {/* Main Content */}
      <main className="flex-grow">
        {/* Header */}
        <div className="flex items-center bg-[#101a23] p-4 pb-2 justify-between">
          <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            School of Sharks
          </h1>
          <div className="flex items-center gap-4">
            <h1 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
              Hi, {user?.firstName || user?.username}
            </h1>
            <button onClick={logout} className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 bg-transparent text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
              <div className="text-white">
                <GearIcon />
              </div>
            </button>
          </div>
        </div>

        {/* Weekly Stats */}
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Weekly Stats</h2>
        <div className="flex flex-wrap gap-4 p-4">
          {/* These are placeholders. You would map over your data here. */}
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#314d68]">
            <p className="text-white text-base font-medium leading-normal">Total Ride Time</p>
            <p className="text-white tracking-light text-2xl font-bold leading-tight">5h 30m</p>
            <p className="text-[#0bda5b] text-base font-medium leading-normal">+10%</p>
          </div>
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#314d68]">
            <p className="text-white text-base font-medium leading-normal">Workouts Completed</p>
            <p className="text-white tracking-light text-2xl font-bold leading-tight">5 (80%)</p>
            <p className="text-[#0bda5b] text-base font-medium leading-normal">+5%</p>
          </div>
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#314d68]">
            <p className="text-white text-base font-medium leading-normal">FTP</p>
            <p className="text-white tracking-light text-2xl font-bold leading-tight">180w</p>
            <p className="text-[#0bda5b] text-base font-medium leading-normal">+15%</p>
          </div>
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#314d68]">
            <p className="text-white text-base font-medium leading-normal">Upcoming Workouts</p>
            <p className="text-white tracking-light text-2xl font-bold leading-tight">2</p>
            <p className="text-[#0bda5b] text-base font-medium leading-normal">+20%</p>
          </div>
        </div>

        {/* Heart Rate Zones */}
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <select className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border border-[#314d68] bg-[#182734] focus:border-[#314d68] h-14 placeholder:text-[#90aecb] p-[15px] text-base font-normal leading-normal">
              <option value="one">Heart Rate Zones</option>
              <option value="two">Power Zones</option>
              <option value="three">Speed Zones</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-4 px-4 py-6">
          <div className="flex min-w-72 flex-1 flex-col gap-2">
            <p className="text-white text-base font-medium leading-normal">Time in Zones</p>
            <div className="grid min-h-[180px] gap-x-4 gap-y-6 grid-cols-[auto_1fr] items-center py-3">
              {/* Placeholder data for heart rate zones */}
              <p className="text-[#90aecb] text-[13px] font-bold leading-normal tracking-[0.015em]">Zone 1 (10%)</p>
              <div className="h-full flex-1 bg-[#223649] rounded-full"><div className="bg-blue-500 h-full rounded-full" style={{ width: '30%' }}></div></div>
              <p className="text-[#90aecb] text-[13px] font-bold leading-normal tracking-[0.015em]">Zone 2 (20%)</p>
              <div className="h-full flex-1 bg-[#223649] rounded-full"><div className="bg-cyan-500 h-full rounded-full" style={{ width: '50%' }}></div></div>
              <p className="text-[#90aecb] text-[13px] font-bold leading-normal tracking-[0.015em]">Zone 3 (30%)</p>
              <div className="h-full flex-1 bg-[#223649] rounded-full"><div className="bg-green-500 h-full rounded-full" style={{ width: '50%' }}></div></div>
              <p className="text-[#90aecb] text-[13px] font-bold leading-normal tracking-[0.015em]">Zone 4 (25%)</p>
              <div className="h-full flex-1 bg-[#223649] rounded-full"><div className="bg-yellow-500 h-full rounded-full" style={{ width: '90%' }}></div></div>
              <p className="text-[#90aecb] text-[13px] font-bold leading-normal tracking-[0.015em]">Zone 5 (15%)</p>
              <div className="h-full flex-1 bg-[#223649] rounded-full"><div className="bg-red-500 h-full rounded-full" style={{ width: '20%' }}></div></div>
            </div>
          </div>
        </div>

        {/* Upcoming Workouts */}
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Upcoming Workouts</h2>
        <div className="flex items-center gap-4 bg-[#101a23] px-4 min-h-[72px] py-2">
          <div className="text-white flex items-center justify-center rounded-lg bg-[#223649] shrink-0 size-12"><ClockIcon /></div>
          <div className="flex flex-col justify-center">
            <p className="text-white text-base font-medium leading-normal line-clamp-1">Interval Training</p>
            <p className="text-[#90aecb] text-sm font-normal leading-normal line-clamp-2">60 min</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-[#101a23] px-4 min-h-[72px] py-2">
          <div className="text-white flex items-center justify-center rounded-lg bg-[#223649] shrink-0 size-12"><ClockIcon /></div>
          <div className="flex flex-col justify-center">
            <p className="text-white text-base font-medium leading-normal line-clamp-1">Recovery Ride</p>
            <p className="text-[#90aecb] text-sm font-normal leading-normal line-clamp-2">45 min</p>
          </div>
        </div>

        {/* Friend Activities */}
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Friend Activities</h2>
        <div className="flex items-center gap-4 bg-[#101a23] px-4 min-h-[72px] py-2">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-14 bg-gray-500"></div>
          <div className="flex flex-col justify-center">
            <p className="text-white text-base font-medium leading-normal line-clamp-1">Ethan</p>
            <p className="text-[#90aecb] text-sm font-normal leading-normal line-clamp-2">Completed a 30-mile ride</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-[#101a23] px-4 min-h-[72px] py-2">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-14 bg-gray-500"></div>
          <div className="flex flex-col justify-center">
            <p className="text-white text-base font-medium leading-normal line-clamp-1">Olivia</p>
            <p className="text-[#90aecb] text-sm font-normal leading-normal line-clamp-2">Joined the &apos;Hill Climb Challenge&apos;</p>
          </div>
        </div>

        {/* Group Challenges */}
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Group Challenges</h2>
        <div className="flex items-center gap-4 bg-[#101a23] px-4 min-h-[72px] py-2">
          <div className="text-white flex items-center justify-center rounded-lg bg-[#223649] shrink-0 size-12"><TrophyIcon /></div>
          <div className="flex flex-col justify-center">
            <p className="text-white text-base font-medium leading-normal line-clamp-1">Weekly Distance Challenge</p>
            <p className="text-[#90aecb] text-sm font-normal leading-normal line-clamp-2">Ride 100 miles this week</p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="sticky bottom-0">
        <BottomNavigation />
      </footer>
    </div>
  );
}