'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CalendarWorkout, WeeklyPlan } from '@/types/workout';
import workoutService from '@/services/workoutService';

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

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="currentColor" viewBox="0 0 256 256">
    <path d="m232.4,114.49-176-112a16,16,0,0,0-16.75-.88A15.91,15.91,0,0,0,32,16V240a15.91,15.91,0,0,0,7.69,13.43A16.13,16.13,0,0,0,48,256a15.95,15.95,0,0,0,8.36-2.35l176-112a16,16,0,0,0,0-27Zm-176,112V32L224,128Z"></path>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="currentColor" viewBox="0 0 256 256">
    <path d="m229.66,77.66-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
  </svg>
);

interface WorkoutWeeklyScheduleProps {
  userId?: number;
  currentWeekStart?: Date;
  onWeekChange?: (direction: 'prev' | 'next') => void;
  onWorkoutSelect?: (workout: CalendarWorkout) => void;
  onWorkoutStart?: (workout: CalendarWorkout) => void;
}

function WorkoutWeeklySchedule({
  userId = 34,
  currentWeekStart = new Date(),
  onWeekChange,
  onWorkoutSelect,
  onWorkoutStart
}: WorkoutWeeklyScheduleProps) {
  console.log('🦈 WorkoutWeeklySchedule loaded for user:', userId);
  
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Calculate week dates - memoized to prevent recalculation
  const { start: weekStart, dates: weekDates } = useMemo(() => {
    return workoutService.getWeekDates(currentWeekStart);
  }, [currentWeekStart]);

  // Load weekly workout plan
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    
    const loadWeeklyPlan = async () => {
      try {
        // Clear cache to ensure fresh data with timezone conversion
        workoutService.clearCache();
        
        setLoading(true);
        setError(null);
        const plan = await workoutService.getWeeklyPlan(userId, weekStart);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setWeeklyPlan(plan);
        }
      } catch (err) {
        console.error('🦈 Error loading weekly plan:', err);
        if (isMounted) {
          setError('Failed to load weekly schedule');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Use a small delay to prevent rapid consecutive calls
    const timeoutId = setTimeout(loadWeeklyPlan, 50);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [userId, currentWeekStart, weekStart]); // Include weekStart as it's used in loadWeeklyPlan

  // Get workouts for a specific date - memoized for performance
  const getWorkoutsForDate = useCallback((date: Date): CalendarWorkout[] => {
    if (!weeklyPlan) return [];
    
    // Create date string consistent with Bangkok timezone
    // Use local date parts to avoid timezone conversion issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    return weeklyPlan.workouts.filter(workout => workout.date === dateString);
  }, [weeklyPlan]);

  // Get workout type color
  const getWorkoutTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'threshold': return 'bg-gradient-to-r from-orange-500 to-red-500';
      case 'vo2max': return 'bg-gradient-to-r from-red-500 to-pink-500';
      case 'zone2': case 'endurance': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'sprint': return 'bg-gradient-to-r from-purple-500 to-violet-500';
      case 'recovery': return 'bg-gradient-to-r from-blue-400 to-cyan-400';
      default: return 'bg-gradient-to-r from-slate-500 to-slate-600';
    }
  };

  // Get workout status icon and color
  const getWorkoutStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: <CheckIcon />, color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
      case 'in_progress':
        return { icon: <PlayIcon />, color: 'text-blue-400', bg: 'bg-blue-500/20' };
      case 'assigned':
        return { icon: <PlayIcon />, color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
      case 'skipped':
        return { icon: null, color: 'text-gray-400', bg: 'bg-gray-500/20' };
      case 'cancelled':
        return { icon: null, color: 'text-red-400', bg: 'bg-red-500/20' };
      default:
        return { icon: <PlayIcon />, color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
    }
  };

  // Get difficulty stars
  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 10 }, (_, i) => (
      <span
        key={i}
        className={`text-xs ${i < difficulty ? 'text-yellow-400' : 'text-slate-600'}`}
      >
        ★
      </span>
    ));
  };

  const handlePrevWeek = () => {
    onWeekChange?.('prev');
  };

  const handleNextWeek = () => {
    onWeekChange?.('next');
  };

  const handleWorkoutClick = (workout: CalendarWorkout) => {
    onWorkoutSelect?.(workout);
  };

  const handleStartWorkout = (e: React.MouseEvent, workout: CalendarWorkout) => {
    e.stopPropagation();
    onWorkoutStart?.(workout);
  };

  if (loading) {
    return (
      <div className="flex flex-col p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-700 rounded"></div>
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
          onClick={handlePrevWeek}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-cyan-400 transition-colors"
        >
          <ArrowLeftIcon />
        </button>
        
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">
            Week of {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </h2>
          <p className="text-sm text-slate-400">
            {weeklyPlan?.workouts.length || 0} workouts scheduled
          </p>
        </div>
        
        <button
          onClick={handleNextWeek}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-cyan-400 transition-colors"
        >
          <ArrowRightIcon />
        </button>
      </div>

      {/* Weekly Schedule */}
      <div className="space-y-4">
        {weekDates.map((date, index) => {
          const workouts = getWorkoutsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={date.toISOString()}
              className={`
                p-4 rounded-lg border transition-all duration-200
                ${isToday 
                  ? 'bg-slate-700/70 border-cyan-500/50 ring-1 ring-cyan-500/30' 
                  : 'bg-slate-800/30 border-slate-700'
                }
              `}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className={`text-lg font-semibold ${isToday ? 'text-cyan-400' : 'text-white'}`}>
                    {daysOfWeek[index]}
                  </h3>
                  <span className="text-sm text-slate-400">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  {isToday && (
                    <span className="px-2 py-1 text-xs font-medium bg-cyan-500/20 text-cyan-400 rounded-full">
                      Today
                    </span>
                  )}
                </div>
                
                {workouts.length > 0 && (
                  <span className="text-xs text-slate-400">
                    {workouts.reduce((total, w) => total + w.duration, 0)} min total
                  </span>
                )}
              </div>

              {/* Workouts */}
              {workouts.length > 0 ? (
                <div className="space-y-3">
                  {workouts.map((workout) => {
                    const statusInfo = getWorkoutStatusInfo(workout.status);
                    
                    return (
                      <div
                        key={workout.assignment_id}
                        onClick={() => handleWorkoutClick(workout)}
                        className={`
                          p-4 rounded-lg border cursor-pointer transition-all duration-200
                          hover:scale-[1.02] hover:shadow-lg
                          ${statusInfo.bg} border-slate-600 hover:border-slate-500
                        `}
                      >
                        <div className="flex items-center justify-between">
                          {/* Workout info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getWorkoutTypeColor(workout.type)}`}>
                                {workout.type.toUpperCase()}
                              </div>
                              <div className="flex">
                                {getDifficultyStars(workout.difficulty)}
                              </div>
                            </div>
                            
                            <h4 className="text-white font-semibold mb-1">{workout.name}</h4>
                            
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span>⏱️ {workout.duration} min</span>
                              <span>💪 Level {workout.difficulty}/10</span>
                              <span className={`capitalize ${statusInfo.color}`}>
                                {workout.status.replace('_', ' ')}
                              </span>
                            </div>
                            
                            {workout.notes && (
                              <p className="text-xs text-slate-400 mt-2 italic">
                                💬 {workout.notes}
                              </p>
                            )}
                          </div>

                          {/* Action button */}
                          <div className="flex items-center gap-2">
                            {workout.status === 'assigned' && (
                              <button
                                onClick={(e) => handleStartWorkout(e, workout)}
                                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors text-sm font-medium"
                              >
                                <PlayIcon />
                                Start
                              </button>
                            )}
                            
                            {workout.status === 'completed' && (
                              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium">
                                <CheckIcon />
                                Done
                              </div>
                            )}
                            
                            {statusInfo.icon && workout.status !== 'assigned' && workout.status !== 'completed' && (
                              <div className={`p-2 rounded-lg ${statusInfo.bg} ${statusInfo.color}`}>
                                {statusInfo.icon}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">🏖️ Rest day - time to recover!</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Weekly summary */}
      {weeklyPlan && weeklyPlan.workouts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-sm text-slate-400">Total Workouts</p>
              <p className="text-lg font-bold text-white">{weeklyPlan.workouts.length}</p>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-sm text-slate-400">Total Time</p>
              <p className="text-lg font-bold text-cyan-400">
                {weeklyPlan.workouts.reduce((total, w) => total + w.duration, 0)} min
              </p>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-sm text-slate-400">Completed</p>
              <p className="text-lg font-bold text-emerald-400">
                {weeklyPlan.workouts.filter(w => w.status === 'completed').length}
              </p>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-sm text-slate-400">Avg Difficulty</p>
              <p className="text-lg font-bold text-yellow-400">
                {(weeklyPlan.workouts.reduce((total, w) => total + w.difficulty, 0) / weeklyPlan.workouts.length).toFixed(1)}/10
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(WorkoutWeeklySchedule);
