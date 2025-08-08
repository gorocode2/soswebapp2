/**
 * 🦈 Activity Calendar Day Component - School of Sharks AI Platform
 * Displays activities and workouts for a specific calendar day
 */

'use client';

import React from 'react';
import { Activity } from '@/services/activitiesService';
import { CalendarWorkout } from '@/types/workout';
import activitiesService from '@/services/activitiesService';

interface ActivityCalendarDayProps {
  date: number;
  activities: Activity[];
  workouts: CalendarWorkout[];
  isToday: boolean;
  isCurrentMonth: boolean;
  isInCurrentWeek?: boolean; // New prop for week highlighting
  onClick: (date: number, activities: Activity[], workouts: CalendarWorkout[]) => void;
  onActivityClick?: (activity: Activity) => void;
  onWorkoutClick?: (workout: CalendarWorkout) => void;
}

export default function ActivityCalendarDay({
  date,
  activities,
  workouts,
  isToday,
  isCurrentMonth,
  isInCurrentWeek = false,
  onClick,
  onActivityClick,
  onWorkoutClick
}: ActivityCalendarDayProps) {
  const handleClick = () => {
    onClick(date, activities, workouts);
  };

  const hasItems = activities.length > 0 || workouts.length > 0;

  return (
    <div
      className={`
        min-h-[80px] p-1 border border-gray-100 transition-all duration-200
        ${isCurrentMonth ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}
        ${isToday ? 'bg-blue-50 border-blue-300' : ''}
        ${isInCurrentWeek && !isToday && isCurrentMonth ? 'bg-indigo-25 border-indigo-200 ring-1 ring-indigo-200' : ''}
        ${!isCurrentMonth ? 'opacity-40 bg-gray-25' : ''}
        ${hasItems && isCurrentMonth ? 'bg-gradient-to-br from-blue-25 to-cyan-25' : ''}
      `}
      onClick={isCurrentMonth ? handleClick : undefined}
    >
      {/* Date Number */}
      <div className={`
        text-sm font-medium mb-1
        ${isToday ? 'text-blue-600' : 'text-gray-700'}
        ${!isCurrentMonth ? 'text-gray-400' : ''}
      `}>
        {date}
      </div>

      {/* Activities */}
      <div className="space-y-1">
        {activities.slice(0, 2).map((activity, index) => (
          <div
            key={`activity-${activity.id}-${index}`}
            className={`
              text-xs px-1 py-0.5 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity
              ${activitiesService.getActivityColor(activity.activity_type)}
            `}
            title={`${activity.name} - ${activitiesService.formatDuration(activity.elapsed_time || activity.moving_time)}`}
            onClick={(e) => {
              e.stopPropagation();
              onActivityClick?.(activity);
            }}
          >
            <div className="flex items-center gap-1">
              <span className="text-[10px]">
                {activitiesService.getActivityIcon(activity.activity_type)}
              </span>
              <span className="truncate">
                {activity.name.length > 12 ? `${activity.name.substring(0, 12)}...` : activity.name}
              </span>
            </div>
          </div>
        ))}

        {/* Workouts */}
        {workouts.slice(0, isCurrentMonth ? (2 - activities.slice(0, 2).length) : 0).map((workout, index) => (
          <div
            key={`workout-${workout.id}-${index}`}
            className={`
              text-xs px-1 py-0.5 rounded border truncate cursor-pointer hover:opacity-80 transition-opacity
              ${workout.status === 'completed' ? 'bg-green-100 border-green-300 text-green-700' :
                workout.status === 'in_progress' ? 'bg-yellow-100 border-yellow-300 text-yellow-700' :
                workout.status === 'cancelled' ? 'bg-red-100 border-red-300 text-red-700' :
                'bg-blue-100 border-blue-300 text-blue-700'}
            `}
            title={`${workout.name} - ${workout.duration}min`}
            onClick={(e) => {
              e.stopPropagation();
              onWorkoutClick?.(workout);
            }}
          >
            <div className="flex items-center gap-1">
              <span className="text-[10px]">💪</span>
              <span className="truncate">
                {workout.name.length > 10 ? `${workout.name.substring(0, 10)}...` : workout.name}
              </span>
            </div>
          </div>
        ))}

        {/* More indicator */}
        {(activities.length + workouts.length) > 2 && (
          <div className="text-xs text-gray-500 font-medium">
            +{(activities.length + workouts.length) - 2} more
          </div>
        )}
      </div>
    </div>
  );
}
