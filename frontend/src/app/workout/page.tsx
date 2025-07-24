'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/app/components/Header';
import BottomNavigation from '@/app/components/BottomNavigation';
import MonthlySchedule from '@/app/components/MonthlySchedule';
import DailySchedule from '@/app/components/DailySchedule';



export default function WorkoutPage() {
  const { user, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(1);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleWeekChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    } else if (direction === 'next') {
      setCurrentWeek(currentWeek + 1);
    }
  };

  const handleDateSelect = (date: number) => {
    console.log('Selected date:', date);
    // Add your date selection logic here
  };

  const handleTaskSelect = (day: string, task: string) => {
    console.log('Selected task:', day, task);
    // Add your task selection logic here
  };

  // Custom weekly plan for cycling workouts
  const cyclingWeeklyPlan = [
    { day: 'Monday', task: 'Interval Training' },
    { day: 'Tuesday', task: 'Endurance Ride' },
    { day: 'Wednesday', task: 'Rest Day' },
    { day: 'Thursday', task: 'Hill Repeats' },
    { day: 'Friday', task: 'Recovery Ride' },
    { day: 'Saturday', task: 'Long Ride' },
    { day: 'Sunday', task: 'Active Recovery' },
  ];

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header user={user} onLogout={logout} />
      
      <main className="layout-content-container flex flex-col flex-1">
        <MonthlySchedule 
          currentDate={currentDate}
          onDateSelect={handleDateSelect}
          onMonthChange={handleMonthChange}
        />

        <DailySchedule 
          weeklyPlan={cyclingWeeklyPlan}
          currentWeek={currentWeek}
          onWeekChange={handleWeekChange}
          onTaskSelect={handleTaskSelect}
        />
      </main>
      
      <BottomNavigation />
    </div>
  );
}