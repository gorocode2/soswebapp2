'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/app/components/Header';
import BottomNavigation from '@/app/components/BottomNavigation';
import { WorkoutMonthlySchedule, WorkoutWeeklySchedule } from './components';
import EnhancedMonthlySchedule from '@/components/EnhancedMonthlySchedule';
import EnhancedWeeklySchedule from '@/components/EnhancedWeeklySchedule';
import WorkoutDetailModal from '@/app/components/WorkoutDetailModal';
import ActivityDetailModal from '@/components/ActivityDetailModal';
import { CalendarWorkout } from '@/types/workout';
import { Activity } from '@/services/activitiesService';
import workoutService from '@/services/workoutService';

export default function WorkoutPage() {
  const { user, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [selectedWorkout, setSelectedWorkout] = useState<CalendarWorkout | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  // Get current user ID (defaulting to 34 for testing)
  const userId = user?.id || 34;

  // Memoize dates to prevent unnecessary re-renders
  const memoizedCurrentDate = useMemo(() => currentDate, [currentDate]);
  const memoizedCurrentWeekStart = useMemo(() => currentWeekStart, [currentWeekStart]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newWeekStart = new Date(currentWeekStart);
    if (direction === 'prev') {
      newWeekStart.setDate(newWeekStart.getDate() - 7);
    } else {
      newWeekStart.setDate(newWeekStart.getDate() + 7);
    }
    setCurrentWeekStart(newWeekStart);
    
    // Update month view if the week spans to a different month
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const newWeekMonth = newWeekStart.getMonth();
    const newWeekYear = newWeekStart.getFullYear();
    
    if (currentMonth !== newWeekMonth || currentYear !== newWeekYear) {
      setCurrentDate(new Date(newWeekYear, newWeekMonth, 1));
    }
  };

  // Enhanced date selection for both activities and workouts
  const handleEnhancedDateSelect = (dateOrDateNumber: Date | number, activities: Activity[], workouts: CalendarWorkout[]) => {
    // Handle both date formats from monthly and weekly views
    const selectedDate = typeof dateOrDateNumber === 'number' 
      ? new Date(currentDate.getFullYear(), currentDate.getMonth(), dateOrDateNumber)
      : dateOrDateNumber;
    
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

  const handleDateSelect = (date: number, workouts: CalendarWorkout[]) => {
    if (workouts.length > 0) {
      setSelectedWorkout(workouts[0]); // Show first workout
      setIsModalOpen(true);
    }
  };

  // Activity modal handlers
  const handleActivityClose = () => {
    setIsActivityModalOpen(false);
    setSelectedActivity(null);
  };

  // Individual item click handlers (same as coach page)
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

  const handleWorkoutSelect = (workout: CalendarWorkout) => {
    setSelectedWorkout(workout);
    setIsModalOpen(true);
  };

  const handleWorkoutStart = async (workout: CalendarWorkout) => {
    try {
      // Update workout status to in_progress
      await workoutService.updateAssignmentStatus(workout.assignment_id, 'in_progress');
      
      // You could redirect to a workout execution page here
      // router.push(`/workout/execute/${workout.assignment_id}`);
      
      // For now, just show a success message
      alert(`🦈 Started ${workout.name}! Time to dominate this workout! 💪`);
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
      alert(`🎉 Workout completed! You crushed ${workout.name}! 🦈💪`);
      
      // Refresh the data (you might want to add a refresh function to the components)
      window.location.reload();
    } catch (error) {
      console.error('Error completing workout:', error);
      alert('Failed to mark workout as complete. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWorkout(null);
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header user={user} onLogout={logout} />
      
      <main className="layout-content-container flex flex-col flex-1 p-4 pb-20">
        {/* Page Header */}

        {/* Enhanced Monthly Schedule */}
        <div className="mb-8">
          <EnhancedMonthlySchedule 
            userId={userId}
            currentDate={memoizedCurrentDate}
            currentWeekStart={memoizedCurrentWeekStart}
            onDateSelect={handleEnhancedDateSelect}
            onMonthChange={handleMonthChange}
            onWeekChange={setCurrentWeekStart}
            onActivityClick={handleActivityClick}
            onWorkoutClick={handleWorkoutClick}
          />
        </div>

        {/* Enhanced Weekly Schedule */}
        <div className="mb-8">
          <EnhancedWeeklySchedule 
            userId={userId}
            currentWeekStart={memoizedCurrentWeekStart}
            onDateSelect={handleEnhancedDateSelect}
            onWeekChange={handleWeekChange}
            onActivityClick={handleActivityClick}
            onWorkoutClick={handleWorkoutClick}
          />
        </div>
      </main>
      
      <BottomNavigation />

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <WorkoutDetailModal
          workout={selectedWorkout}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStartWorkout={handleWorkoutStart}
          onCompleteWorkout={handleWorkoutComplete}
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