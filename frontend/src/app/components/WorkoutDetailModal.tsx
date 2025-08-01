'use client';

import React, { useState, useEffect } from 'react';
import { CalendarWorkout } from '@/types/workout';
import { WorkoutLibraryDetailResponse, WorkoutLibrary } from '@/models/types';
import workoutService from '@/services/workoutService';
import WorkoutStructureGraph from './WorkoutStructureGraph';
import { useTranslation } from '@/i18n';

// SVG Icon Components
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
    <path d="m232.4,114.49-176-112a16,16,0,0,0-16.75-.88A15.91,15.91,0,0,0,32,16V240a15.91,15.91,0,0,0,7.69,13.43A16.13,16.13,0,0,0,48,256a15.95,15.95,0,0,0,8.36-2.35l176-112a16,16,0,0,0,0-27Zm-176,112V32L224,128Z"></path>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
    <path d="m229.66,77.66-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="currentColor" viewBox="0 0 256 256" className={className}>
    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
  </svg>
);

const FireIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="currentColor" viewBox="0 0 256 256" className={className}>
    <path d="M183.89,153.34a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68ZM216,144a88,88,0,0,1-176,0c0-27.92,11-56.47,32.66-84.85a8,8,0,0,1,11.93-.89l24,16a8,8,0,0,1,.89,11.93A40,40,0,1,0,168,144a8,8,0,0,1,16,0Zm-16,0a72,72,0,1,0-144,0c0,22.86,8.76,46.33,26.05,69.86a8,8,0,0,1-12.05,10.28C50.29,198.22,40,169.54,40,144a88,88,0,0,1,176,0Z"></path>
  </svg>
);

interface WorkoutDetailModalProps {
  workout: CalendarWorkout;
  isOpen: boolean;
  onClose: () => void;
  onStartWorkout: (workout: CalendarWorkout) => void;
  onCompleteWorkout: (workout: CalendarWorkout) => void;
  isLibraryWorkout?: boolean; // New prop to indicate if this is from library
  selectedDate?: Date | null; // For library workouts
}

export default function WorkoutDetailModal({
  workout,
  isOpen,
  onClose,
  onStartWorkout,
  onCompleteWorkout,
  isLibraryWorkout = false,
  selectedDate
}: WorkoutDetailModalProps) {
  const { t } = useTranslation();
  const [workoutDetails, setWorkoutDetails] = useState<WorkoutLibrary | null>(null);
  const [loading, setLoading] = useState(false);

  // Load workout details when modal opens
  useEffect(() => {
    if (isOpen && workout) {
      const loadWorkoutDetails = async () => {
        try {
          setLoading(true);
          console.log('🦈 Loading workout details for ID:', workout.id);
          
          // workout.id is the workout_library_id
          const workoutLibraryId = workout.id;
          
          const workoutDetails = await workoutService.getWorkoutDetails(workoutLibraryId);
          
          console.log('🦈 Workout details loaded:', workoutDetails);
          
          setWorkoutDetails(workoutDetails);
        } catch (error) {
          console.error('Error loading workout details:', error);
          // For now, if the API fails, we'll just show basic workout info
          // without detailed structure
          setWorkoutDetails(null);
        } finally {
          setLoading(false);
        }
      };

      loadWorkoutDetails();
    }
  }, [isOpen, workout]);

  // Helper functions for workout data
  const getWorkoutDescription = (type: string): string => {
    const typeKey = type.toLowerCase();
    const descriptionKey = `workout.descriptions.${typeKey}`;
    return t(descriptionKey) !== descriptionKey ? t(descriptionKey) : t('workout.descriptions.default');
  };

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

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 10 }, (_, i) => (
      <span
        key={i}
        className={`text-sm ${i < difficulty ? 'text-yellow-400' : 'text-slate-600'}`}
      >
        ★
      </span>
    ));
  };

  const handleStartClick = () => {
    onStartWorkout(workout);
    onClose();
  };

  const handleCompleteClick = () => {
    onCompleteWorkout(workout);
    onClose();
  };

  // Calculate total duration
  const getTotalDuration = (): number => {
    return workoutDetails?.estimated_duration_minutes || workout.duration;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getWorkoutTypeColor(workout.type)}`}>
              {t(`workout.types.${workout.type.toLowerCase()}`) !== `workout.types.${workout.type.toLowerCase()}` 
                ? t(`workout.types.${workout.type.toLowerCase()}`) 
                : workout.type.toUpperCase()}
            </div>
            <div className="flex">
              {getDifficultyStars(workout.difficulty)}
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-700 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-slate-700 rounded w-1/2 mx-auto"></div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Workout Info */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">{workout.name}</h2>
              <p className="text-slate-300 mb-4">
                {workoutDetails?.description || getWorkoutDescription(workout.type)}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                  <ClockIcon className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <p className="text-sm text-slate-400">{t('workout.duration')}</p>
                  <p className="text-lg font-bold text-white">{getTotalDuration()} {t('time.minutes')}</p>
                </div>
                <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                  <FireIcon className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <p className="text-sm text-slate-400">{t('workout.difficulty')}</p>
                  <p className="text-lg font-bold text-yellow-400">{workout.difficulty}/10</p>
                </div>
                <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                  <p className="text-sm text-slate-400">{t('workout.status')}</p>
                  <p className="text-lg font-bold text-cyan-400 capitalize">
                    {t(`workout.statuses.${workout.status}`) !== `workout.statuses.${workout.status}` 
                      ? t(`workout.statuses.${workout.status}`) 
                      : workout.status.replace('_', ' ')}
                  </p>
                </div>
                <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                  <p className="text-sm text-slate-400">{t('workout.priority')}</p>
                  <p className="text-lg font-bold text-orange-400 capitalize">
                    {t(`workout.priorities.${workout.priority}`) !== `workout.priorities.${workout.priority}` 
                      ? t(`workout.priorities.${workout.priority}`) 
                      : workout.priority}
                  </p>
                </div>
              </div>

              {workout.notes && (
                <div className="bg-slate-700/30 p-4 rounded-lg mb-6">
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">{t('workout.coachNotes')}:</h4>
                  <p className="text-slate-300 italic">{workout.notes}</p>
                </div>
              )}
            </div>

            {/* Workout Structure Graph */}
            {workoutDetails?.workout_description && (
              <WorkoutStructureGraph
                workoutDescription={workoutDetails.workout_description}
                primaryControlParameter={
                  workoutDetails.primary_control_parameter === 'power' ? 'power' : 'hr'
                }
                width={800}
                height={200}
              />
            )}

            {/* Workout Description */}
            {workoutDetails?.workout_description && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4">{t('workout.structure')}</h3>
                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                  <pre className="text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {workoutDetails.workout_description}
                  </pre>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-700">
              {isLibraryWorkout && selectedDate ? (
                <button
                  onClick={handleStartClick}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
                >
                  📅 Add to Calendar ({selectedDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    weekday: 'short'
                  })})
                </button>
              ) : isLibraryWorkout ? (
                <button
                  onClick={() => alert('Select a date in the calendar first to add this workout!')}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-600 text-slate-300 rounded-lg font-semibold cursor-not-allowed"
                >
                  📅 Select Date First
                </button>
              ) : (
                <>
                  {workout.status === 'assigned' && (
                    <button
                      onClick={handleStartClick}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      <PlayIcon />
                      {t('workout.startWorkout')}
                    </button>
                  )}
                  
                  {workout.status === 'in_progress' && (
                    <button
                      onClick={handleCompleteClick}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      <CheckIcon />
                      {t('workout.completeWorkout')}
                    </button>
                  )}
                </>
              )}
              
              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-semibold transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
