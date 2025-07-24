'use client';

import React from 'react';

// SVG Icon Components
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
  </svg>
);

interface WeeklyPlanItem {
  day: string;
  task: string;
}

interface DailyScheduleProps {
  weeklyPlan?: WeeklyPlanItem[];
  currentWeek?: number;
  onWeekChange?: (direction: 'prev' | 'next') => void;
  onTaskSelect?: (day: string, task: string) => void;
}

const defaultWeeklyPlan: WeeklyPlanItem[] = [
  { day: 'Monday', task: 'Leg Workout' },
  { day: 'Tuesday', task: 'Cardio Session' },
  { day: 'Wednesday', task: 'Upper Body' },
  { day: 'Thursday', task: 'Rest Day' },
  { day: 'Friday', task: 'Full Body' },
  { day: 'Saturday', task: 'Outdoor Ride' },
  { day: 'Sunday', task: 'Recovery' },
];

export default function DailySchedule({ 
  weeklyPlan = defaultWeeklyPlan,
  currentWeek = 1,
  onWeekChange,
  onTaskSelect 
}: DailyScheduleProps) {
  const handlePrevWeek = () => {
    onWeekChange?.('prev');
  };

  const handleNextWeek = () => {
    onWeekChange?.('next');
  };

  const handleTaskClick = (day: string, task: string) => {
    onTaskSelect?.(day, task);
  };

  return (
    <div>
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        Weekly Plan
      </h3>
      <div className="flex flex-wrap items-center justify-between gap-6 p-4">
        <div className="flex min-w-72 flex-1 flex-col gap-0.5">
          {/* Week Navigation */}
          <div className="flex items-center justify-between pb-4">
            <button onClick={handlePrevWeek}>
              <div className="text-white flex size-10 items-center justify-center hover:bg-slate-700/30 rounded-full transition-colors">
                <ArrowLeftIcon />
              </div>
            </button>
            <p className="text-white text-base font-bold leading-tight">
              Week {currentWeek}
            </p>
            <button onClick={handleNextWeek}>
              <div className="text-white flex size-10 items-center justify-center hover:bg-slate-700/30 rounded-full transition-colors">
                <ArrowRightIcon />
              </div>
            </button>
          </div>

          {/* Weekly Schedule */}
          <div className="space-y-3">
            {weeklyPlan.map((item, index) => (
              <button
                key={index}
                onClick={() => handleTaskClick(item.day, item.task)}
                className="w-full bg-[#374151] hover:bg-[#4B5563] transition-colors rounded-lg p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-white text-sm font-bold leading-tight">
                      {item.day}
                    </p>
                    <p className="text-[#9CA3AF] text-sm font-normal leading-normal">
                      {item.task}
                    </p>
                  </div>
                  <div className="text-white opacity-50">
                    <ArrowRightIcon />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
