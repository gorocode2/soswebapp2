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
  currentWeekStart?: Date; // New prop for highlighting current week
  onDateSelect?: (date: number, activities: Activity[], workouts: CalendarWorkout[]) => void;
  onMonthChange?: (direction: 'prev' | 'next') => void;
  onWeekChange?: (newWeekStart: Date) => void; // New prop for week navigation
  onActivityClick?: (activity: Activity) => void;
  onWorkoutClick?: (workout: CalendarWorkout) => void;
}

export default function EnhancedMonthlySchedule({ 
  userId = 34, // Default to user 34 for testing
  currentDate = new Date(),
  currentWeekStart,
  onDateSelect,
  onMonthChange,
  onWeekChange,
  onActivityClick,
  onWorkoutClick
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

  // Calculate which weeks to show based on current month boundaries
  const monthFirstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Check if first week should be shown (if Sunday is in current month)
  const firstWeekSunday = new Date(monthFirstDay);
  firstWeekSunday.setDate(monthFirstDay.getDate() - startingDayOfWeek);
  const showFirstWeek = firstWeekSunday.getMonth() === currentDate.getMonth();
  
  // Check if last week should be shown (if the last day of month is not the last day of its week)
  const lastDayOfWeek = monthLastDay.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const showLastWeek = lastDayOfWeek !== 6; // Show if last day is not Saturday (i.e., week continues to next month)
  
  // Calculate total weeks to show
  const totalWeeks = showFirstWeek && showLastWeek ? 6 : 
                     showFirstWeek || showLastWeek ? 5 : 4;
  const totalCells = totalWeeks * 7;
  
  // Generate overflow dates from previous month
  const previousMonthDates: Array<{ date: number; month: 'prev'; fullDate: Date }> = [];
  if (startingDayOfWeek > 0) {
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    const daysInPreviousMonth = previousMonth.getDate();
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = daysInPreviousMonth - i;
      const fullDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, date);
      previousMonthDates.push({
        date,
        month: 'prev',
        fullDate
      });
    }
  }

  // Generate overflow dates from next month
  const nextMonthDates: Array<{ date: number; month: 'next'; fullDate: Date }> = [];
  const remainingCells = totalCells - startingDayOfWeek - daysInMonth;
  
  for (let i = 1; i <= remainingCells; i++) {
    const fullDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
    nextMonthDates.push({
      date: i,
      month: 'next',
      fullDate
    });
  }

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



  // Get activities for a specific date (current month or overflow dates)
  const getActivitiesForDate = useCallback((date: number, monthOffset: number = 0): Activity[] => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, date);
    const dateStr = formatLocalDate(targetDate);
    
    const filteredActivities = activities.filter(activity => {
      // Handle both old format (UTC ISO string) and new format (local time string)
      let activityDate: string;
      if (activity.start_date_local.endsWith('Z') || activity.start_date_local.includes('.000Z')) {
        // Old format: UTC ISO string like "2025-08-06T22:32:44.000Z"
        const d = new Date(activity.start_date_local);
        activityDate = formatLocalDate(d); // Use same method as weekly calendar
      } else {
        // New format: local time string like "2025-08-06T10:14:46"
        activityDate = activity.start_date_local.split('T')[0];
      }
      return activityDate === dateStr;
    });
    return filteredActivities;
  }, [activities, currentDate]);

  // Get workouts for a specific date (current month or overflow dates)
  const getWorkoutsForDate = useCallback((date: number, monthOffset: number = 0): CalendarWorkout[] => {
    if (!monthlyPlan) return [];
    
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, date);
    const dateStr = formatLocalDate(targetDate);
    
    const filteredWorkouts = monthlyPlan.workouts.filter(workout => {
      const workoutDate = typeof workout.date === 'string' 
        ? workout.date 
        : new Date(workout.date).toISOString().split('T')[0];
      return workoutDate === dateStr;
    });
    return filteredWorkouts;
  }, [monthlyPlan, currentDate]);

  // Helper to format date as YYYY-MM-DD in local time (same as weekly calendar)
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to get Monday of a given date
  const getMondayOfWeek = (date: Date): Date => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days; otherwise go back (dayOfWeek - 1) days
    const monday = new Date(date);
    monday.setDate(date.getDate() - daysToMonday);
    return monday;
  };

  // Check if a day is in the current highlighted week
  const isInCurrentWeek = (date: number, monthOffset: number = 0): boolean => {
    if (!currentWeekStart) return false;
    
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, date);
    const weekStart = new Date(currentWeekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return dayDate >= weekStart && dayDate <= weekEnd;
  };

  const handleDateSelect = (date: number, dayActivities: Activity[], dayWorkouts: CalendarWorkout[]) => {
    // Update week view to show the week containing this date
    if (onWeekChange) {
      const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
      const newWeekStart = getMondayOfWeek(clickedDate);
      onWeekChange(newWeekStart);
    }
    
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
    <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {month} {year}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMonthChange('prev')}
            className="p-2 text-gray-200 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <CaretLeftIcon />
          </button>
          <button
            onClick={() => handleMonthChange('next')}
            className="p-2 text-gray-200 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <CaretRightIcon />
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map((day, index) => (
          <div key={`day-${index}`} className="text-center text-sm font-semibold text-gray-300 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Previous month overflow dates */}
        {previousMonthDates.map(({ date, month, fullDate }, index) => {
          const dayActivities = getActivitiesForDate(date, -1);
          const dayWorkouts = getWorkoutsForDate(date, -1);
          const isToday = fullDate.toDateString() === new Date().toDateString();

          return (
            <ActivityCalendarDay
              key={`prev-${date}`}
              date={date}
              activities={dayActivities}
              workouts={dayWorkouts}
              isToday={isToday}
              isCurrentMonth={false}
              isInCurrentWeek={isInCurrentWeek(date, -1)}
              onClick={() => {}} // No action for overflow dates
              onActivityClick={onActivityClick}
              onWorkoutClick={onWorkoutClick}
            />
          );
        })}

        {/* Days of the current month */}
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
              isInCurrentWeek={isInCurrentWeek(date, 0)}
              onClick={handleDateSelect}
              onActivityClick={onActivityClick}
              onWorkoutClick={onWorkoutClick}
            />
          );
        })}

        {/* Next month overflow dates */}
        {nextMonthDates.map(({ date, month, fullDate }, index) => {
          const dayActivities = getActivitiesForDate(date, 1);
          const dayWorkouts = getWorkoutsForDate(date, 1);
          const isToday = fullDate.toDateString() === new Date().toDateString();

          return (
            <ActivityCalendarDay
              key={`next-${date}`}
              date={date}
              activities={dayActivities}
              workouts={dayWorkouts}
              isToday={isToday}
              isCurrentMonth={false}
              isInCurrentWeek={isInCurrentWeek(date, 1)}
              onClick={() => {}} // No action for overflow dates
              onActivityClick={onActivityClick}
              onWorkoutClick={onWorkoutClick}
            />
          );
        })}
      </div>

      {/* Summary stats */}
      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-sm text-gray-300">
            <span className="font-semibold text-blue-400">{activities.length}</span> activities this month
            {monthlyPlan && monthlyPlan.workouts.length > 0 && (
              <>
                {' • '}
                <span className="font-semibold text-purple-400">{monthlyPlan.workouts.length}</span> planned workouts
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
