import React, { useState } from 'react';
import { useLanguage } from '../../../i18n';

interface WorkoutSession {
  id: number;
  date: string;
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
}

export default function WorkoutCalendar({
  workouts,
  selectedDate,
  onDateSelect,
  viewMode,
  onViewModeChange,
  isLoading
}: WorkoutCalendarProps) {
  const { t } = useLanguage();
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSession | null>(null);

  // Debug: Log workouts when they change
  React.useEffect(() => {
    console.log('🗓️ WorkoutCalendar received workouts:', workouts);
    console.log('📅 Current selectedDate:', selectedDate);
    if (workouts.length > 0) {
      workouts.forEach(workout => {
        console.log(`📋 Workout: ${workout.name} on ${workout.date}`);
      });
    }
  }, [workouts, selectedDate]);

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

  // Generate calendar days for month view
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) { // 6 weeks × 7 days
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getWorkoutsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return workouts.filter(workout => {
      const workoutDateString = new Date(workout.date).toISOString().split('T')[0];
      return workoutDateString === dateString;
    });
  };

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
    <div className="bg-slate-800/50 rounded-xl border border-[#314d68] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white text-lg font-semibold">
          {t('coach.calendar.title')}
        </h3>
        
        {/* View Mode Selector */}
        <div className="flex bg-slate-700/50 rounded-lg p-1">
          {(['month', 'week', 'day'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              {t(`coach.calendar.${mode}View`)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() - 1);
            onDateSelect(newDate);
          }}
          className="p-2 text-[#94a3b8] hover:text-white transition-colors duration-200"
        >
          ← {t('common.previous')}
        </button>
        
        <h4 className="text-white text-lg font-semibold">
          {selectedDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          })}
        </h4>
        
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() + 1);
            onDateSelect(newDate);
          }}
          className="p-2 text-[#94a3b8] hover:text-white transition-colors duration-200"
        >
          {t('common.next')} →
        </button>
      </div>

      {/* Month View */}
      {viewMode === 'month' && (
        <>
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-[#94a3b8] text-sm font-medium py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((date, index) => {
              const dayWorkouts = getWorkoutsForDate(date);
              const isCurrentMonth = isSameMonth(date);
              const isTodayDate = isToday(date);
              
              return (
                <button
                  key={index}
                  onClick={() => onDateSelect(date)}
                  className={`
                    relative p-2 min-h-[80px] border border-slate-700/50 rounded-lg transition-all duration-200
                    ${isCurrentMonth ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-slate-800/20'}
                    ${isTodayDate ? 'ring-2 ring-blue-500' : ''}
                  `}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isCurrentMonth ? 'text-white' : 'text-[#94a3b8]'
                  }`}>
                    {date.getDate()}
                  </div>
                  
                  {/* Workout indicators */}
                  <div className="space-y-1">
                    {dayWorkouts.slice(0, 2).map((workout) => (
                      <div
                        key={workout.id}
                        className={`text-xs px-1 py-0.5 rounded text-center ${getStatusColor(workout.status)}`}
                      >
                        {getStatusIcon(workout.status)}
                      </div>
                    ))}
                    {dayWorkouts.length > 2 && (
                      <div className="text-xs text-[#94a3b8]">
                        +{dayWorkouts.length - 2}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Week/Day View - Show workouts list */}
      {(viewMode === 'week' || viewMode === 'day') && (
        <div className="space-y-4">
          <div className="text-center text-white text-lg font-semibold mb-4">
            {formatDate(selectedDate)}
          </div>
          
          {getWorkoutsForDate(selectedDate).length > 0 ? (
            getWorkoutsForDate(selectedDate).map((workout) => (
              <div
                key={workout.id}
                className={`bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 hover:bg-slate-700/70 transition-all duration-200 cursor-pointer ${getPriorityColor(workout.priority)}`}
                onClick={() => setSelectedWorkout(workout)}
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
              <button className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200">
                {t('coach.calendar.removeWorkout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
