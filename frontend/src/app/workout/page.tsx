'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/app/components/Header';
import BottomNavigation from '@/app/components/BottomNavigation';
import WorkoutMonthlySchedule from '@/app/components/WorkoutMonthlySchedule';
import WorkoutWeeklySchedule from '@/app/components/WorkoutWeeklySchedule';
import WorkoutDetailModal from '@/app/components/WorkoutDetailModal';
import { CalendarWorkout } from '@/types/workout';
import workoutService from '@/services/workoutService';

export default function WorkoutPage() {
  const { user, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [selectedWorkout, setSelectedWorkout] = useState<CalendarWorkout | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  };

  const handleDateSelect = (date: number, workouts: CalendarWorkout[]) => {
    console.log('Selected date:', date, 'with workouts:', workouts);
    if (workouts.length > 0) {
      setSelectedWorkout(workouts[0]); // Show first workout
      setIsModalOpen(true);
    }
  };

  const handleWorkoutSelect = (workout: CalendarWorkout) => {
    setSelectedWorkout(workout);
    setIsModalOpen(true);
  };

  const handleWorkoutStart = async (workout: CalendarWorkout) => {
    try {
      // Update workout status to in_progress
      await workoutService.updateAssignmentStatus(workout.assignment_id, 'in_progress');
      console.log('🚀 Started workout:', workout.name);
      
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
      console.log('✅ Completed workout:', workout.name);
      
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Training Calendar</h1>
          </div>
        </div>

        {/* Monthly Schedule */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Monthly View</h2>
          <WorkoutMonthlySchedule 
            userId={userId}
            currentDate={memoizedCurrentDate}
            onDateSelect={handleDateSelect}
            onMonthChange={handleMonthChange}
          />
        </div>

        {/* Weekly Schedule */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Weekly View</h2>
          <WorkoutWeeklySchedule 
            userId={userId}
            currentWeekStart={memoizedCurrentWeekStart}
            onWeekChange={handleWeekChange}
            onWorkoutSelect={handleWorkoutSelect}
            onWorkoutStart={handleWorkoutStart}
          />
        </div>

        {/* Workout Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <h3 className="text-sm text-slate-400 mb-1">This Week</h3>
            <p className="text-2xl font-bold text-cyan-400">5</p>
            <p className="text-xs text-slate-500">workouts scheduled</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <h3 className="text-sm text-slate-400 mb-1">Completed</h3>
            <p className="text-2xl font-bold text-emerald-400">2</p>
            <p className="text-xs text-slate-500">workouts this week</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <h3 className="text-sm text-slate-400 mb-1">Total Time</h3>
            <p className="text-2xl font-bold text-yellow-400">280</p>
            <p className="text-xs text-slate-500">minutes this week</p>
          </div>
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
    </div>
  );
}