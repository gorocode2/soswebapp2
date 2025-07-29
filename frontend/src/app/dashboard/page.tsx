'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import Header from '../components/Header';
import { ClockIcon, TrophyIcon } from '../components/icons';
import { useLanguage } from '../../i18n';

export default function DashboardPage() {
  const { user, isLoading, isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

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
      <main className="flex-grow pb-20">
        <Header user={user} onLogout={logout} />

    {/* Weekly Stats */}
    <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
      {t('dashboard.weeklyStats')}
    </h2>
    <div className="flex flex-wrap gap-4 p-4">
      {/* Total Ride Time Card */}
      <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#314d68] bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300">
        <p className="text-white text-base font-medium leading-normal">
          {t('dashboard.stats.totalRideTime')}
        </p>
        <p className="text-cyan-400 tracking-light text-2xl font-bold leading-tight">
          5{t('time.hours')} 30{t('time.minutes')}
        </p>
        <p className="text-[#0bda5b] text-base font-medium leading-normal">+10%</p>
      </div>

      {/* Workouts Completed Card */}
      <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#314d68] bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300">
        <p className="text-white text-base font-medium leading-normal">
          {t('dashboard.stats.workoutsCompleted')}
        </p>
        <p className="text-cyan-400 tracking-light text-2xl font-bold leading-tight">
          5 (80%)
        </p>
        <p className="text-[#0bda5b] text-base font-medium leading-normal">+5%</p>
      </div>

      {/* FTP Card */}
      <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#314d68] bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300">
        <p className="text-white text-base font-medium leading-normal">
          {t('dashboard.stats.ftp')}
        </p>
        <p className="text-cyan-400 tracking-light text-2xl font-bold leading-tight">
          180w
        </p>
        <p className="text-[#0bda5b] text-base font-medium leading-normal">+15%</p>
      </div>

      {/* Upcoming Workouts Card */}
      <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#314d68] bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300">
        <p className="text-white text-base font-medium leading-normal">
          {t('dashboard.stats.upcomingWorkouts')}
        </p>
        <p className="text-cyan-400 tracking-light text-2xl font-bold leading-tight">
          2
        </p>
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