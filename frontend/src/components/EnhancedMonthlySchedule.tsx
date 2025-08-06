/**
 * 🦈 Enhanced Monthly Schedule with Activities - School of Sharks AI Platform
 * Displays both workouts and activities in a monthly calendar view
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CalendarWorkout, MonthlyPlan } from '@/types/workout';
import { Activity } from '@/services/activitiesService';
import workoutService from '@/services/workoutService';
import activitiesService from '@/services/activitiesService';
import ActivityCalendarDay from '@/components/ActivityCalendarDay';

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

interface EnhancedMonthlyScheduleProps {
  userId?: number;
  currentDate?: Date;
  onDateSelect?: (date: number, activities: Activity[], workouts: CalendarWorkout[]) => void;
  onMonthChange?: (direction: 'prev' | 'next') => void;
}

export default function EnhancedMonthlySchedule({ 
  userId = 34, // Default to user 34 for testing
  currentDate = new Date(),
  onDateSelect,
  onMonthChange 
}: EnhancedMonthlyScheduleProps) {
  const [monthlyPlan, setMonthlyPlan] = useState<MonthlyPlan | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
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
  const startingDayOfWeek = originalDay === 0 ? 6 : originalDay - 1;

  // Get the number of days in the current month
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Load monthly workout plan and activities
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load workouts and activities in parallel
        const [workoutPlan, monthActivities] = await Promise.all([
          // Load workouts
          (async () => {
            workoutService.clearCache();
            return workoutService.getMonthlyPlan(
              userId,
              currentDate.getFullYear(),
              currentDate.getMonth() + 1
            );
          })(),
          // Load activities
          activitiesService.getActivitiesForMonth(
            userId, 
            currentDate.getFullYear(), 
            currentDate.getMonth() + 1
          )
        ]);
        
        if (isMounted) {
          setMonthlyPlan(workoutPlan);
          setActivities(monthActivities);
        }
      } catch (err) {
        console.error('🦈 Error loading monthly data:', err);
        if (isMounted) {
          setError('Failed to load monthly schedule');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(loadData, 50);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [userId, currentDate]);

  // Get workouts for a specific date
  const getWorkoutsForDate = useCallback((date: number): CalendarWorkout[] => {
    if (!monthlyPlan) return [];
    
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return monthlyPlan.workouts.filter(workout => {
      const workoutDate = typeof workout.date === 'string' 
        ? workout.date 
        : new Date(workout.date).toISOString().split('T')[0];
      return workoutDate === dateStr;
    });
  }, [monthlyPlan, currentDate]);

  // Get activities for a specific date
  const getActivitiesForDate = useCallback((date: number): Activity[] => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return activities.filter(activity => {
      const activityDate = activity.start_date_local.split('T')[0];
      return activityDate === dateStr;
    });
  }, [activities, currentDate]);

  const handleDateSelect = (date: number, dayActivities: Activity[], dayWorkouts: CalendarWorkout[]) => {
    onDateSelect?.(date, dayActivities, dayWorkouts);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    onMonthChange?.(direction);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-red-600">
          <div className="text-lg font-semibold mb-2">⚠️ Error Loading Schedule</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          🦈 <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {month} {year}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMonthChange('prev')}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <CaretLeftIcon />
          </button>
          <button
            onClick={() => handleMonthChange('next')}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <CaretRightIcon />
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before the first day of the month */}
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="min-h-[80px] border border-gray-100 opacity-30"></div>
        ))}

        {/* Days of the month */}
        {dates.map((date) => {
          const dayActivities = getActivitiesForDate(date);
          const dayWorkouts = getWorkoutsForDate(date);
          const isToday = isCurrentMonth && date === today;

          return (
            <ActivityCalendarDay
              key={date}
              date={date}
              activities={dayActivities}
              workouts={dayWorkouts}
              isToday={isToday}
              isCurrentMonth={true}
              onClick={handleDateSelect}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600">🚴 Cycling</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600">🏃 Running</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span className="text-gray-600">💪 Planned Workout</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-gray-600">✅ Completed Workout</span>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-blue-600">{activities.length}</span> activities this month
            {monthlyPlan && monthlyPlan.workouts.length > 0 && (
              <>
                {' • '}
                <span className="font-semibold text-purple-600">{monthlyPlan.workouts.length}</span> planned workouts
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
