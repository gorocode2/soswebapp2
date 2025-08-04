'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CalendarWorkout, MonthlyPlan } from '@/types/workout';
import workoutService from '@/services/workoutService';

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

interface WorkoutMonthlyScheduleProps {
  userId?: number;
  currentDate?: Date;
  onDateSelect?: (date: number, workouts: CalendarWorkout[]) => void;
  onMonthChange?: (direction: 'prev' | 'next') => void;
}

function WorkoutMonthlySchedule({ 
  userId = 34, // Default to user 34 for testing
  currentDate = new Date(),
  onDateSelect,
  onMonthChange 
}: WorkoutMonthlyScheduleProps) {
  const [monthlyPlan, setMonthlyPlan] = useState<MonthlyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const month = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const today = new Date().getDate();
  const isCurrentMonth = 
    currentDate.getMonth() === new Date().getMonth() && 
    currentDate.getFullYear() === new Date().getFullYear();

  // Calculate the day of the week for the first day of the month (Monday = 0)
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const originalDay = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.
  // Convert to Monday = 0, Tuesday = 1, ..., Sunday = 6
  const startingDayOfWeek = originalDay === 0 ? 6 : originalDay - 1;

  // Get the number of days in the current month
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Load monthly workout plan
  useEffect(() => {
    let isMounted = true;
    
    const loadMonthlyPlan = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Clear cache to ensure fresh data with timezone conversion
        workoutService.clearCache();
        
        const plan = await workoutService.getMonthlyPlan(
          userId,
          currentDate.getFullYear(),
          currentDate.getMonth() + 1
        );
        
        if (isMounted) {
          setMonthlyPlan(plan);
        }
      } catch (err) {
        console.error('Error loading monthly plan:', err);
        if (isMounted) {
          setError('Failed to load monthly schedule');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(loadMonthlyPlan, 50);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [userId, currentDate]);

  // Get workouts for a specific date - memoized for performance
  const getWorkoutsForDate = useCallback((date: number): CalendarWorkout[] => {
    if (!monthlyPlan) return [];
    
    // Create date string consistent with Bangkok timezone  
    // Use local date parts to avoid timezone conversion issues
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(date).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    return monthlyPlan.workouts.filter(workout => workout.date === dateString);
  }, [monthlyPlan, currentDate]);

  // Get workout status color
  const getWorkoutStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'in_progress': return 'bg-blue-500';
      case 'assigned': return 'bg-cyan-500';
      case 'skipped': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-cyan-500';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent': return 'ring-red-400';
      case 'high': return 'ring-orange-400';
      case 'normal': return 'ring-cyan-400';
      case 'low': return 'ring-gray-400';
      default: return 'ring-cyan-400';
    }
  };

  const handlePrevMonth = () => {
    onMonthChange?.('prev');
  };

  const handleNextMonth = () => {
    onMonthChange?.('next');
  };

  const handleDateClick = (date: number) => {
    const workouts = getWorkoutsForDate(date);
    onDateSelect?.(date, workouts);
  };

  if (loading) {
    return (
      <div className="flex flex-col p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
        <div className="text-red-400 text-center">
          <p className="text-lg font-semibold mb-2">❌ Error Loading Schedule</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-cyan-400 transition-colors"
        >
          <CaretLeftIcon />
        </button>
        
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">{month} {year}</h2>
          <p className="text-sm text-slate-400">
            {monthlyPlan?.workouts.length || 0} workouts scheduled
          </p>
        </div>
        
        <button
          onClick={handleNextMonth}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-cyan-400 transition-colors"
        >
          <CaretRightIcon />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {daysOfWeek.map((day, index) => (
          <div key={`day-header-${index}`} className="text-center text-sm font-semibold text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before the first day of the month */}
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square"></div>
        ))}
        
        {/* Calendar dates */}
        {dates.map((date) => {
          const workouts = getWorkoutsForDate(date);
          const isToday = isCurrentMonth && date === today;
          const hasWorkouts = workouts.length > 0;
          
          return (
            <button
              key={date}
              onClick={() => handleDateClick(date)}
              className={`
                aspect-square relative p-1 text-sm font-medium rounded-lg transition-all duration-200
                ${hasWorkouts 
                  ? 'bg-slate-700 hover:bg-slate-600 text-white border border-cyan-500/50' 
                  : 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-400'
                }
                ${isToday ? 'ring-2 ring-cyan-400' : ''}
                ${hasWorkouts ? 'hover:scale-105' : ''}
              `}
            >
              <span className="block mb-1">{date}</span>
              
              {/* Workout indicators */}
              {hasWorkouts && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {workouts.slice(0, 3).map((workout) => (
                    <div
                      key={workout.assignment_id}
                      className={`
                        w-2 h-2 rounded-full
                        ${getWorkoutStatusColor(workout.status)}
                        ${getPriorityColor(workout.priority)}
                        ring-1
                      `}
                      title={`${workout.name} (${workout.type})`}
                    />
                  ))}
                  {workouts.length > 3 && (
                    <div className="w-2 h-2 rounded-full bg-slate-500 text-[8px] flex items-center justify-center text-white">
                      +
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-slate-400">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-400">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            <span className="text-slate-400">Assigned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-slate-400">Skipped</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(WorkoutMonthlySchedule);
