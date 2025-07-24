'use client';

import React from 'react';

// SVG Icon Components
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

interface MonthlyScheduleProps {
  currentDate?: Date;
  onDateSelect?: (date: number) => void;
  onMonthChange?: (direction: 'prev' | 'next') => void;
}

export default function MonthlySchedule({ 
  currentDate = new Date(),
  onDateSelect,
  onMonthChange 
}: MonthlyScheduleProps) {
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const month = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const today = new Date().getDate();
  const isCurrentMonth = 
    currentDate.getMonth() === new Date().getMonth() && 
    currentDate.getFullYear() === new Date().getFullYear();

  // Calculate the day of the week for the first day of the month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

  // Get the number of days in the current month
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    onMonthChange?.('prev');
  };

  const handleNextMonth = () => {
    onMonthChange?.('next');
  };

  const handleDateClick = (date: number) => {
    onDateSelect?.(date);
  };

  return (
    <div>
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        Monthly Plan
      </h3>
      <div className="flex flex-wrap items-center justify-center gap-6 p-4">
        <div className="flex min-w-72 max-w-[336px] flex-1 flex-col gap-0.5">
          {/* Month Navigation */}
          <div className="flex items-center p-1 justify-between">
            <button onClick={handlePrevMonth}>
              <div className="text-white flex size-10 items-center justify-center">
                <CaretLeftIcon />
              </div>
            </button>
            <p className="text-white text-base font-bold leading-tight flex-1 text-center">
              {month} {year}
            </p>
            <button onClick={handleNextMonth}>
              <div className="text-white flex size-10 items-center justify-center">
                <CaretRightIcon />
              </div>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {/* Day Headers */}
            {daysOfWeek.map((day, index) => (
              <p
                key={index}
                className="text-white text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5"
              >
                {day}
              </p>
            ))}

            {/* Empty cells for days before the 1st of the month */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}

            {/* Date cells */}
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => handleDateClick(date)}
                className="h-12 w-full text-white text-sm font-medium leading-normal hover:bg-slate-700/30 transition-colors"
              >
                <div
                  className={`flex size-full items-center justify-center rounded-full ${
                    isCurrentMonth && date === today ? 'bg-[#0c7ff2]' : ''
                  }`}
                >
                  {date}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
