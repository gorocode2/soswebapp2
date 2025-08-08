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
import MonthSelectionModal from './components/MonthSelectionModal';
import WorkoutDetailModal from '../components/WorkoutDetailModal';
import ActivityDetailModal from '@/components/ActivityDetailModal';
import EnhancedMonthlySchedule from '@/components/EnhancedMonthlySchedule';
import EnhancedWeeklySchedule from '@/components/EnhancedWeeklySchedule';
import workoutService from '@/services/workoutService';
import activitiesService, { Activity } from '@/services/activitiesService';
import { CalendarWorkout } from '@/types/workout';

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
  intervalsIcuId?: string;
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
  
  // Calculate Monday of current week for proper week start
  const getMondayOfCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days; otherwise go back (dayOfWeek - 1) days
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysToMonday);
    return monday;
  };
  
  const [currentWeekStart, setCurrentWeekStart] = useState(getMondayOfCurrentWeek());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [isWorkoutLibraryOpen, setIsWorkoutLibraryOpen] = useState(false);
  
  // Activity sync state
  const [isSyncingActivities, setIsSyncingActivities] = useState(false);
  const [activitySyncMessage, setActivitySyncMessage] = useState<string>('');
  const [isMonthSelectionOpen, setIsMonthSelectionOpen] = useState(false);

  // Modal states
  const [selectedWorkout, setSelectedWorkout] = useState<CalendarWorkout | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

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
      return;
    }
    
    // Check if user has coach permissions
    if (!isLoading && isLoggedIn && user && !user.is_coach) {
      router.push('/dashboard'); // Redirect non-coaches to dashboard
      return;
    }
  }, [isLoading, isLoggedIn, user, router]);

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

  // Modal handlers for workout details
  const handleWorkoutSelect = (workout: CalendarWorkout) => {
    setSelectedWorkout(workout);
    setIsModalOpen(true);
  };

  // Enhanced date selection handler for activities and workouts
  const handleEnhancedDateSelect = (dateOrDateNumber: Date | number, activities: Activity[], workouts: CalendarWorkout[]) => {
    // Handle both date formats from monthly and weekly views
    let newDate: Date;
    if (typeof dateOrDateNumber === 'number') {
      // Monthly calendar sends date number
      newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), dateOrDateNumber);
    } else {
      // Weekly calendar sends Date object
      newDate = dateOrDateNumber;
    }
    setSelectedDate(newDate);
    
    // If there are activities, show the first one
    if (activities.length > 0) {
      setSelectedActivity(activities[0]);
      setIsActivityModalOpen(true);
    }
    // Otherwise if there are workouts, show the first one
    else if (workouts.length > 0) {
      setSelectedWorkout(workouts[0]);
      setIsModalOpen(true);
    }
  };

  // Individual item click handlers
  const handleActivityClick = (activity: Activity) => {
    console.log('🦈 Activity clicked:', activity);
    setSelectedActivity(activity);
    setIsActivityModalOpen(true);
  };

  const handleWorkoutClick = (workout: CalendarWorkout) => {
    console.log('💪 Workout clicked:', workout);
    setSelectedWorkout(workout);
    setIsModalOpen(true);
  };

  // Month navigation handler
  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  // Week navigation handler
  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newWeekStart = new Date(currentWeekStart);
    if (direction === 'prev') {
      newWeekStart.setDate(newWeekStart.getDate() - 7);
    } else {
      newWeekStart.setDate(newWeekStart.getDate() + 7);
    }
    setCurrentWeekStart(newWeekStart);
    
    // Update month view if the week spans to a different month
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const newWeekMonth = newWeekStart.getMonth();
    const newWeekYear = newWeekStart.getFullYear();
    
    if (currentMonth !== newWeekMonth || currentYear !== newWeekYear) {
      setSelectedDate(new Date(newWeekYear, newWeekMonth, 1));
    }
  };

  // Activity modal handlers
  const handleActivityClose = () => {
    setIsActivityModalOpen(false);
    setSelectedActivity(null);
  };

  const handleWorkoutStart = async (workout: CalendarWorkout) => {
    try {
      // Update workout status to in_progress
      await workoutService.updateAssignmentStatus(workout.assignment_id, 'in_progress');
      
      // Show success message
      alert(`🦈 Started ${workout.name}! Let's dominate this workout! 💪`);
      
      // Refresh workouts
      await handleWorkoutDeleted();
    } catch (error) {
      console.error('Error starting workout:', error);
      alert('Failed to start workout. Please try again.');
    }
  };

  const handleWorkoutComplete = async (workout: CalendarWorkout) => {
    try {
      // Update workout status to completed
      await workoutService.updateAssignmentStatus(
        workout.assignment_id, 
        'completed',
        'Workout completed successfully! Great job!'
      );
      
      // Show success message
      alert(`🎉 Workout completed! Your athlete crushed ${workout.name}! 🦈💪`);
      
      // Refresh workouts
      await handleWorkoutDeleted();
    } catch (error) {
      console.error('Error completing workout:', error);
      alert('Failed to mark workout as complete. Please try again.');
    }
  };

  const handleWorkoutEdit = async (workout: CalendarWorkout) => {
    // For now, just show an alert. Later this could open an edit modal
    alert(`Edit functionality for "${workout.name}" will be implemented in a future update.`);
  };

  const handleWorkoutRemove = async (workout: CalendarWorkout) => {
    try {
      // Call the backend to remove the workout assignment
      const response = await fetch(`/api/coach/workout-assignments/${workout.assignment_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        // Show success message
        alert(`🦈 Workout "${workout.name}" has been removed successfully!`);
        
        // Refresh workouts to reflect the deletion
        await handleWorkoutDeleted();
      } else {
        throw new Error(result.message || 'Failed to remove workout');
      }
    } catch (error) {
      console.error('Error removing workout:', error);
      throw error; // Re-throw to be caught by the modal
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWorkout(null);
  };

  // Activity sync handler - opens month selection modal
  const handleSyncActivities = async () => {
    if (!selectedAthlete?.id) {
      setActivitySyncMessage('❌ Please select an athlete first');
      setTimeout(() => setActivitySyncMessage(''), 3000);
      return;
    }

    // Open month selection modal
    setIsMonthSelectionOpen(true);
  };

  // Handle month selection and perform actual sync
  const handleMonthSelection = async (year: number, month: number) => {
    if (!selectedAthlete?.intervalsIcuId) {
      setActivitySyncMessage('❌ Selected athlete does not have intervals.icu ID configured');
      setTimeout(() => setActivitySyncMessage(''), 5000);
      return;
    }

    setIsSyncingActivities(true);
    setActivitySyncMessage(`🦈 Syncing activities from ${getMonthName(month)} ${year}...`);

    try {
      // Calculate date range for the selected month
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

      const response = await fetch(`/api/activities/sync-intervals-icu/${selectedAthlete.intervalsIcuId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRange: {
            oldest: startDate,
            newest: endDate
          }
        }),
      });

      const result = await response.json();

      if (result.success) {
        setActivitySyncMessage(`✅ ${result.message}`);
        console.log('🦈 Activities synced successfully:', result);
        
        // Clear success message after 5 seconds
        setTimeout(() => setActivitySyncMessage(''), 5000);
      } else {
        setActivitySyncMessage(`❌ ${result.message}`);
        setTimeout(() => setActivitySyncMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error syncing activities:', error);
      setActivitySyncMessage('❌ Failed to sync activities from intervals.icu');
      setTimeout(() => setActivitySyncMessage(''), 5000);
    } finally {
      setIsSyncingActivities(false);
    }
  };

  // Helper function to get month name
  const getMonthName = (month: number): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
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
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setIsWorkoutLibraryOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-lg">📚</span>
              Workout Library
            </button>

            <button
              onClick={handleSyncActivities}
              disabled={isSyncingActivities || !selectedAthlete}
              className={`px-6 py-3 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 ${
                isSyncingActivities || !selectedAthlete
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
              }`}
              title={!selectedAthlete ? 'Select an athlete first' : 'Sync activities from intervals.icu'}
            >
              <span className="text-lg">🏃‍♂️</span>
              {isSyncingActivities ? 'Syncing...' : 'Update Activities'}
            </button>
          </div>

          {/* Activity sync message */}
          {activitySyncMessage && (
            <div className="mt-3 p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
              <p className="text-sm text-white">{activitySyncMessage}</p>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        {selectedAthlete ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Athlete Profile */}
              <div className="lg:col-span-1">
                <AthleteProfile athlete={selectedAthlete} />
              </div>

              {/* Enhanced Monthly Calendar */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">📅 Monthly View</h3>
                  <EnhancedMonthlySchedule
                    userId={selectedAthlete?.id}
                    currentDate={selectedDate}
                    currentWeekStart={currentWeekStart}
                    onDateSelect={handleEnhancedDateSelect}
                    onMonthChange={handleMonthChange}
                    onWeekChange={setCurrentWeekStart}
                    onActivityClick={handleActivityClick}
                    onWorkoutClick={handleWorkoutClick}
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Weekly Calendar - Full Width */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">📊 Weekly View</h3>
              <EnhancedWeeklySchedule
                userId={selectedAthlete?.id}
                currentWeekStart={currentWeekStart}
                onDateSelect={handleEnhancedDateSelect}
                onWeekChange={handleWeekChange}
                onActivityClick={handleActivityClick}
                onWorkoutClick={handleWorkoutClick}
              />
            </div>
          </>
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

      {/* Month Selection Modal */}
      <MonthSelectionModal
        isOpen={isMonthSelectionOpen}
        onClose={() => setIsMonthSelectionOpen(false)}
        onConfirm={handleMonthSelection}
      />

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <WorkoutDetailModal
          workout={selectedWorkout}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStartWorkout={handleWorkoutStart}
          onCompleteWorkout={handleWorkoutComplete}
          onEditWorkout={handleWorkoutEdit}
          onRemoveWorkout={handleWorkoutRemove}
          showCoachActions={true}
        />
      )}

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={isActivityModalOpen}
        onClose={handleActivityClose}
      />
    </div>
  );
}
