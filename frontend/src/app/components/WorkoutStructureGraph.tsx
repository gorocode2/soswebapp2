'use client';

import React from 'react';
import { WorkoutSegment } from '@/models/types';

interface WorkoutStructureGraphProps {
  segments: WorkoutSegment[];
  primaryControlParameter: 'hr' | 'power';
  width?: number;
  height?: number;
}

interface GraphPoint {
  time: number;
  intensity: number;
  segmentType: string;
  segmentName: string;
}

export default function WorkoutStructureGraph({
  segments,
  primaryControlParameter,
  width = 800,
  height = 200
}: WorkoutStructureGraphProps) {
  // Calculate graph data points
  const calculateGraphPoints = (): GraphPoint[] => {
    const points: GraphPoint[] = [];
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
          points.push({
            time: currentTime,
            intensity,
            segmentType: segment.segment_type,
            segmentName: segment.name
          });
          currentTime += segmentDuration;
          points.push({
            time: currentTime,
            intensity,
            segmentType: segment.segment_type,
            segmentName: segment.name
          });

          // Rest between intervals (except after last rep)
          if (rep < repetitions - 1 && restDuration > 0) {
            points.push({
              time: currentTime,
              intensity: 50, // Recovery intensity
              segmentType: 'rest',
              segmentName: 'Recovery'
            });
            currentTime += restDuration;
            points.push({
              time: currentTime,
              intensity: 50,
              segmentType: 'rest',
              segmentName: 'Recovery'
            });
          }
        }
      } else {
        // Single segment
        points.push({
          time: currentTime,
          intensity,
          segmentType: segment.segment_type,
          segmentName: segment.name
        });
        currentTime += segmentDuration;
        points.push({
          time: currentTime,
          intensity,
          segmentType: segment.segment_type,
          segmentName: segment.name
        });
      }
    });

    return points;
  };

  const points = calculateGraphPoints();
  const totalDuration = Math.max(...points.map(p => p.time));
  const maxIntensity = Math.max(...points.map(p => p.intensity), 100);

  // SVG dimensions and margins
  const margin = { top: 20, right: 40, bottom: 40, left: 50 };
  const graphWidth = width - margin.left - margin.right;
  const graphHeight = height - margin.top - margin.bottom;

  // Scale functions
  const scaleX = (time: number) => (time / totalDuration) * graphWidth;
  const scaleY = (intensity: number) => graphHeight - (intensity / maxIntensity) * graphHeight;

  // Generate path data
  const generatePath = () => {
    if (points.length === 0) return '';
    
    let path = `M ${scaleX(points[0].time)} ${scaleY(points[0].intensity)}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${scaleX(points[i].time)} ${scaleY(points[i].intensity)}`;
    }
    
    return path;
  };

  // Get segment color
  const getSegmentColor = (segmentType: string, intensity: number) => {
    if (intensity === 0) return '#6B7280'; // Gray for no data
    
    switch (segmentType) {
      case 'warmup': return '#3B82F6'; // Blue
      case 'work': 
      case 'main':
        if (intensity >= 90) return '#EF4444'; // Red for high intensity
        if (intensity >= 75) return '#F59E0B'; // Orange for moderate-high
        if (intensity >= 60) return '#10B981'; // Green for moderate
        return '#6366F1'; // Indigo for easy
      case 'rest':
      case 'recovery': return '#22C55E'; // Green
      case 'cooldown': return '#8B5CF6'; // Purple
      default: return '#6B7280'; // Gray
    }
  };

  // Create gradient fills for different intensity zones
  const createGradients = () => {
    const gradients = [];
    for (let i = 0; i < points.length - 1; i++) {
      const point = points[i];
      const color = getSegmentColor(point.segmentType, point.intensity);
      gradients.push(
        <stop
          key={i}
          offset={`${(i / (points.length - 1)) * 100}%`}
          stopColor={color}
          stopOpacity={0.3}
        />
      );
    }
    return gradients;
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

  if (points.length === 0) {
    return (
      <div className="bg-slate-700/30 rounded-lg p-6 text-center">
        <p className="text-slate-400">No workout structure data available</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-white">Workout Structure</h4>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>
            {primaryControlParameter === 'hr' ? 'Heart Rate (% Max HR)' : 'Power (% FTP)'}
          </span>
          <span>Total: {totalDuration} min</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="bg-slate-800/50 rounded">
          <defs>
            <linearGradient id="workoutGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {createGradients()}
            </linearGradient>
          </defs>
          
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
            
            {/* Area fill */}
            <path
              d={`${generatePath()} L ${scaleX(points[points.length - 1].time)} ${graphHeight} L ${scaleX(points[0].time)} ${graphHeight} Z`}
              fill="url(#workoutGradient)"
            />
            
            {/* Main line */}
            <path
              d={generatePath()}
              fill="none"
              stroke="#06B6D4"
              strokeWidth={2}
            />
            
            {/* Data points */}
            {points.map((point, i) => (
              <circle
                key={i}
                cx={scaleX(point.time)}
                cy={scaleY(point.intensity)}
                r={3}
                fill={getSegmentColor(point.segmentType, point.intensity)}
                stroke="#FFFFFF"
                strokeWidth={1}
              >
                <title>
                  {point.segmentName} - {point.time}min - {point.intensity}%
                </title>
              </circle>
            ))}
            
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
            Time (minutes)
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
            {primaryControlParameter === 'hr' ? '% Max HR' : '% FTP'}
          </text>
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-slate-300">Warmup</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-slate-300">High Intensity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-slate-300">Moderate-High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-slate-300">Recovery</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-slate-300">Cooldown</span>
        </div>
      </div>
    </div>
  );
}
