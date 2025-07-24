'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/app/components/Header';
import BottomNavigation from '@/app/components/BottomNavigation';

// SVG Icon Components from the provided HTML
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
  </svg>
);

const CaretLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
  </svg>
);

const CaretRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
  </svg>
);

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const dates = Array.from({ length: 30 }, (_, i) => i + 1);

const weeklyPlan = [
    { day: 'Monday', task: 'Interval Training' },
    { day: 'Tuesday', task: 'Endurance Ride' },
    { day: 'Wednesday', task: 'Rest Day' },
    { day: 'Thursday', task: 'Hill Repeats' },
    { day: 'Friday', task: 'Recovery Ride' },
    { day: 'Saturday', task: 'Long Ride' },
    { day: 'Sunday', task: 'Active Recovery' },
];

export default function WorkoutPage() {
  const { user, logout } = useAuth();

  // Get the current month and year
  const currentDate = new Date();
  const month = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const today = currentDate.getDate();

  // Calculate the day of the week for the first day of the month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#101a23] group/design-root overflow-x-hidden">
      <Header user={user} onLogout={logout} />
      <main className="flex-grow pb-24">
        <div className="flex items-center bg-[#101a23] p-4 pb-2 justify-between">
          <button className="text-white flex size-12 shrink-0 items-center">
            <ArrowLeftIcon />
          </button>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Workout Schedule</h2>
        </div>
        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Monthly Plan</h3>
        <div className="flex flex-wrap items-center justify-center gap-6 p-4">
          <div className="flex min-w-72 max-w-[336px] flex-1 flex-col gap-0.5">
            <div className="flex items-center p-1 justify-between">
              <button>
                <div className="text-white flex size-10 items-center justify-center">
                  <CaretLeftIcon />
                </div>
              </button>
              <p className="text-white text-base font-bold leading-tight flex-1 text-center">{month} {year}</p>
              <button>
                <div className="text-white flex size-10 items-center justify-center">
                  <CaretRightIcon />
                </div>
              </button>
            </div>
            <div className="grid grid-cols-7">
              {daysOfWeek.map((day, index) => (
                <p key={index} className="text-white text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">{day}</p>
              ))}
              {/* Add empty divs for days before the 1st of the month */}
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} />
              ))}
              {dates.map((date) => (
                 <button key={date} className="h-12 w-full text-white text-sm font-medium leading-normal">
                    <div className={`flex size-full items-center justify-center rounded-full ${date === today ? 'bg-[#0c7ff2]' : ''}`}>
                        {date}
                    </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Weekly Plan</h3>
        {weeklyPlan.map((item, index) => (
            <div key={index} className="flex items-center gap-4 bg-[#101a23] px-4 min-h-[72px] py-2 justify-between">
                <div className="flex flex-col justify-center">
                    <p className="text-white text-base font-medium leading-normal line-clamp-1">{item.day}</p>
                    <p className="text-[#90adcb] text-sm font-normal leading-normal line-clamp-2">{item.task}</p>
                </div>
                <div className="shrink-0">
                    <button className="text-white flex size-7 items-center justify-center">
                        <ArrowRightIcon />
                    </button>
                </div>
            </div>
        ))}
      </main>
      <BottomNavigation />
    </div>
  );
}