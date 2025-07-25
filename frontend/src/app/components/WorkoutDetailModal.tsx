'use client';

import React, { useState, useEffect } from 'react';
import { CalendarWorkout, WorkoutTemplate, WorkoutSegment } from '@/types/workout';
import workoutService from '@/services/workoutService';

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
}

export default function WorkoutDetailModal({
  workout,
  isOpen,
  onClose,
  onStartWorkout,
  onCompleteWorkout
}: WorkoutDetailModalProps) {
  const [workoutDetails, setWorkoutDetails] = useState<WorkoutTemplate | null>(null);
  const [segments, setSegments] = useState<WorkoutSegment[]>([]);
  const [loading, setLoading] = useState(false);

  // Load workout details when modal opens
  useEffect(() => {
    if (isOpen && workout) {
      const loadWorkoutDetails = async () => {
        try {
          setLoading(true);
          // For now, we'll use mock data since the detailed workout endpoint might not be fully implemented
          // In a real implementation, you'd call: workoutService.getWorkoutDetails(workout.id)
          
          // Mock workout details based on the workout type
          const mockDetails: WorkoutTemplate = {
            id: workout.id,
            name: workout.name,
            description: getWorkoutDescription(workout.type),
            training_type: workout.type,
            primary_control_parameter: 'hr',
            secondary_control_parameter: 'power',
            estimated_duration_minutes: workout.duration,
            difficulty_level: workout.difficulty,
            tags: getWorkoutTags(workout.type),
            created_by: 33,
            is_public: true,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            creator_username: 'coach_shark',
            creator_first_name: 'Coach',
            creator_last_name: 'Shark',
            categories: [workout.type],
            segment_count: getMockSegmentCount(workout.type).toString()
          };
          
          const mockSegments: WorkoutSegment[] = generateMockSegments(workout.type, workout.duration);
          
          setWorkoutDetails(mockDetails);
          setSegments(mockSegments);
        } catch (error) {
          console.error('Error loading workout details:', error);
        } finally {
          setLoading(false);
        }
      };

      loadWorkoutDetails();
    }
  }, [isOpen, workout]);

  // Helper functions for mock data
  const getWorkoutDescription = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'threshold':
        return 'Classic threshold workout to build lactate buffering capacity and FTP. Perfect for intermediate to advanced cyclists looking to improve their sustained power output.';
      case 'vo2max':
        return 'High-intensity intervals to maximize oxygen uptake and anaerobic power. These efforts will push you to your limits and significantly improve your top-end fitness.';
      case 'zone2':
      case 'endurance':
        return 'Long steady aerobic effort to build your base fitness and fat-burning capacity. The foundation of all cycling fitness.';
      case 'sprint':
        return 'Short explosive efforts to develop neuromuscular power and sprint capacity. Perfect for developing your finishing kick.';
      case 'recovery':
        return 'Gentle active recovery session to promote blood flow and aid recovery between hard training sessions.';
      default:
        return 'Structured cycling workout designed to improve your fitness and performance.';
    }
  };

  const getWorkoutTags = (type: string): string[] => {
    switch (type.toLowerCase()) {
      case 'threshold':
        return ['threshold', 'ftp', 'lactate', 'intermediate', 'structured'];
      case 'vo2max':
        return ['vo2max', 'anaerobic', 'hard', 'advanced', 'intervals'];
      case 'zone2':
      case 'endurance':
        return ['endurance', 'zone2', 'base', 'aerobic', 'beginner-friendly'];
      case 'sprint':
        return ['sprint', 'neuromuscular', 'power', 'explosive', 'advanced'];
      case 'recovery':
        return ['recovery', 'easy', 'regeneration', 'active-recovery', 'all-levels'];
      default:
        return ['cycling', 'training', 'fitness'];
    }
  };

  const getMockSegmentCount = (type: string): number => {
    switch (type.toLowerCase()) {
      case 'threshold': return 4;
      case 'vo2max': return 3;
      case 'zone2': case 'endurance': return 3;
      case 'sprint': return 3;
      case 'recovery': return 1;
      default: return 3;
    }
  };

  const generateMockSegments = (type: string, duration: number): WorkoutSegment[] => {
    const baseSegment = {
      workout_library_id: workout.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    switch (type.toLowerCase()) {
      case 'threshold':
        return [
          { ...baseSegment, id: 1, segment_order: 1, segment_type: 'warmup' as const, duration_minutes: 15, target_hr_percentage: 65, instructions: 'Easy spin to warm up legs and prepare for work' },
          { ...baseSegment, id: 2, segment_order: 2, segment_type: 'work' as const, duration_minutes: 7, target_hr_percentage: 88, target_power_percentage: 95, instructions: 'First threshold interval - build to target and hold steady' },
          { ...baseSegment, id: 3, segment_order: 3, segment_type: 'rest' as const, duration_minutes: 5, target_hr_percentage: 65, instructions: 'Easy recovery between intervals' },
          { ...baseSegment, id: 4, segment_order: 4, segment_type: 'work' as const, duration_minutes: 7, target_hr_percentage: 88, target_power_percentage: 95, instructions: 'Second threshold interval - focus on smooth pedaling' },
          { ...baseSegment, id: 5, segment_order: 5, segment_type: 'rest' as const, duration_minutes: 5, target_hr_percentage: 65, instructions: 'Easy recovery between intervals' },
          { ...baseSegment, id: 6, segment_order: 6, segment_type: 'work' as const, duration_minutes: 7, target_hr_percentage: 88, target_power_percentage: 95, instructions: 'Final threshold interval - push through the burn!' },
          { ...baseSegment, id: 7, segment_order: 7, segment_type: 'cooldown' as const, duration_minutes: 14, target_hr_percentage: 60, instructions: 'Easy spin to cool down and flush lactate' }
        ];
      
      case 'vo2max':
        return [
          { ...baseSegment, id: 1, segment_order: 1, segment_type: 'warmup' as const, duration_minutes: 20, target_hr_percentage: 70, instructions: 'Progressive warm-up with some tempo efforts' },
          { ...baseSegment, id: 2, segment_order: 2, segment_type: 'work' as const, duration_minutes: 3, target_hr_percentage: 95, target_power_percentage: 110, instructions: 'VO2 max interval - go deep!' },
          { ...baseSegment, id: 3, segment_order: 3, segment_type: 'rest' as const, duration_minutes: 3, target_hr_percentage: 65, instructions: 'Active recovery - keep legs moving' },
          { ...baseSegment, id: 4, segment_order: 4, segment_type: 'cooldown' as const, duration_minutes: 15, target_hr_percentage: 60, instructions: 'Easy spin to recover' }
        ];
      
      default:
        return [
          { ...baseSegment, id: 1, segment_order: 1, segment_type: 'warmup' as const, duration_minutes: Math.round(duration * 0.2), target_hr_percentage: 65, instructions: 'Warm up gradually' },
          { ...baseSegment, id: 2, segment_order: 2, segment_type: 'work' as const, duration_minutes: Math.round(duration * 0.6), target_hr_percentage: 75, instructions: 'Main workout effort' },
          { ...baseSegment, id: 3, segment_order: 3, segment_type: 'cooldown' as const, duration_minutes: Math.round(duration * 0.2), target_hr_percentage: 60, instructions: 'Cool down and recover' }
        ];
    }
  };

  const getSegmentTypeColor = (type: string): string => {
    switch (type) {
      case 'warmup': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'work': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'rest': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'cooldown': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getWorkoutTypeColor(workout.type)}`}>
              {workout.type.toUpperCase()}
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
              <p className="text-slate-300 mb-4">{workoutDetails?.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                  <ClockIcon className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <p className="text-sm text-slate-400">Duration</p>
                  <p className="text-lg font-bold text-white">{workout.duration} min</p>
                </div>
                <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                  <FireIcon className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <p className="text-sm text-slate-400">Difficulty</p>
                  <p className="text-lg font-bold text-yellow-400">{workout.difficulty}/10</p>
                </div>
                <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                  <p className="text-sm text-slate-400">Status</p>
                  <p className="text-lg font-bold text-cyan-400 capitalize">{workout.status.replace('_', ' ')}</p>
                </div>
                <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                  <p className="text-sm text-slate-400">Priority</p>
                  <p className="text-lg font-bold text-orange-400 capitalize">{workout.priority}</p>
                </div>
              </div>

              {workout.notes && (
                <div className="bg-slate-700/30 p-4 rounded-lg mb-6">
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">Coach Notes:</h4>
                  <p className="text-slate-300 italic">{workout.notes}</p>
                </div>
              )}
            </div>

            {/* Workout Segments */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Workout Structure</h3>
              <div className="space-y-3">
                {segments.map((segment, index) => (
                  <div
                    key={segment.id}
                    className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getSegmentTypeColor(segment.segment_type)}`}>
                          {segment.segment_type.toUpperCase()}
                        </span>
                        <span className="text-white font-semibold">{segment.duration_minutes} min</span>
                        {segment.target_hr_percentage && (
                          <span className="text-sm text-slate-400">
                            HR: {segment.target_hr_percentage}%
                          </span>
                        )}
                        {segment.target_power_percentage && (
                          <span className="text-sm text-slate-400">
                            Power: {segment.target_power_percentage}%
                          </span>
                        )}
                      </div>
                      
                      {segment.instructions && (
                        <p className="text-sm text-slate-300">{segment.instructions}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-700">
              {workout.status === 'assigned' && (
                <button
                  onClick={handleStartClick}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
                >
                  <PlayIcon />
                  Start Workout
                </button>
              )}
              
              {workout.status === 'in_progress' && (
                <button
                  onClick={handleCompleteClick}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors"
                >
                  <CheckIcon />
                  Mark Complete
                </button>
              )}
              
              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
