'use client';

import React, { useState, useEffect } from 'react';
import WorkoutDetailModal from '../../components/WorkoutDetailModal';
import { CalendarWorkout } from '@/types/workout';

interface WorkoutLibrary {
  id: number;
  name: string;
  description?: string;
  workout_description?: string; // intervals.icu format description
  training_type: string;
  primary_control_parameter: string;
  secondary_control_parameter?: string;
  estimated_duration_minutes: number;
  difficulty_level?: number;
  tags?: string[];
  created_by?: number;
  is_public: boolean;
  is_active: boolean;
  workoutid_icu?: string;
  created_at: string;
  updated_at: string;
  segments?: WorkoutSegment[];
  categories?: WorkoutCategory[];
  creator?: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

interface WorkoutSegment {
  id: number;
  workout_library_id: number;
  segment_order: number;
  segment_type: string;
  name: string;
  duration_minutes?: number;
  duration_type: string;
  target_intensity?: number;
  target_power_percentage?: number;
  target_hr_percentage?: number;
  target_cadence?: number;
  target_rpe?: number;
  description?: string;
}

interface WorkoutCategory {
  id: number;
  name: string;
  description?: string;
  color_hex?: string;
  icon?: string;
}

interface WorkoutLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkout?: (workout: WorkoutLibrary) => void;
  selectedDate?: Date | null;
}

