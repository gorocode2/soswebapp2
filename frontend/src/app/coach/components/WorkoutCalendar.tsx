import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../i18n';
import WorkoutLibrary from '../../coach/components/WorkoutLibrary';
import { workoutService } from '../../../services/workoutService';
import { CalendarWorkout } from '../../../types/workout';

// Type for workout from the library (matching WorkoutLibrary component interface)
interface WorkoutFromLibrary {
  id: number;
  name: string;
  description?: string;
  training_type: string;
  primary_control_parameter: string;
  secondary_control_parameter?: string;
  estimated_duration_minutes: number;
  difficulty_level?: number;
  tags?: string[];
  created_by?: number;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface WorkoutSession {
  id: number;
  assignment_id: number; // Assignment ID for deletion
  date: string | Date; // Allow both string and Date
  name: string;
  type: 'threshold' | 'vo2max' | 'endurance' | 'sprint' | 'recovery';
  status: 'planned' | 'in_progress' | 'completed' | 'missed' | 'skipped' | 'started';
  duration?: number;
  targetPower?: number;
  actualPower?: number;
  targetHeartRate?: number;
  actualHeartRate?: number;
  notes?: string;
  coachNotes?: string;
  priority?: 'low' | 'normal' | 'high';
  intensityAdjustment?: string;
  durationAdjustment?: string;
  completedAt?: string | null;
  description?: string;
  difficultyLevel?: number;
  controlParameter?: string;
  intervals_icu_event_id?: string; // For intervals.icu tracking
  coachInfo?: {
    username: string;
    firstName: string;
    lastName: string;
  };
}

interface WorkoutCalendarProps {
  workouts: WorkoutSession[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  viewMode: 'month' | 'week' | 'day';
  onViewModeChange: (mode: 'month' | 'week' | 'day') => void;
  isLoading: boolean;
  onAddWorkout?: (workout: WorkoutFromLibrary, date: Date) => void; // New prop for adding workouts
  onWorkoutDeleted?: () => void; // Callback when workout is deleted to refresh data
  onWorkoutSelect?: (workout: CalendarWorkout) => void; // Callback when workout is clicked for details
}

export default function WorkoutCalendar({
  workouts,
  selectedDate,
  onDateSelect,
  viewMode,
  onViewModeChange: _onViewModeChange,
  isLoading,
  onAddWorkout,
  onWorkoutDeleted,
  onWorkoutSelect
}: WorkoutCalendarProps) {
  const { t } = useLanguage();
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSession | null>(null);

  // Convert WorkoutSession to CalendarWorkout for modal compatibility
  const convertToCalendarWorkout = (workout: WorkoutSession): CalendarWorkout => {
    // Convert status mapping
    const statusMap: Record<string, CalendarWorkout['status']> = {
      'planned': 'assigned',
      'in_progress': 'in_progress',
      'completed': 'completed',
      'missed': 'cancelled',
      'skipped': 'skipped'
    };

    return {
      id: workout.id,
      assignment_id: workout.assignment_id,
      date: typeof workout.date === 'string' ? workout.date : workout.date.toISOString().split('T')[0],
      name: workout.name,
      type: workout.type,
      status: statusMap[workout.status] || 'assigned',
      duration: workout.duration || 0,
      difficulty: 5, // Default difficulty if not provided
      priority: 'normal', // Default priority if not provided
      notes: workout.coachNotes || workout.notes || undefined
    };
  };
  const [isWorkoutLibraryOpen, setIsWorkoutLibraryOpen] = useState(false);
  const [selectedDateForWorkout, setSelectedDateForWorkout] = useState<Date | null>(null);

  // Helper function to format date to YYYY-MM-DD using local timezone
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Memoize workout filtering to avoid repeated calculations
  const workoutsByDate = useMemo(() => {
    const workoutMap = new Map<string, WorkoutSession[]>();
    
    workouts.forEach(workout => {
      let workoutDateString: string;
      
      // If workout.date is a Date object, format it properly
      if (workout.date instanceof Date) {
        workoutDateString = formatLocalDate(workout.date);
      } else if (typeof workout.date === 'string') {
        // If it's already a string, extract just the date part (YYYY-MM-DD)
        workoutDateString = workout.date.split('T')[0];
      } else {
        // Fallback for other types
        workoutDateString = String(workout.date);
      }
      
      if (!workoutMap.has(workoutDateString)) {
        workoutMap.set(workoutDateString, []);
      }
      workoutMap.get(workoutDateString)!.push(workout);
    });
    
    return workoutMap;
  }, [workouts]);

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case 'threshold': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'vo2max': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'endurance': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'sprint': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'recovery': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-yellow-500 text-white';
      case 'started': return 'bg-orange-500 text-white';
      case 'planned': return 'bg-blue-500 text-white';
      case 'missed': return 'bg-red-500 text-white';
      case 'skipped': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Get workout status color for calendar dots (matching workout page style)
  const getWorkoutStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'in_progress': return 'bg-blue-500';
      case 'started': return 'bg-blue-500';
      case 'planned': return 'bg-cyan-500';
      case 'missed': return 'bg-red-500';
      case 'skipped': return 'bg-gray-500';
      default: return 'bg-cyan-500';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500';
      case 'normal': return 'border-l-4 border-blue-500';
      case 'low': return 'border-l-4 border-gray-500';
      default: return 'border-l-4 border-blue-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '🏃‍♂️';
      case 'planned': return '📅';
      case 'missed': return '❌';
      case 'skipped': return '⏭️';
      default: return '📝';
    }
  };

