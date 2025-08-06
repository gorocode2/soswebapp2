/**
 * 🦈 Activity Detail Modal - School of Sharks AI Platform
 * Shows detailed information about a completed activity
 */

'use client';

import React from 'react';
import { Activity } from '@/services/activitiesService';
import activitiesService from '@/services/activitiesService';

interface ActivityDetailModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ActivityDetailModal({
  activity,
  isOpen,
  onClose
}: ActivityDetailModalProps) {
  if (!isOpen || !activity) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPace = (speed: number | undefined) => {
    if (!speed) return 'N/A';
    // Convert m/s to min/km for running/cycling pace
    const kmh = speed * 3.6;
    const minPerKm = 60 / kmh;
    const minutes = Math.floor(minPerKm);
    const seconds = Math.round((minPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {activitiesService.getActivityIcon(activity.activity_type)}
              </span>
              <div>
                <h2 className="text-2xl font-bold">{activity.name}</h2>
                <p className="text-blue-100">{formatDate(activity.start_date_local)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Activity Type and Source */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${activitiesService.getActivityColor(activity.activity_type)}`}>
                {activity.activity_type}
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                📱 {activity.source}
              </span>
              {activity.trainer && (
                <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm">
                  🏠 Indoor
                </span>
              )}
            </div>
            {activity.description && (
              <p className="text-gray-600 text-sm">{activity.description}</p>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {activitiesService.formatDuration(activity.elapsed_time || activity.moving_time)}
              </div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
            
            {activity.distance && (
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {activitiesService.formatDistance(activity.distance)}
                </div>
                <div className="text-sm text-gray-600">Distance</div>
              </div>
            )}

            {typeof activity.average_speed === 'number' && !isNaN(activity.average_speed) ? (
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(activity.average_speed * 3.6).toFixed(1)} km/h
                </div>
                <div className="text-sm text-gray-600">Avg Speed</div>
              </div>
            ) : null}

            {activity.elevation_gain && (
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(activity.elevation_gain)}m
                </div>
                <div className="text-sm text-gray-600">Elevation</div>
              </div>
            )}
          </div>

          {/* Power & Heart Rate Data */}
          {(activity.has_power_data || activity.has_heartrate) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Performance Data</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {activity.has_power_data && activity.average_watts && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-red-600">{activity.average_watts}W</div>
                    <div className="text-sm text-gray-600">Avg Power</div>
                  </div>
                )}

                {activity.has_power_data && activity.max_watts && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-red-600">{activity.max_watts}W</div>
                    <div className="text-sm text-gray-600">Max Power</div>
                  </div>
                )}

                {activity.has_power_data && activity.normalized_power && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-red-600">{Math.round(activity.normalized_power)}W</div>
                    <div className="text-sm text-gray-600">Normalized Power</div>
                  </div>
                )}

                {activity.has_heartrate && activity.average_heartrate && (
                  <div className="bg-pink-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-pink-600">{activity.average_heartrate} bpm</div>
                    <div className="text-sm text-gray-600">Avg HR</div>
                  </div>
                )}

                {activity.has_heartrate && activity.max_heartrate && (
                  <div className="bg-pink-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-pink-600">{activity.max_heartrate} bpm</div>
                    <div className="text-sm text-gray-600">Max HR</div>
                  </div>
                )}

                {activity.average_cadence && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-yellow-600">{activity.average_cadence} rpm</div>
                    <div className="text-sm text-gray-600">Avg Cadence</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Training Load & Stress */}
          {(activity.training_load || activity.training_stress_score || activity.intensity_factor) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Training Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {activity.training_load && (
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-indigo-600">{Math.round(activity.training_load)}</div>
                    <div className="text-sm text-gray-600">Training Load</div>
                  </div>
                )}

                {activity.training_stress_score && (
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-indigo-600">{Math.round(activity.training_stress_score)}</div>
                    <div className="text-sm text-gray-600">TSS</div>
                  </div>
                )}

                {typeof activity.intensity_factor === 'number' && !isNaN(activity.intensity_factor) ? (
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-indigo-600">{activity.intensity_factor.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">IF</div>
                  </div>
                ) : null}

                {activity.calories && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{activity.calories}</div>
                    <div className="text-sm text-gray-600">Calories</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Equipment & Environment */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Equipment & Environment</h3>
            <div className="space-y-2 text-sm">
              {activity.device_name && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Device:</span>
                  <span className="font-medium">{activity.device_name}</span>
                </div>
              )}
              
              {activity.power_meter && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Power Meter:</span>
                  <span className="font-medium">{activity.power_meter}</span>
                </div>
              )}

              {activity.average_temp && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Temperature:</span>
                  <span className="font-medium">{activity.average_temp}°C</span>
                </div>
              )}

              {activity.timezone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Timezone:</span>
                  <span className="font-medium">{activity.timezone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
            <div className="flex justify-between">
              <span>Activity ID: {activity.intervals_icu_id}</span>
              {activity.analyzed_at && (
                <span>Analyzed: {new Date(activity.analyzed_at).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
