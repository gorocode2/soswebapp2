'use client';

import React from 'react';
import { WorkoutSegment } from '@/models/types';
import { useTranslation } from '@/i18n';

interface WorkoutStructureGraphProps {
  segments: WorkoutSegment[];
  primaryControlParameter: 'hr' | 'power';
  width?: number;
  height?: number;
}

interface GraphSegment {
  startTime: number;
  duration: number;
  intensity: number;
  segmentType: string;
  segmentName: string;
  repetitions: number;
}

export default function WorkoutStructureGraph({
  segments,
  primaryControlParameter,
  width = 800,
  height = 200
}: WorkoutStructureGraphProps) {
  const { t } = useTranslation();
  
  // Calculate graph segments for bar display
  const calculateGraphSegments = (): GraphSegment[] => {
    const graphSegments: GraphSegment[] = [];
    let currentTime = 0;

    segments.forEach((segment) => {
      const segmentDuration = segment.duration_minutes || 0;
      const repetitions = segment.repetitions || 1;
      const restDuration = segment.rest_duration_minutes || 0;

      // Get intensity based on control parameter
      let minIntensity = 0;
      let maxIntensity = 0;

      if (primaryControlParameter === 'hr') {
        minIntensity = segment.hr_min_percent || 0;
        maxIntensity = segment.hr_max_percent || segment.hr_min_percent || 0;
      } else {
        minIntensity = segment.power_min_percent || 0;
        maxIntensity = segment.power_max_percent || segment.power_min_percent || 0;
      }

      // Use average intensity for display
      const intensity = maxIntensity > 0 ? (minIntensity + maxIntensity) / 2 : minIntensity;

      if (repetitions > 1) {
        // Handle intervals
        for (let rep = 0; rep < repetitions; rep++) {
          // Work interval
          graphSegments.push({
            startTime: currentTime,
            duration: segmentDuration,
            intensity,
            segmentType: segment.segment_type,
            segmentName: segment.name,
            repetitions: 1
          });
          currentTime += segmentDuration;

          // Rest between intervals (except after last rep)
          if (rep < repetitions - 1 && restDuration > 0) {
            graphSegments.push({
              startTime: currentTime,
              duration: restDuration,
              intensity: 50, // Recovery intensity
              segmentType: 'rest',
              segmentName: 'Recovery',
              repetitions: 1
            });
            currentTime += restDuration;
          }
        }
      } else {
        // Single segment
        graphSegments.push({
          startTime: currentTime,
          duration: segmentDuration,
          intensity,
          segmentType: segment.segment_type,
          segmentName: segment.name,
          repetitions: 1
        });
        currentTime += segmentDuration;
      }
    });

    return graphSegments;
  };

  const graphSegments = calculateGraphSegments();
  const totalDuration = Math.max(...graphSegments.map(s => s.startTime + s.duration));
  const maxIntensity = Math.max(...graphSegments.map(s => s.intensity), 100);

  // SVG dimensions and margins
  const margin = { top: 20, right: 40, bottom: 40, left: 50 };
  const graphWidth = width - margin.left - margin.right;
  const graphHeight = height - margin.top - margin.bottom;

  // Scale functions
  const scaleX = (time: number) => (time / totalDuration) * graphWidth;
  const scaleY = (intensity: number) => graphHeight - (intensity / maxIntensity) * graphHeight;
  const scaleWidth = (duration: number) => (duration / totalDuration) * graphWidth;

  // Get intensity-based color
  const getIntensityColor = (intensity: number): string => {
    if (intensity === 0) return '#6B7280'; // Gray for no data
    if (intensity >= 90) return '#EF4444'; // Red for very high (≥90%)
    if (intensity >= 75) return '#F59E0B'; // Orange for high (75-89%)
    if (intensity >= 60) return '#EAB308'; // Yellow for mid (60-74%)
    return '#22C55E'; // Green for low (<60%)
  };

  // Time axis labels
  const timeLabels = [];
  const labelInterval = Math.ceil(totalDuration / 8); // Show ~8 labels
  for (let time = 0; time <= totalDuration; time += labelInterval) {
    timeLabels.push(
      <g key={time}>
        <line
          x1={scaleX(time)}
          y1={graphHeight}
          x2={scaleX(time)}
          y2={graphHeight + 5}
          stroke="#6B7280"
          strokeWidth={1}
        />
        <text
          x={scaleX(time)}
          y={graphHeight + 20}
          textAnchor="middle"
          fontSize={12}
          fill="#9CA3AF"
        >
          {time}m
        </text>
      </g>
    );
  }

  // Intensity axis labels
  const intensityLabels = [];
  const intensityInterval = Math.ceil(maxIntensity / 5); // Show ~5 labels
  for (let intensity = 0; intensity <= maxIntensity; intensity += intensityInterval) {
    intensityLabels.push(
      <g key={intensity}>
        <line
          x1={-5}
          y1={scaleY(intensity)}
          x2={0}
          y2={scaleY(intensity)}
          stroke="#6B7280"
          strokeWidth={1}
        />
        <text
          x={-10}
          y={scaleY(intensity) + 4}
          textAnchor="end"
          fontSize={12}
          fill="#9CA3AF"
        >
          {intensity}%
        </text>
      </g>
    );
  }

  if (graphSegments.length === 0) {
    return (
      <div className="bg-slate-700/30 rounded-lg p-6 text-center">
        <p className="text-slate-400">{t('workout.noStructure')}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-white">{t('workout.graph.title')}</h4>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>
            {primaryControlParameter === 'hr' ? t('workout.graph.heartRate') : t('workout.graph.power')}
          </span>
          <span>{t('workout.graph.total')}: {totalDuration} {t('time.minutes')}</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="bg-slate-800/50 rounded">
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Grid lines */}
            {intensityLabels.map((_, i) => (
              <line
                key={`grid-y-${i}`}
                x1={0}
                y1={scaleY(i * intensityInterval)}
                x2={graphWidth}
                y2={scaleY(i * intensityInterval)}
                stroke="#374151"
                strokeWidth={0.5}
                strokeDasharray="2,2"
              />
            ))}
            
            {timeLabels.map((_, i) => (
              <line
                key={`grid-x-${i}`}
                x1={scaleX(i * labelInterval)}
                y1={0}
                x2={scaleX(i * labelInterval)}
                y2={graphHeight}
                stroke="#374151"
                strokeWidth={0.5}
                strokeDasharray="2,2"
              />
            ))}
            
            {/* Intensity bars */}
            {graphSegments.map((segment, i) => {
              const barX = scaleX(segment.startTime);
              const barWidth = scaleWidth(segment.duration);
              const barHeight = graphHeight - scaleY(segment.intensity);
              const barY = scaleY(segment.intensity);
              const color = getIntensityColor(segment.intensity);
              
              return (
                <g key={i}>
                  {/* Bar */}
                  <rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={color}
                    stroke="#FFFFFF"
                    strokeWidth={0.5}
                    opacity={0.8}
                  >
                    <title>
                      {segment.segmentName} - {segment.startTime}-{segment.startTime + segment.duration}min - {segment.intensity}%
                    </title>
                  </rect>
                  
                  {/* Segment label (show on wider bars) */}
                  {barWidth > 30 && (
                    <text
                      x={barX + barWidth / 2}
                      y={barY + barHeight / 2}
                      textAnchor="middle"
                      fontSize={10}
                      fill="#FFFFFF"
                      fontWeight="500"
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
                    >
                      {segment.intensity}%
                    </text>
                  )}
                </g>
              );
            })}
            
            {/* Axes */}
            <line
              x1={0}
              y1={graphHeight}
              x2={graphWidth}
              y2={graphHeight}
              stroke="#6B7280"
              strokeWidth={1}
            />
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={graphHeight}
              stroke="#6B7280"
              strokeWidth={1}
            />
            
            {/* Axis labels */}
            {timeLabels}
            {intensityLabels}
          </g>
          
          {/* Axis titles */}
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            fontSize={14}
            fill="#9CA3AF"
            fontWeight="500"
          >
            {t('workout.graph.timeAxis')}
          </text>
          
          <text
            x={15}
            y={height / 2}
            textAnchor="middle"
            fontSize={14}
            fill="#9CA3AF"
            fontWeight="500"
            transform={`rotate(-90, 15, ${height / 2})`}
          >
            {primaryControlParameter === 'hr' ? t('workout.graph.intensityAxis') : t('workout.graph.powerAxis')}
          </text>
        </svg>
      </div>
      
      {/* Updated Legend for intensity-based colors */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-slate-300">{t('workout.graph.intensityLevels.low')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500"></div>
          <span className="text-slate-300">{t('workout.graph.intensityLevels.mid')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-500"></div>
          <span className="text-slate-300">{t('workout.graph.intensityLevels.high')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-slate-300">{t('workout.graph.intensityLevels.veryHigh')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-500"></div>
          <span className="text-slate-300">{t('workout.graph.intensityLevels.noData')}</span>
        </div>
      </div>
    </div>
  );
}
