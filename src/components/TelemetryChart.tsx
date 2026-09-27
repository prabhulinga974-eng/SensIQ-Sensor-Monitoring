/**
 * Telemetry Time-Series Waveform Visualizer
 * Renders SVG curves for Ideal Physics Baseline vs. Raw Transducer vs. Module Calibrated Reading.
 * Features interactive crosshair probe and stream rate controls.
 */
import React, { useState, useMemo } from 'react';
import { Equipment, TelemetryPoint } from '../types/telemetry';
import { Crosshair, Play, Pause, ChevronRight } from 'lucide-react';

interface TelemetryChartProps {
  equipment: Equipment;
  telemetryHistory: TelemetryPoint[];
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onStepTick: () => void;
  streamSpeed: number;
  onChangeSpeed: (speed: number) => void;
  showRawLine: boolean;
  onToggleShowRaw: () => void;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  equipment,
  telemetryHistory,
  isStreaming,
  onToggleStreaming,
  onStepTick,
  streamSpeed,
  onChangeSpeed,
  showRawLine,
  onToggleShowRaw,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const primaryVar = equipment.primaryVariable;
  const decimals = primaryVar.precisionDecimals;

  // Compute dynamic scale boundaries with padding
  const { minVal, maxVal, pathIdeal, pathRaw, pathModule } = useMemo(() => {
    if (telemetryHistory.length === 0) {
      return {
        minVal: primaryVar.min,
        maxVal: primaryVar.max,
        pathIdeal: '',
        pathRaw: '',
        pathModule: '',
      };
    }

    let min = Infinity;
    let max = -Infinity;

    telemetryHistory.forEach((pt) => {
      min = Math.min(min, pt.idealValue, pt.moduleCalibratedValue, pt.rawSensorValue);
      max = Math.max(max, pt.idealValue, pt.moduleCalibratedValue, pt.rawSensorValue);
    });

    // Provide 12% headroom
    const range = Math.max(0.2, max - min);
    const chartMin = Math.max(primaryVar.min, min - range * 0.12);
    const chartMax = Math.min(primaryVar.max, max + range * 0.12);

    const width = 1000;
    const height = 300;
    const padding = { top: 20, right: 25, bottom: 35, left: 60 };

    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const scaleX = (index: number) =>
      padding.left + (index / Math.max(1, telemetryHistory.length - 1)) * innerWidth;
    const scaleY = (val: number) => {
      const clamped = Math.max(chartMin, Math.min(chartMax, val));
      const normalized = (clamped - chartMin) / (chartMax - chartMin);
      return padding.top + innerHeight - normalized * innerHeight;
    };

    let pIdeal = '';
    let pRaw = '';
    let pModule = '';

    telemetryHistory.forEach((pt, i) => {
      const x = scaleX(i);
      const yIdeal = scaleY(pt.idealValue);
      const yRaw = scaleY(pt.rawSensorValue);
      const yModule = scaleY(pt.moduleCalibratedValue);

      if (i === 0) {
        pIdeal = `M ${x.toFixed(1)} ${yIdeal.toFixed(1)}`;
        pRaw = `M ${x.toFixed(1)} ${yRaw.toFixed(1)}`;
        pModule = `M ${x.toFixed(1)} ${yModule.toFixed(1)}`;
      } else {
        pIdeal += ` L ${x.toFixed(1)} ${yIdeal.toFixed(1)}`;
        pRaw += ` L ${x.toFixed(1)} ${yRaw.toFixed(1)}`;
        pModule += ` L ${x.toFixed(1)} ${yModule.toFixed(1)}`;
      }
    });

    return {
      minVal: chartMin,
      maxVal: chartMax,
      pathIdeal: pIdeal,
      pathRaw: pRaw,
      pathModule: pModule,
    };
  }, [telemetryHistory, primaryVar]);

  const latestPoint = telemetryHistory[telemetryHistory.length - 1] || {
    idealValue: 0,
    rawSensorValue: 0,
    moduleCalibratedValue: 0,
    residualError: 0,
    timeFormatted: '--:--:--',
  };

  const activePoint = hoveredIndex !== null && telemetryHistory[hoveredIndex]
    ? telemetryHistory[hoveredIndex]
    : latestPoint;

