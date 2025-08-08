/**
 * 🦈 Enhanced Weekly Schedule with Activities - School of Sharks AI Platform
 * Displays both workouts and activities in a weekly calendar view
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CalendarWorkout } from '@/types/workout';
import { Activity } from '@/services/activitiesService';
import workoutService from '@/services/workoutService';
import activitiesService from '@/services/activitiesService';

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

interface EnhancedWeeklyScheduleProps {
  userId?: number;
  currentWeekStart?: Date;
  onDateSelect?: (date: Date, activities: Activity[], workouts: CalendarWorkout[]) => void;
  onWeekChange?: (direction: 'prev' | 'next') => void;
}

export default function EnhancedWeeklySchedule({ 
  userId = 34,
  currentWeekStart = (() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days; otherwise go back (dayOfWeek - 1) days
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysToMonday);
    return monday;
  })(),
  onDateSelect,
  onWeekChange 
}: EnhancedWeeklyScheduleProps) {
  const [workouts, setWorkouts] = useState<CalendarWorkout[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = new Date();

  // Generate the week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  // Load weekly data
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Calculate week start and end dates
        const weekStart = new Date(currentWeekStart);
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        // Use local date strings for API calls
        const weekStartStr = formatLocalDate(weekStart);
        const weekEndStr = formatLocalDate(weekEnd);

        // Load workouts and activities in parallel
        const [weekAssignments, weekActivities] = await Promise.all([
          workoutService.getAssignmentsByDateRange(
            userId,
            weekStartStr,
            weekEndStr
          ),
          activitiesService.getActivitiesForWeek(userId, weekStartStr)
        ]);
        
        if (isMounted) {
          const workoutsFromAssignments: CalendarWorkout[] = weekAssignments.assignments?.map(assignment => ({
            id: assignment.id,
            assignment_id: assignment.id,
            date: assignment.scheduled_date,
            name: assignment.workout_name || 'Unnamed Workout',
            type: assignment.workout_training_type as 'threshold' | 'endurance' | 'tempo' | 'vo2max' | 'sprint' | 'recovery' || 'threshold',
            status: assignment.status === 'completed' ? 'completed' : 
                   assignment.status === 'in_progress' ? 'in_progress' :
                   assignment.status === 'cancelled' ? 'cancelled' : 'assigned',
            duration: assignment.workout_duration || 60,
            difficulty: assignment.workout_difficulty || 5,
            priority: assignment.priority || 'normal'
          })) || [];
          
          setWorkouts(workoutsFromAssignments);
          setActivities(weekActivities);
        }
      } catch (err) {
        console.error('🦈 Error loading weekly data:', err);
        if (isMounted) {
          setError('Failed to load weekly schedule');
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
  }, [userId, currentWeekStart]);

  // Helper to format date as YYYY-MM-DD in local time
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get workouts for a specific date
  const getWorkoutsForDate = useCallback((date: Date): CalendarWorkout[] => {
    const dateStr = date.toISOString().split('T')[0];
    return workouts.filter(workout => {
      const workoutDate = typeof workout.date === 'string' 
        ? workout.date 
        : new Date(workout.date).toISOString().split('T')[0];
      return workoutDate === dateStr;
    });
  }, [workouts]);

  // Get activities for a specific date
  const getActivitiesForDate = useCallback((date: Date): Activity[] => {
    const dateStr = formatLocalDate(date);
    
    const filtered = activities.filter(activity => {
      // Handle both old format (UTC ISO string) and new format (local time string)
      let activityDate: string;
      if (activity.start_date_local.endsWith('Z') || activity.start_date_local.includes('.000Z')) {
        // Old format: UTC ISO string like "2025-08-06T22:32:44.000Z"
        const d = new Date(activity.start_date_local);
        activityDate = formatLocalDate(d);
      } else {
        // New format: local time string like "2025-08-06T10:14:46"
        activityDate = activity.start_date_local.split('T')[0];
      }
      return activityDate === dateStr;
    });
    
    return filtered;
  }, [activities]);

  const handleDateSelect = (date: Date) => {
    const dayActivities = getActivitiesForDate(date);
    const dayWorkouts = getWorkoutsForDate(date);
    onDateSelect?.(date, dayActivities, dayWorkouts);
  };

  const handleWeekChange = (direction: 'prev' | 'next') => {
    onWeekChange?.(direction);
  };

  const isToday = (date: Date): boolean => {
    return date.toDateString() === today.toDateString();
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 rounded"></div>
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
            Week of {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleWeekChange('prev')}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <CaretLeftIcon />
          </button>
          <button
            onClick={() => handleWeekChange('next')}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <CaretRightIcon />
          </button>
        </div>
      </div>

      {/* Weekly grid */}
      <div className="space-y-4">
        {weekDates.map((date, index) => {
          const dayActivities = getActivitiesForDate(date);
          const dayWorkouts = getWorkoutsForDate(date);
          const isTodayDate = isToday(date);

          return (
            <div
              key={index}
              className={`
                flex flex-col sm:flex-row gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                ${isTodayDate ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'}
              `}
              onClick={() => handleDateSelect(date)}
            >
              {/* Day header - Fixed width on larger screens */}
              <div className="flex-shrink-0 w-full sm:w-40">
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  <div className={`text-lg font-semibold ${isTodayDate ? 'text-blue-600' : 'text-gray-800'}`}>
                    {daysOfWeek[index]}
                  </div>
                  <div className={`text-sm ${isTodayDate ? 'text-blue-600' : 'text-gray-600'}`}>
                    {date.getDate()}
                  </div>
                  {isTodayDate && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      Today
                    </span>
                  )}
                </div>
                {(dayActivities.length > 0 || dayWorkouts.length > 0) && (
                  <div className="text-xs text-gray-500">
                    {dayActivities.length > 0 && <span>{dayActivities.length} activities</span>}
                    {dayActivities.length > 0 && dayWorkouts.length > 0 && <span> • </span>}
                    {dayWorkouts.length > 0 && <span>{dayWorkouts.length} workouts</span>}
                  </div>
                )}
              </div>

              {/* Activities and Workouts - Flexible width */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {/* Activities */}
                  {dayActivities.map((activity, activityIndex) => (
                    <div
                      key={`activity-${activity.id}-${activityIndex}`}
                      className={`
                        text-xs px-2 py-1 rounded text-white
                        ${activitiesService.getActivityColor(activity.activity_type)}
                      `}
                      title={`${activity.name} - ${activitiesService.formatDuration(activity.elapsed_time || activity.moving_time)}`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[10px]">
                          {activitiesService.getActivityIcon(activity.activity_type)}
                        </span>
                        <span className="font-medium truncate">
                          {activity.name}
                        </span>
                      </div>
                      <div className="text-[10px] opacity-90">
                        {activitiesService.formatDuration(activity.elapsed_time || activity.moving_time)}
                        {activity.distance && ` • ${activitiesService.formatDistance(activity.distance)}`}
                        {activity.average_watts && ` • ${activity.average_watts}W`}
                      </div>
                    </div>
                  ))}

                  {/* Workouts */}
                  {dayWorkouts.map((workout, workoutIndex) => (
                    <div
                      key={`workout-${workout.id}-${workoutIndex}`}
                      className={`
                        text-xs px-2 py-1 rounded border
                        ${workout.status === 'completed' ? 'bg-green-100 border-green-300 text-green-700' :
                          workout.status === 'in_progress' ? 'bg-yellow-100 border-yellow-300 text-yellow-700' :
                          workout.status === 'cancelled' ? 'bg-red-100 border-red-300 text-red-700' :
                          'bg-blue-100 border-blue-300 text-blue-700'}
                      `}
                      title={`${workout.name} - ${workout.duration}min`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[10px]">💪</span>
                        <span className="font-medium truncate">
                          {workout.name}
                        </span>
                      </div>
                      <div className="text-[10px] opacity-90">
                        {workout.duration}min • {workout.type}
                      </div>
                    </div>
                  ))}

                  {/* Empty state */}
                  {dayActivities.length === 0 && dayWorkouts.length === 0 && (
                    <div className="text-xs text-gray-400 italic p-2">
                      No activities or workouts
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{activities.length}</div>
            <div className="text-gray-600">Activities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{workouts.length}</div>
            <div className="text-gray-600">Planned Workouts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {workouts.filter(w => w.status === 'completed').length}
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(activities.reduce((total, activity) => 
                total + (activity.elapsed_time || activity.moving_time || 0), 0) / 3600)}h
            </div>
            <div className="text-gray-600">Total Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