  // Generate calendar days for month view (Monday to Sunday)
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    
    // Adjust to start with Monday (0 = Sunday, 1 = Monday, etc.)
    // If Sunday (0), we need to go back 6 days to get Monday
    // If Monday (1), we need to go back 0 days
    // If Tuesday (2), we need to go back 1 day, etc.
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) { // 6 weeks × 7 days
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // Generate week days for weekly view (Monday to Sunday)
  const generateWeekDays = () => {
    const days = [];
    const startDate = new Date(selectedDate);
    
    // Get the start of the week (Monday)
    const dayOfWeek = startDate.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    // Generate 7 days of the week (Monday to Sunday)
    for (let i = 0; i < 7; i++) {
      days.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }
    
    return days;
  };

  const getWorkoutsForDate = (date: Date) => {
    const dateString = formatLocalDate(date);
    return workoutsByDate.get(dateString) || [];
  };

  // Memoize selected date workouts to avoid repeated calculations
  const selectedDateWorkouts = useMemo(() => {
    return getWorkoutsForDate(selectedDate);
  }, [selectedDate, workoutsByDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date: Date) => {
    return date.getMonth() === selectedDate.getMonth();
  };

  const handleDeleteWorkout = async (workout: WorkoutSession) => {
    if (!workout.assignment_id) {
      alert('❌ Cannot delete workout: Assignment ID not found');
      return;
    }

    const confirmDelete = confirm(
      `🦈 Are you sure you want to delete "${workout.name}"?\n\nThis will remove the workout from both your platform and intervals.icu (if connected).`
    );

    if (!confirmDelete) return;

    try {
      const result = await workoutService.deleteAssignment(workout.assignment_id);
      
      if (result.success) {
        // Show success message with intervals.icu sync status
        let message = `✅ Workout "${result.workout_name || workout.name}" deleted successfully!`;
        
        if (result.intervals_icu_deletion) {
          if (result.intervals_icu_deletion.success) {
            message += '\n\n🦈 Also removed from intervals.icu';
          } else {
            message += '\n\n⚠️ Removed from platform but intervals.icu deletion failed:\n' + result.intervals_icu_deletion.message;
          }
        }
        
        alert(message);
        
        // Close the modal and refresh data
        setSelectedWorkout(null);
        if (onWorkoutDeleted) {
          onWorkoutDeleted();
        }
      } else {
        alert(`❌ Failed to delete workout: ${result.message}`);
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('❌ Failed to delete workout. Please try again.');
    }
  };

  const handleAddWorkout = (date: Date) => {
    setSelectedDateForWorkout(date);
    setIsWorkoutLibraryOpen(true);
  };

  const handleSelectWorkoutFromLibrary = (workout: WorkoutFromLibrary) => {
    if (selectedDateForWorkout && onAddWorkout) {
      onAddWorkout(workout, selectedDateForWorkout);
      setIsWorkoutLibraryOpen(false);
      setSelectedDateForWorkout(null);
    }
  };

  // Debug: Log current view mode and monthly data
  console.log('[DEBUG] Current viewMode:', viewMode);
  
  // Log data that is rendered in the monthly calendar grid (for all days)
  if (viewMode === 'month') {
    console.log('[MONTHLY] Monthly view is active - logging rendered data...');
    const days = generateCalendarDays();
    days.forEach(date => {
      const dateStr = formatLocalDate(date);
      const w = getWorkoutsForDate(date);
      console.log('[MONTHLY] Rendered Workouts for', dateStr, w.map(wo => wo.date));
    });
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-[#314d68] p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            <div className="h-4 bg-slate-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() - 1);
            onDateSelect(newDate);
          }}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-cyan-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
            <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
          </svg>
        </button>
        
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">
            {selectedDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long' 
            })}
          </h2>
          <p className="text-sm text-slate-400">
            {workouts.length} workouts scheduled
          </p>
        </div>
        
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() + 1);
            onDateSelect(newDate);
          }}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-cyan-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
            <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
          </svg>
        </button>
      </div>

      {/* Month View */}
      {viewMode === 'month' && (
        <>
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <div key={`day-header-${index}`} className="text-center text-sm font-semibold text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {generateCalendarDays().map((date, index) => {
              const dayWorkouts = getWorkoutsForDate(date);
              const isCurrentMonth = isSameMonth(date);
              const isTodayDate = isToday(date);
              const hasWorkouts = dayWorkouts.length > 0;
              
              return (
                <button
                  key={index}
                  onClick={() => onDateSelect(date)}
                  className={`
                    aspect-square relative p-1 text-sm font-medium rounded-lg transition-all duration-200
                    ${hasWorkouts && isCurrentMonth
                      ? 'bg-slate-700 hover:bg-slate-600 text-white border border-cyan-500/50' 
                      : isCurrentMonth
                        ? 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-400'
                        : 'bg-slate-800/20 text-slate-600'
                    }
                    ${isTodayDate ? 'ring-2 ring-cyan-400' : ''}
                    ${hasWorkouts && isCurrentMonth ? 'hover:scale-105' : ''}
                  `}
                >
                  <span className="block mb-1">{date.getDate()}</span>
                  
                  {/* Workout indicators */}
                  {hasWorkouts && isCurrentMonth && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {dayWorkouts.slice(0, 3).map((workout) => (
                        <div
                          key={workout.id}
                          className={`
                            w-2 h-2 rounded-full
                            ${getWorkoutStatusColor(workout.status)}
                            ring-1 ring-cyan-400/50
                          `}
                          title={`${workout.name} (${workout.type})`}
                        />
                      ))}
                      {dayWorkouts.length > 3 && (
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
                <span className="text-slate-400">Planned</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span className="text-slate-400">Missed/Skipped</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Weekly View */}
      <div className="mt-8">
        <h4 className="text-white text-lg font-semibold mb-4 flex items-center">
          📅 {t('coach.calendar.weekView')} - Week of {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </h4>
        
        {/* Week days - one day per line with mobile optimization */}
        <div className="space-y-2 sm:space-y-3">
          {generateWeekDays().map((date, index) => {
            const dayWorkouts = getWorkoutsForDate(date);
            const isTodayDate = isToday(date);
            const isSelectedDate = date.toDateString() === selectedDate.toDateString();
            
            return (
              <div
                key={index}
                className={`
                  flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border border-slate-600/50 rounded-lg bg-slate-700/30
                  ${isTodayDate ? 'ring-2 ring-blue-500' : ''}
                  ${isSelectedDate ? 'ring-2 ring-green-500' : ''}
                `}
              >
                {/* Day info - flexible width on mobile, centered */}
                <div className="flex-shrink-0 w-full sm:w-32 text-center sm:text-left">
                  <div className={`text-sm font-semibold ${
                    isTodayDate ? 'text-blue-400' : 
                    isSelectedDate ? 'text-green-400' : 'text-white'
                  }`}>
                    {date.toLocaleDateString('en-US', { weekday: 'long' })} {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {isTodayDate && <span className="text-blue-400 font-medium ml-1">Today</span>}
                  </div>
                </div>
                
                {/* Workouts section - flexible width, centered content */}
                <div className="flex-1 min-w-0 w-full">
                  {dayWorkouts.length > 0 ? (
                    <div className="space-y-2">
                      {dayWorkouts.map((workout) => (
                        <div
                          key={workout.id}
                          className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${getWorkoutTypeColor(workout.type)}`}
                          onClick={() => {
                            if (onWorkoutSelect) {
                              onWorkoutSelect(convertToCalendarWorkout(workout));
                            } else {
                              setSelectedWorkout(workout);
                            }
                          }}
                          title={`${workout.name} - ${workout.duration ? workout.duration + ' min' : ''}`}
                        >
                          <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${getStatusColor(workout.status)}`}>
                            {getStatusIcon(workout.status)}
                          </span>
                          
                          <div className="flex-1 min-w-0">
                            <div 
                              className="font-medium text-sm text-white break-words leading-tight overflow-hidden"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                maxHeight: '2.5rem'
                              }}
                              title={workout.name}
                            >
                              {workout.name}
                            </div>
                            <div className="flex flex-wrap items-center gap-1 text-xs opacity-75 mt-1">
                              {workout.duration && (
                                <span className="bg-black/20 px-1.5 py-0.5 rounded whitespace-nowrap">{workout.duration}m</span>
                              )}
                              {workout.priority && workout.priority === 'high' && (
                                <span className="text-red-400 bg-black/20 px-1.5 py-0.5 rounded whitespace-nowrap">🔥 High</span>
                              )}
                              {workout.difficultyLevel && (
                                <span className="text-orange-400 bg-black/20 px-1.5 py-0.5 rounded whitespace-nowrap">💪 L{workout.difficultyLevel}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-2">
                      {/* Empty space when no workouts - no dash indicator */}
                    </div>
                  )}
                </div>
                
                {/* Add workout button - centered in day block */}
                <div className="flex-shrink-0 self-center w-full sm:w-auto flex justify-center sm:justify-start">
                  <button
                    onClick={() => handleAddWorkout(date)}
                    className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold transition-colors shadow-lg"
                    title="Add workout"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Week/Day View - Show workouts list */}
      {(viewMode === 'week' || viewMode === 'day') && (
        <div className="space-y-4">
          <div className="text-center text-white text-lg font-semibold mb-4">
            {formatDate(selectedDate)}
          </div>
          
          {selectedDateWorkouts.length > 0 ? (
            selectedDateWorkouts.map((workout) => (
              <div
                key={workout.id}
                className={`bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 hover:bg-slate-700/70 transition-all duration-200 cursor-pointer ${getPriorityColor(workout.priority)}`}
                onClick={() => {
                  if (onWorkoutSelect) {
                    onWorkoutSelect(convertToCalendarWorkout(workout));
                  } else {
                    setSelectedWorkout(workout);
                  }
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="text-white font-semibold">{workout.name}</h5>
                    {workout.priority && (
                      <div className="flex items-center mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          workout.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          workout.priority === 'normal' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {workout.priority === 'high' ? '🔥 High Priority' :
                           workout.priority === 'normal' ? '📋 Normal' : '📝 Low Priority'}
                        </span>
                        {workout.difficultyLevel && (
                          <span className="ml-2 text-xs text-orange-400">
                            💪 Level {workout.difficultyLevel}/10
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workout.status)}`}>
                    {getStatusIcon(workout.status)} {t(`coach.workoutStatus.${workout.status}`)}
                  </div>
                </div>
                
                <div className="flex items-center flex-wrap gap-2 text-sm text-[#94a3b8] mb-2">
                  <span className={`px-2 py-1 rounded border text-xs ${getWorkoutTypeColor(workout.type)}`}>
                    {workout.type.toUpperCase()}
                  </span>
                  {workout.duration && (
                    <span className="flex items-center">
                      ⏱️ {workout.duration} {t('time.minutes')}
                    </span>
                  )}
                  {workout.controlParameter && (
                    <span className="flex items-center">
                      🎯 {workout.controlParameter === 'power' ? 'Power' : 'Heart Rate'} based
                    </span>
                  )}
                  {workout.intensityAdjustment && workout.intensityAdjustment !== '1.00' && (
                    <span className="flex items-center text-yellow-400">
                      📊 {(parseFloat(workout.intensityAdjustment) * 100).toFixed(0)}% intensity
                    </span>
                  )}
                </div>

                {/* Coach Information */}
                {workout.coachInfo && (
                  <div className="text-xs text-cyan-400 mb-2">
                    👨‍💼 Assigned by: {workout.coachInfo.firstName} {workout.coachInfo.lastName} (@{workout.coachInfo.username})
                  </div>
                )}

                {/* Completion Status */}
                {workout.completedAt && (
                  <div className="text-xs text-green-400 mb-2">
                    ✅ Completed: {new Date(workout.completedAt).toLocaleDateString()}
                  </div>
                )}

                {workout.coachNotes && (
                  <p className="text-sm text-[#94a3b8] mt-2">
                    💬 {workout.coachNotes}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📅</div>
              <p className="text-[#94a3b8]">
                {t('coach.calendar.noWorkouts')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-[#314d68] p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white text-lg font-semibold">
                {t('coach.calendar.workoutDetails')}
              </h4>
              <button
                onClick={() => setSelectedWorkout(null)}
                className="text-[#94a3b8] hover:text-white transition-colors duration-200"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h5 className="text-white font-semibold">{selectedWorkout.name}</h5>
                <p className="text-[#94a3b8] text-sm">{new Date(selectedWorkout.date).toLocaleDateString()}</p>
                {selectedWorkout.description && (
                  <p className="text-[#94a3b8] text-sm mt-2">{selectedWorkout.description}</p>
                )}
              </div>
              
              <div className="flex items-center flex-wrap gap-2">
                <div className={`px-3 py-1 rounded border ${getWorkoutTypeColor(selectedWorkout.type)}`}>
                  {selectedWorkout.type.toUpperCase()}
                </div>
                <div className={`px-3 py-1 rounded ${getStatusColor(selectedWorkout.status)}`}>
                  {getStatusIcon(selectedWorkout.status)} {t(`coach.workoutStatus.${selectedWorkout.status}`)}
                </div>
                {selectedWorkout.priority && (
                  <div className={`px-3 py-1 rounded text-xs ${
                    selectedWorkout.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    selectedWorkout.priority === 'normal' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {selectedWorkout.priority === 'high' ? '🔥 High Priority' :
                     selectedWorkout.priority === 'normal' ? '📋 Normal' : '📝 Low Priority'}
                  </div>
                )}
              </div>

              {/* Workout Metrics */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedWorkout.duration && (
                  <div className="text-[#94a3b8]">
                    <strong>Duration:</strong> {selectedWorkout.duration} {t('time.minutes')}
                  </div>
                )}
                
                {selectedWorkout.difficultyLevel && (
                  <div className="text-[#94a3b8]">
                    <strong>Difficulty:</strong> {selectedWorkout.difficultyLevel}/10
                  </div>
                )}
                
                {selectedWorkout.controlParameter && (
                  <div className="text-[#94a3b8]">
                    <strong>Control:</strong> {selectedWorkout.controlParameter === 'power' ? 'Power' : 'Heart Rate'}
                  </div>
                )}
                
                {selectedWorkout.intensityAdjustment && selectedWorkout.intensityAdjustment !== '1.00' && (
                  <div className="text-[#94a3b8]">
                    <strong>Intensity:</strong> {(parseFloat(selectedWorkout.intensityAdjustment) * 100).toFixed(0)}%
                  </div>
                )}
              </div>

              {/* Coach Information */}
              {selectedWorkout.coachInfo && (
                <div className="border-t border-slate-600 pt-4">
                  <div className="text-cyan-400 text-sm">
                    <strong>👨‍💼 Assigned by:</strong> {selectedWorkout.coachInfo.firstName} {selectedWorkout.coachInfo.lastName}
                    <br />
                    <span className="text-xs">@{selectedWorkout.coachInfo.username}</span>
                  </div>
                </div>
              )}

              {/* Completion Info */}
              {selectedWorkout.completedAt && (
                <div className="text-green-400 text-sm">
                  <strong>✅ Completed:</strong> {new Date(selectedWorkout.completedAt).toLocaleString()}
                </div>
              )}
              
              {selectedWorkout.targetPower && (
                <div className="text-[#94a3b8]">
                  <strong>Target Power:</strong> {selectedWorkout.targetPower}W
                  {selectedWorkout.actualPower && (
                    <span className="ml-2">
                      (Actual: {selectedWorkout.actualPower}W)
                    </span>
                  )}
                </div>
              )}
              
              {selectedWorkout.coachNotes && (
                <div>
                  <strong className="text-white">📝 Coach Notes:</strong>
                  <p className="text-[#94a3b8] mt-1 bg-slate-700/30 p-3 rounded">{selectedWorkout.coachNotes}</p>
                </div>
              )}
              
              {selectedWorkout.notes && (
                <div>
                  <strong className="text-white">💬 Athlete Feedback:</strong>
                  <p className="text-[#94a3b8] mt-1 bg-slate-700/30 p-3 rounded">{selectedWorkout.notes}</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 mt-6">
              <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
                {t('coach.calendar.editWorkout')}
              </button>
              <button 
                onClick={() => handleDeleteWorkout(selectedWorkout)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                {t('coach.calendar.removeWorkout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workout Library Modal */}
      {isWorkoutLibraryOpen && (
        <WorkoutLibrary
          isOpen={isWorkoutLibraryOpen}
          onClose={() => setIsWorkoutLibraryOpen(false)}
          onSelectWorkout={handleSelectWorkoutFromLibrary}
          selectedDate={selectedDateForWorkout}
        />
      )}
    </div>
  );
}
