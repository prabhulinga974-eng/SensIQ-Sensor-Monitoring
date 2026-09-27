/**
 * Accuracy & Precision Metrology Card
 * Analyzes difference between actual ground-truth value vs. module received value.
 * Visualizes Accuracy (Systematic Bias) vs. Precision (Repeatability / Random Noise)
 * with a dual Gaussian probability density comparison chart.
 */
import React from 'react';
import { AccuracyPrecisionMetrics, Equipment } from '../types/telemetry';
import { Target, Activity, BarChart2 } from 'lucide-react';

interface AccuracyPrecisionCardProps {
  metrics: AccuracyPrecisionMetrics;
  equipment: Equipment;
}

export const AccuracyPrecisionCard: React.FC<AccuracyPrecisionCardProps> = ({
  metrics,
  equipment,
}) => {
  const {
    accuracyPercent,
    precisionPercent,
    systematicBias,
    standardDeviation,
    variance,
    repeatabilitySpan,
    signalToNoiseRatioDb,
    meanReceivedValue,
    idealReferenceValue,
    gaussianDistribution,
  } = metrics;

  const primaryVar = equipment.primaryVariable;
  const decimals = primaryVar.precisionDecimals;

  // Render SVG Gaussian dual distribution bell curves
  const renderGaussianSvg = () => {
    if (!gaussianDistribution || gaussianDistribution.length < 5) {
      return (
        <div className="h-32 flex items-center justify-center text-xs text-slate-500 font-mono">
          Accumulating statistical sample window...
        </div>
      );
    }

    const width = 500;
    const height = 150;
    const padding = { top: 15, right: 20, bottom: 25, left: 35 };

    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    // Find max density for normalization
    let maxDensity = 0.001;
    gaussianDistribution.forEach((pt) => {
      maxDensity = Math.max(maxDensity, pt.receivedDensity, pt.idealDensity);
    });

    const scaleX = (index: number) =>
      padding.left + (index / (gaussianDistribution.length - 1)) * innerWidth;
    const scaleY = (density: number) => {
      const normalized = Math.min(1, density / maxDensity);
      return padding.top + innerHeight - normalized * innerHeight;
    };

    let pathIdeal = '';
    let pathReceived = '';

    gaussianDistribution.forEach((pt, i) => {
      const x = scaleX(i);
      const yIdeal = scaleY(pt.idealDensity);
      const yReceived = scaleY(pt.receivedDensity);

      if (i === 0) {
        pathIdeal = `M ${x.toFixed(1)} ${yIdeal.toFixed(1)}`;
        pathReceived = `M ${x.toFixed(1)} ${yReceived.toFixed(1)}`;
      } else {
        pathIdeal += ` L ${x.toFixed(1)} ${yIdeal.toFixed(1)}`;
        pathReceived += ` L ${x.toFixed(1)} ${yReceived.toFixed(1)}`;
      }
    });

    const minXVal = gaussianDistribution[0]?.x ?? 0;
    const maxXVal = gaussianDistribution[gaussianDistribution.length - 1]?.x ?? 1;

    return (
      <div className="w-full h-36 relative select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
          {/* Baseline */}
          <line
            x1={padding.left}
            y1={padding.top + innerHeight}
            x2={padding.left + innerWidth}
            y2={padding.top + innerHeight}
            stroke="#334155"
            strokeWidth="1"
          />

          {/* Ideal Ground Truth Distribution (Cyan Dashed) */}
          <path
            d={pathIdeal}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1.8"
            strokeDasharray="4 3"
          />

          {/* Module Received Distribution (Emerald Solid) */}
          <path
            d={pathReceived}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
          />

          {/* Center markers */}
          <line
            x1={padding.left + innerWidth / 2}
            y1={padding.top}
            x2={padding.left + innerWidth / 2}
            y2={padding.top + innerHeight}
            stroke="#06b6d4"
            strokeWidth="1"
            strokeDasharray="2 2"
            opacity="0.5"
          />
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between items-center px-8 text-[10px] font-mono text-slate-500">
          <span>{minXVal.toFixed(decimals)} {primaryVar.unit}</span>
          <span className="text-slate-400">Mean: {meanReceivedValue.toFixed(decimals)}</span>
          <span>{maxXVal.toFixed(decimals)} {primaryVar.unit}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full rounded-lg border border-slate-800 bg-slate-900/60 p-4 sm:p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-cyan-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Accuracy & Precision Quantification
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Differentiating systematic sensor bias from stochastic noise variance
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Window: {metrics.sampleWindowCount} samples
        </div>
      </div>

      {/* Main Dual Meters: Accuracy vs. Precision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Accuracy Gauge Card */}
        <div className="p-4 rounded-md border border-slate-800 bg-slate-950/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Accuracy Index (Closeness to True Value)
              </span>
              <span
                className={`text-xs font-mono font-medium ${
                  accuracyPercent >= 95
                    ? 'text-emerald-400'
                    : accuracyPercent >= 80
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {accuracyPercent >= 95
                  ? 'Nominal / Class 0.5'
                  : accuracyPercent >= 80
                  ? 'Calibration Drift'
                  : 'Critical Out-of-Spec'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-mono tabular-nums text-slate-100">
                {accuracyPercent.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Systematic Bias: {systematicBias >= 0 ? '+' : ''}
                {systematicBias.toFixed(decimals)} {primaryVar.unit}
              </span>
            </div>

            {/* Meter Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-3">
              <div
                className={`h-full transition-all duration-300 ${
                  accuracyPercent >= 90
                    ? 'bg-emerald-500'
                    : accuracyPercent >= 75
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, accuracyPercent))}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Ideal Physics Ref: {idealReferenceValue.toFixed(decimals)}</span>
            <span>Module Mean: {meanReceivedValue.toFixed(decimals)}</span>
          </div>
        </div>

        {/* Precision Gauge Card */}
        <div className="p-4 rounded-md border border-slate-800 bg-slate-950/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Precision Index (Repeatability & Tightness)
              </span>
              <span
                className={`text-xs font-mono font-medium ${
                  precisionPercent >= 90
                    ? 'text-emerald-400'
                    : precisionPercent >= 70
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {precisionPercent >= 90
                  ? 'High Repeatability'
                  : precisionPercent >= 70
                  ? 'Moderate Noise'
                  : 'Severe Jitter / EMI'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-mono tabular-nums text-slate-100">
                {precisionPercent.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Std Dev (σ): {standardDeviation.toFixed(decimals)} {primaryVar.unit}
              </span>
            </div>

            {/* Meter Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-3">
              <div
                className={`h-full transition-all duration-300 ${
                  precisionPercent >= 85
                    ? 'bg-emerald-500'
                    : precisionPercent >= 65
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, precisionPercent))}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Repeatability Limit (2.77σ): {repeatabilitySpan.toFixed(decimals)}</span>
            <span>SNR: {signalToNoiseRatioDb.toFixed(1)} dB</span>
          </div>
        </div>
      </div>

      {/* Probability Density Bell Curve (Gaussian Dispersion) */}
      <div className="p-4 rounded-md border border-slate-800 bg-slate-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-cyan-400" />
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Gaussian Probability Density Distribution
            </h4>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-3 h-0.5 border-t border-dashed border-cyan-400" />
              <span>Ideal Reference Envelope</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-0.5 bg-emerald-400" />
              <span>Received Module Distribution</span>
            </span>
          </div>
        </div>

        {renderGaussianSvg()}

        <p className="text-[11px] text-slate-500 mt-2">
          Note: Horizontal displacement indicates <strong>Systematic Accuracy Bias</strong> (corrected via in-module Auto-Tare).
          Curve spreading/flattening indicates <strong>Random Noise / Precision Collapse</strong> (requires analog filtering or shielding).
        </p>
      </div>
    </div>
  );
};