  return (
    <div className="w-full rounded-lg border border-slate-800 bg-slate-900/60 p-4 sm:p-5 flex flex-col gap-4">
      {/* Top Header: Title and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100">
              Live Stream & Physics Comparison
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {equipment.name}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Differentiating server ideal parameter model against module received data
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3.5 h-0.5 border-t-2 border-dashed border-cyan-400" />
            <span>Ideal Physics (Ground Truth)</span>
          </div>

          <button
            onClick={onToggleShowRaw}
            className={`flex items-center gap-1.5 transition-opacity ${
              showRawLine ? 'opacity-100 text-amber-300' : 'opacity-40 text-slate-500'
            }`}
            title="Toggle Raw Transducer curve"
          >
            <span className="w-3.5 h-0.5 border-t-2 border-dotted border-amber-400" />
            <span>Raw Transducer ({showRawLine ? 'Visible' : 'Hidden'})</span>
          </button>

          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-3.5 h-0.5 bg-emerald-400 rounded-full" />
            <span>Module Received Value</span>
          </div>
        </div>
      </div>

      {/* Numerical Telemetry Readout Tray */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 rounded-md p-3 border border-slate-800/60">
        <div>
          <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
            Ideal Physics Target
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold font-mono tabular-nums text-cyan-300">
              {activePoint.idealValue.toFixed(decimals)}
            </span>
            <span className="text-xs font-mono text-slate-400">{primaryVar.unit}</span>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
            Module Received Reading
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold font-mono tabular-nums text-emerald-300">
              {activePoint.moduleCalibratedValue.toFixed(decimals)}
            </span>
            <span className="text-xs font-mono text-slate-400">{primaryVar.unit}</span>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Residual Error (Δ)
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-lg font-bold font-mono tabular-nums ${
                Math.abs(activePoint.residualError) > (primaryVar.max - primaryVar.min) * 0.05
                  ? 'text-rose-400'
                  : 'text-slate-200'
              }`}
            >
              {activePoint.residualError >= 0 ? '+' : ''}
              {activePoint.residualError.toFixed(decimals)}
            </span>
            <span className="text-xs font-mono text-slate-400">{primaryVar.unit}</span>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Telemetry Timestamp
          </div>
          <div className="text-base font-mono tabular-nums text-slate-300 mt-1">
            {activePoint.timeFormatted}
          </div>
        </div>
      </div>

      {/* SVG Canvas Chart */}
      <div className="relative w-full h-[280px] bg-slate-950/80 rounded border border-slate-800/80 overflow-hidden select-none">
        <svg
          viewBox="0 0 1000 300"
          className="w-full h-full"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoveredIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const frac = Math.max(0, Math.min(1, (mouseX - (60 / 1000) * rect.width) / ((915 / 1000) * rect.width)));
            const idx = Math.round(frac * (telemetryHistory.length - 1));
            setHoveredIndex(idx);
          }}
        >
          <defs>
            <linearGradient id="idealGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="moduleGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines and Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
            const y = 20 + (1 - frac) * (300 - 55);
            const val = minVal + frac * (maxVal - minVal);
            return (
              <g key={idx}>
                <line
                  x1="55"
                  y1={y}
                  x2="975"
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x="48"
                  y={y + 4}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {val.toFixed(decimals)}
                </text>
              </g>
            );
          })}

          {/* Time axis ticks */}
          {telemetryHistory.length > 1 &&
            [0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
              const x = 60 + frac * (1000 - 85);
              const sampleIdx = Math.min(
                telemetryHistory.length - 1,
                Math.round(frac * (telemetryHistory.length - 1))
              );
              const pt = telemetryHistory[sampleIdx];
              return (
                <text
                  key={idx}
                  x={x}
                  y="285"
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {pt ? pt.timeFormatted : ''}
                </text>
              );
            })}

          {/* Ideal Physics Baseline Curve (Dashed Cyan) */}
          <path
            d={pathIdeal}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            strokeDasharray="5 4"
            strokeLinecap="round"
          />

          {/* Raw Transducer Curve (Dotted Amber) */}
          {showRawLine && (
            <path
              d={pathRaw}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="2 3"
              strokeOpacity="0.85"
            />
          )}

          {/* Module Calibrated Reading Curve (Solid Emerald) */}
          <path
            d={pathModule}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Interactive Crosshair Indicator */}
          {hoveredIndex !== null && telemetryHistory[hoveredIndex] && (
            (() => {
              const x = 60 + (hoveredIndex / Math.max(1, telemetryHistory.length - 1)) * (1000 - 85);
              const pt = telemetryHistory[hoveredIndex];
              const normalized = (pt.moduleCalibratedValue - minVal) / Math.max(0.001, maxVal - minVal);
              const y = 20 + (1 - Math.max(0, Math.min(1, normalized))) * (300 - 55);

              return (
                <g>
                  <line
                    x1={x}
                    y1="20"
                    x2={x}
                    y2="265"
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <circle cx={x} cy={y} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                </g>
              );
            })()
          )}
        </svg>

        {hoveredIndex === null && (
          <div className="absolute top-2.5 right-3 text-[11px] text-slate-500 font-mono flex items-center gap-1.5 pointer-events-none">
            <Crosshair className="h-3 w-3" />
            <span>Hover chart to inspect sample points</span>
          </div>
        )}
      </div>

      {/* Stream Controls Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleStreaming}
            className="px-3 py-1.5 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            {isStreaming ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isStreaming ? 'Pause Stream' : 'Resume'}</span>
          </button>

          <button
            onClick={onStepTick}
            disabled={isStreaming}
            className={`px-2.5 py-1.5 text-xs font-medium rounded border transition-colors flex items-center gap-1 ${
              isStreaming
                ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Advance stream by 1 telemetry sample"
          >
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Step Tick</span>
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Speed:</span>
          {[1, 2, 5].map((spd) => (
            <button
              key={spd}
              onClick={() => onChangeSpeed(spd)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                streamSpeed === spd
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
          <span className="text-slate-600 ml-2" aria-hidden="true">|</span>
          <span className="text-slate-400">Window: {telemetryHistory.length} samples</span>
        </div>
      </div>
    </div>
  );
};
