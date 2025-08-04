'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '../../i18n';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import AthleteSelector from './components/AthleteSelector';
import WorkoutCalendar from './components/WorkoutCalendar';
import AthleteProfile from './components/AthleteProfile';
import WorkoutLibrary from './components/WorkoutLibrary';
import workoutService from '@/services/workoutService';

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

// Types for athlete and workout data
interface Athlete {
  id: number;
  uuid: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  ftp?: number;
  maxHeartRate?: number;
  restHeartRate?: number;
  weight?: number;
  height?: number;
  lastActivity?: string;
  joinedDate: string;
}

interface WorkoutSession {
  id: number;
  assignment_id: number; // For deletion functionality
  date: string;
  name: string;
  type: 'threshold' | 'vo2max' | 'endurance' | 'sprint' | 'recovery';
  status: 'planned' | 'in_progress' | 'completed' | 'missed' | 'skipped';
  duration?: number; // in minutes
  targetPower?: number;
  actualPower?: number;
  targetHeartRate?: number;
  actualHeartRate?: number;
  notes?: string;
  coachNotes?: string;
  intervals_icu_event_id?: string; // For intervals.icu tracking
}

export default function CoachPage() {
  const { user, isLoading, isLoggedIn, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [isLoadingAthletes, setIsLoadingAthletes] = useState(true);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [isWorkoutLibraryOpen, setIsWorkoutLibraryOpen] = useState(false);

  // Handle adding workout from library to calendar
  const handleAddWorkout = async (workout: WorkoutFromLibrary, date: Date) => {
    if (!selectedAthlete || !user) {
      console.error('Missing selected athlete or current user');
      return;
    }
    
    try {
      // Format date to YYYY-MM-DD using local timezone (not UTC)
      const formatLocalDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const scheduledDate = formatLocalDate(date);
      
      // Create assignment request
      const assignmentRequest = {
        workout_library_id: workout.id,
        assigned_to_user_id: selectedAthlete.id,
        assigned_by_user_id: user.id,
        scheduled_date: scheduledDate,
      };

      console.log('🔍 Creating workout assignment:', assignmentRequest);
      console.log('🔍 Current user:', user);
      console.log('🔍 Selected athlete:', selectedAthlete);
      console.log('🔍 Selected date:', date);
      console.log('🔍 Formatted scheduled_date:', scheduledDate);
      
      // Save to database via API
      const response = await workoutService.createAssignment(assignmentRequest);
      
      console.log('✅ Workout assignment created:', response);
      
      // Check intervals.icu sync status
      if (response.intervals_icu_sync) {
        if (response.intervals_icu_sync.success) {
          console.log('🦈 Workout synced with intervals.icu:', response.intervals_icu_sync.intervalId);
          alert(`Workout assigned successfully!\n\n✅ Synced with ${selectedAthlete.firstName || selectedAthlete.username}'s intervals.icu (ID: ${response.intervals_icu_sync.intervalId})`);
        } else {
          const message = response.intervals_icu_sync.message;
          console.warn('⚠️ intervals.icu sync failed:', message);
          
          if (message.includes('does not have intervals.icu ID')) {
            alert(`Workout assigned successfully!\n\n⚠️ ${selectedAthlete.firstName || selectedAthlete.username} doesn't have intervals.icu configured. Ask them to add their intervals.icu ID to their profile.`);
          } else {
            alert(`Workout assigned successfully!\n\n⚠️ intervals.icu sync failed: ${message}`);
          }
        }
      } else {
        console.log('🦈 Workout assigned (no intervals.icu sync configured)');
        alert('Workout assigned successfully!');
      }
      
      // Create local workout session for immediate UI feedback
      const newWorkout: WorkoutSession = {
        id: response.assignment_id,
        assignment_id: response.assignment_id,
        date: scheduledDate,
        name: workout.name,
        type: 'endurance', // Default type, should be mapped from workout.training_type
        status: 'planned',
        duration: workout.estimated_duration_minutes,
        notes: workout.description || '',
        coachNotes: `Added from library: ${workout.name}`,
        intervals_icu_event_id: response.intervals_icu_sync?.intervalId || undefined
      };

      // Add to local state for immediate UI feedback
      setWorkouts(prevWorkouts => [...prevWorkouts, newWorkout]);
      
      // Show success message (you can add a toast notification here)
      console.log('🦈 Workout assigned successfully!');
      
    } catch (error) {
      console.error('❌ Error adding workout to calendar:', error);
      // You can add error toast notification here
    }
  };

  // Check authentication and coach permissions
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/auth?redirect=/coach');
    }
    // TODO: Add coach role verification here
  }, [isLoading, isLoggedIn, router]);

    // Load athletes list
  useEffect(() => {
    const loadAthletes = async () => {
      try {
        setIsLoadingAthletes(true);
        const response = await fetch('/api/coach/athletes');
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Loaded athletes:', result.data.length);
          setAthletes(result.data);
          
          // Auto-select athlete ID 33 for testing (where we created the test workout)
          if (result.data.length > 0) {
            const testAthlete = result.data.find((athlete: Athlete) => athlete.id === 33) || result.data[0];
            setSelectedAthlete(testAthlete);
          }
        } else {
          console.error('❌ Failed to load athletes:', result.message);
          setAthletes([]); // No fallback to mock data
        }
      } catch (error) {
        console.error('❌ Error loading athletes:', error);
        setAthletes([]); // No fallback to mock data
      } finally {
        setIsLoadingAthletes(false);
      }
    };

    loadAthletes();
  }, []); // Remove selectedAthlete dependency to prevent infinite loop

  // Load workouts for selected athlete
  useEffect(() => {
    const loadWorkouts = async (athleteId: number) => {
      try {
        setIsLoadingWorkouts(true);
        const response = await fetch(`/api/coach/athletes/${athleteId}/workouts`);
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Loaded workouts:', result.data.length);
          setWorkouts(result.data);
        } else {
          console.error('❌ Failed to load workouts:', result.message);
          setWorkouts([]); // No fallback to mock data
        }
      } catch (error) {
        console.error('❌ Error loading workouts:', error);
        setWorkouts([]); // No fallback to mock data
      } finally {
        setIsLoadingWorkouts(false);
      }
    };

    if (selectedAthlete) {
      loadWorkouts(selectedAthlete.id);
    } else {
      setWorkouts([]);
    }
  }, [selectedAthlete]);

  // Handle workout deletion and refresh data
  const handleWorkoutDeleted = async () => {
    if (selectedAthlete) {
      // Reload workouts to reflect the deletion
      try {
        setIsLoadingWorkouts(true);
        const response = await fetch(`/api/coach/athletes/${selectedAthlete.id}/workouts`);
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Refreshed workouts after deletion:', result.data.length);
          setWorkouts(result.data);
        } else {
          console.error('❌ Failed to refresh workouts:', result.message);
        }
      } catch (error) {
        console.error('❌ Error refreshing workouts:', error);
      } finally {
        setIsLoadingWorkouts(false);
      }
    }
  };

  // Loading states
  if (isLoading) {
    return (
      <div className="flex size-full min-h-screen flex-col bg-[#101a23] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <p className="text-white mt-4">{t('common.loading')}</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#101a23] dark justify-between group/design-root overflow-x-hidden">
      {/* Header */}
      <Header user={user} onLogout={logout} />

      {/* Main Content */}
      <main className="flex-grow px-4 py-6 pb-20">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-white text-[32px] font-bold leading-tight tracking-[-0.015em] mb-2">
            {t('coach.title')}
          </h1>
        </div>

        {/* Athlete Selection */}
        <div className="mb-6">
          <AthleteSelector
            athletes={athletes}
            selectedAthlete={selectedAthlete}
            onSelectAthlete={setSelectedAthlete}
            isLoading={isLoadingAthletes}
          />
        </div>

        {/* Action Buttons */}
        <div className="mb-6">
          <button
            onClick={() => setIsWorkoutLibraryOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <span className="text-lg">📚</span>
            Workout Library
          </button>
        </div>

        {/* Main Content Area */}
        {selectedAthlete ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Athlete Profile */}
            <div className="lg:col-span-1">
              <AthleteProfile athlete={selectedAthlete} />
            </div>

            {/* Workout Calendar */}
            <div className="lg:col-span-2">
              <WorkoutCalendar
                workouts={workouts}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                isLoading={isLoadingWorkouts}
                onAddWorkout={handleAddWorkout}
                onWorkoutDeleted={handleWorkoutDeleted}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="text-6xl mb-4">🦈</div>
            <h3 className="text-white text-xl font-semibold mb-2">
              {t('coach.selectAthlete')}
            </h3>
            <p className="text-[#94a3b8] text-base">
              {t('coach.noAthleteSelected')}
            </p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Workout Library Modal */}
      <WorkoutLibrary
        isOpen={isWorkoutLibraryOpen}
        onClose={() => setIsWorkoutLibraryOpen(false)}
        selectedDate={selectedDate}
        onSelectWorkout={(workout) => {
          if (selectedDate && selectedAthlete) {
            handleAddWorkout(workout, selectedDate);
            setIsWorkoutLibraryOpen(false);
          } else {
            alert('Please select an athlete and date first!');
          }
        }}
      />
    </div>
  );
}