export default function WorkoutLibrary({ isOpen, onClose, onSelectWorkout, selectedDate }: WorkoutLibraryProps) {
  const [workouts, setWorkouts] = useState<WorkoutLibrary[]>([]);
  const [categories, setCategories] = useState<WorkoutCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTrainingType, setSelectedTrainingType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLibrary | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Convert WorkoutLibrary to CalendarWorkout format for the modal
  const convertToCalendarWorkout = (workout: WorkoutLibrary) => {
    return {
      id: workout.id,
      assignment_id: 0, // Not applicable for library workouts
      name: workout.name,
      type: workout.training_type,
      duration: workout.estimated_duration_minutes,
      difficulty: workout.difficulty_level || 5,
      status: 'assigned' as const, // Use assigned as default for library workouts
      priority: 'normal' as const,
      date: selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      time: null,
      notes: workout.description || '',
      coach_notes: null,
      workout_library_id: workout.id
    };
  };

  // Load workout library data
  useEffect(() => {
    if (isOpen) {
      loadWorkoutLibrary();
      loadCategories();
    }
  }, [isOpen]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Disable body scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Re-enable body scroll when modal closes
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const loadWorkoutLibrary = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/workout-library/templates');
      const result = await response.json();
      
      if (result.success) {
        setWorkouts(result.workouts || []);
      } else {
        console.error('❌ Failed to load workout library:', result.message);
        setWorkouts([]);
      }
    } catch (error) {
      console.error('❌ Error loading workout library:', error);
      setWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/workout-library/categories');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.categories || []);
      } else {
        console.error('❌ Failed to load categories:', result.message);
        setCategories([]);
      }
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      setCategories([]);
    }
  };

  // Filter workouts based on selected filters
  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = searchQuery === '' || 
      workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTrainingType = selectedTrainingType === 'all' || 
      workout.training_type === selectedTrainingType;
    
    // For category filtering, we'd need to check workout categories
    const matchesCategory = selectedCategory === 'all'; // Simplified for now
    
    return matchesSearch && matchesTrainingType && matchesCategory && workout.is_active;
  });

  const getTrainingTypeColor = (trainingType: string) => {
    const colors: { [key: string]: string } = {
      'zone2': 'bg-green-600',
      'tempo': 'bg-yellow-600',
      'interval': 'bg-orange-600',
      'vo2max': 'bg-red-600',
      'recovery': 'bg-blue-600',
      'threshold': 'bg-purple-600',
      'neuromuscular': 'bg-pink-600',
      'endurance': 'bg-teal-600',
      'sprint': 'bg-red-700'
    };
    return colors[trainingType] || 'bg-gray-600';
  };

  const getDifficultyStars = (level?: number) => {
    if (!level) return '—';
    return '★'.repeat(level) + '☆'.repeat(10 - level);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        // Close modal when clicking outside
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-slate-800 rounded-xl border border-[#314d68] w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-white text-2xl font-bold">🦈 Workout Library</h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-[#94a3b8] hover:text-white transition-colors duration-200"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content - Everything flows together */}
        <div className="flex-1 overflow-y-auto">
          {/* Search and Filters Section */}
          <div className="p-6 border-b border-slate-700 bg-slate-700/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block text-white text-sm font-medium mb-2">
                  Search Workouts
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, description, or tags..."
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-[#94a3b8] focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Training Type Filter */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Training Type
                </label>
                <select
                  value={selectedTrainingType}
                  onChange={(e) => setSelectedTrainingType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="zone2">Zone 2</option>
                  <option value="tempo">Tempo</option>
                  <option value="interval">Interval</option>
                  <option value="vo2max">VO2 Max</option>
                  <option value="recovery">Recovery</option>
                  <option value="threshold">Threshold</option>
                  <option value="neuromuscular">Neuromuscular</option>
                  <option value="endurance">Endurance</option>
                  <option value="sprint">Sprint</option>
                </select>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Categories
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-[#94a3b8]">
                Showing {filteredWorkouts.length} of {workouts.length} workouts
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          {selectedWorkout ? (
            /* Workout Detail View */
            <div className="p-6">
              <div className="mb-4">
                <button
                  onClick={() => setSelectedWorkout(null)}
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-4"
                >
                  ← Back to Library
                </button>
                
                <h3 className="text-white text-2xl font-bold mb-2">
                  {selectedWorkout.name}
                </h3>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded text-sm font-medium text-white ${getTrainingTypeColor(selectedWorkout.training_type)}`}>
                    {selectedWorkout.training_type.toUpperCase()}
                  </span>
                  <span className="text-[#94a3b8]">
                    {formatDuration(selectedWorkout.estimated_duration_minutes)}
                  </span>
                  {selectedWorkout.difficulty_level && (
                    <span className="text-yellow-400">
                      {getDifficultyStars(selectedWorkout.difficulty_level)} ({selectedWorkout.difficulty_level}/10)
                    </span>
                  )}
                </div>
              </div>

              {/* Workout Detail Content */}
              <div className="space-y-6">
                {selectedWorkout.description && (
                  <div>
                    <h4 className="text-white text-lg font-semibold mb-2">Description</h4>
                    <p className="text-[#94a3b8]">
                      {selectedWorkout.description}
                    </p>
                  </div>
                )}

                {/* Control Parameters */}
                <div>
                  <h4 className="text-white text-lg font-semibold mb-2">Control Parameters</h4>
                  <div className="text-[#94a3b8]">
                    <div>Primary: {selectedWorkout.primary_control_parameter.toUpperCase()}</div>
                    {selectedWorkout.secondary_control_parameter && (
                      <div>Secondary: {selectedWorkout.secondary_control_parameter.toUpperCase()}</div>
                    )}
                  </div>
                </div>

                {/* Segments */}
                {selectedWorkout.segments && selectedWorkout.segments.length > 0 && (
                  <div>
                    <h4 className="text-white text-lg font-semibold mb-3">
                      Workout Structure ({selectedWorkout.segments.length} segments)
                    </h4>
                    <div className="space-y-3">
                      {selectedWorkout.segments
                        .sort((a, b) => a.segment_order - b.segment_order)
                        .map(segment => (
                          <div
                            key={segment.id}
                            className="bg-slate-700/30 rounded-lg p-4 border border-slate-600"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium">
                                {segment.segment_order}. {segment.name}
                              </span>
                              <span className="text-[#94a3b8] text-sm">
                                {segment.duration_minutes ? `${segment.duration_minutes}min` : segment.duration_type}
                              </span>
                            </div>
                            <div className="text-xs text-[#94a3b8]">
                              Type: {segment.segment_type}
                              {segment.target_intensity && ` | Intensity: ${segment.target_intensity}%`}
                              {segment.target_power_percentage && ` | Power: ${segment.target_power_percentage}%`}
                              {segment.target_hr_percentage && ` | HR: ${segment.target_hr_percentage}%`}
                            </div>
                            {segment.description && (
                              <p className="text-xs text-[#94a3b8] mt-2">
                                {segment.description}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedWorkout.tags && selectedWorkout.tags.length > 0 && (
                  <div>
                    <h4 className="text-white text-lg font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedWorkout.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {onSelectWorkout && (
                  <div className="pt-4 border-t border-slate-700">
                    <button
                      onClick={() => {
                        onSelectWorkout(selectedWorkout);
                        onClose();
                      }}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      Use This Workout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Workout List View */
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-white text-lg">🦈 Loading workout library...</div>
                </div>
              ) : filteredWorkouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="text-6xl mb-4">🏃‍♂️</div>
                  <h3 className="text-white text-xl font-semibold mb-2">No Workouts Found</h3>
                  <p className="text-[#94a3b8] text-base">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              ) : (
                /* Single Column Workout Cards */
                <div className="space-y-4 pb-6">
                  {filteredWorkouts.map(workout => (
                    <div
                      key={workout.id}
                      onClick={() => {
                        setSelectedWorkout(workout);
                        setIsDetailModalOpen(true);
                      }}
                      className="bg-slate-700/30 border border-slate-600 rounded-lg p-6 hover:bg-slate-700/50 cursor-pointer transition-all duration-200 hover:border-blue-500/50"
                    >
                      {/* Workout Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-xl mb-2">
                            {workout.name}
                          </h3>
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getTrainingTypeColor(workout.training_type)}`}>
                              {workout.training_type.toUpperCase()}
                            </span>
                            <span className="text-[#94a3b8]">
                              {formatDuration(workout.estimated_duration_minutes)}
                            </span>
                            {workout.difficulty_level && (
                              <span className="text-yellow-400">
                                {getDifficultyStars(workout.difficulty_level)} ({workout.difficulty_level}/10)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-blue-400 text-sm">
                          Click to view →
                        </div>
                      </div>

                      {/* Description */}
                      {workout.description && (
                        <p className="text-[#94a3b8] mb-4 leading-relaxed">
                          {workout.description}
                        </p>
                      )}

                      {/* Tags */}
                      {workout.tags && workout.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {workout.tags.slice(0, 5).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                          {workout.tags.length > 5 && (
                            <span className="text-[#94a3b8] text-xs">
                              +{workout.tags.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Controls and Creator */}
                      <div className="flex items-center justify-between text-sm text-[#94a3b8] pt-3 border-t border-slate-600">
                        <div>
                          Primary: {workout.primary_control_parameter.toUpperCase()}
                          {workout.secondary_control_parameter && (
                            <span> | Secondary: {workout.secondary_control_parameter.toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          {workout.creator && (
                            <span>by {workout.creator.username}</span>
                          )}
                        </div>
                      </div>

                      {/* Add to Calendar Button (when date is selected) */}
                      {selectedDate && onSelectWorkout && (
                        <div className="mt-4 pt-3 border-t border-slate-600">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectWorkout(workout);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                          >
                            📅 Add to Calendar ({selectedDate.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              weekday: 'short'
                            })})
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <WorkoutDetailModal
          workout={convertToCalendarWorkout(selectedWorkout)}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedWorkout(null);
          }}
          isLibraryWorkout={true}
          selectedDate={selectedDate}
          onStartWorkout={() => {
            // Show add to calendar action instead
            if (selectedDate && onSelectWorkout && selectedWorkout) {
              onSelectWorkout(selectedWorkout);
              setIsDetailModalOpen(false);
              setSelectedWorkout(null);
              onClose();
            } else {
              alert('Select a date in the calendar first to add this workout!');
            }
          }}
          onCompleteWorkout={() => {
            // Show add to calendar action instead
            if (selectedDate && onSelectWorkout && selectedWorkout) {
              onSelectWorkout(selectedWorkout);
              setIsDetailModalOpen(false);
              setSelectedWorkout(null);
              onClose();
            } else {
              alert('Select a date in the calendar first to add this workout!');
            }
          }}
        />
      )}
    </div>
  );
}
