/**
 * In-Module Hardware Calibrator Unit Panel
 * Displays the internal architecture of the smart module's embedded micro-calibrator
 * (precision voltage reference, zero offset trim, span gain, and mode control).
 */
import React from 'react';
import { SensorModule, Equipment } from '../types/telemetry';
import { Cpu, Wrench, RotateCcw, Sliders, ShieldCheck, Zap } from 'lucide-react';

interface InModuleCalibratorPanelProps {
  module: SensorModule;
  equipment: Equipment;
  onApplyCalibration: (action: 'AUTO_ZERO' | 'TWO_POINT_SPAN' | 'RESET_FACTORY' | 'TOGGLE_BYPASS') => void;
  systematicBias: number;
}

export const InModuleCalibratorPanel: React.FC<InModuleCalibratorPanelProps> = ({
  module,
  equipment,
  onApplyCalibration,
  systematicBias,
}) => {
  const cal = module.inModuleCalibrator;
  const primaryVar = equipment.primaryVariable;
  const decimals = primaryVar.precisionDecimals;

  return (
    <div className="w-full rounded-lg border border-slate-800 bg-slate-900/60 p-4 sm:p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Embedded In-Module Calibrator Subsystem
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Module {module.id} · HW Rev: {cal.hardwareRevision} · On-Node Hardware Calibrator
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Calibrator Circuit:</span>
          <span
            className={`font-semibold ${
              cal.activeMode === 'ACTIVE_CALIBRATION'
                ? 'text-emerald-400'
                : cal.activeMode === 'SELF_TEST_PULSE'
                ? 'text-amber-400'
                : 'text-slate-400'
            }`}
          >
            {cal.activeMode === 'ACTIVE_CALIBRATION'
              ? 'ACTIVE TRIM'
              : cal.activeMode === 'SELF_TEST_PULSE'
              ? 'TEST PULSE'
              : 'RAW BYPASS'}
          </span>
        </div>
      </div>

      {/* Internal Registers Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Zero Offset Register */}
        <div className="p-3 rounded border border-slate-800 bg-slate-950/60">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Zero Offset (b_cal)
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-100">
              {cal.zeroOffset >= 0 ? '+' : ''}
              {cal.zeroOffset.toFixed(decimals)}
            </span>
            <span className="text-xs font-mono text-slate-400">{primaryVar.unit}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            Hardware Tare Register
          </div>
        </div>

        {/* Span Gain Register */}
        <div className="p-3 rounded border border-slate-800 bg-slate-950/60">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Span Gain (m_cal)
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-100">
              {cal.spanGain.toFixed(4)}x
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            Transconductance Scale
          </div>
        </div>

        {/* Reference Standard */}
        <div className="p-3 rounded border border-slate-800 bg-slate-950/60">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Internal V_REF
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono tabular-nums text-cyan-300">
              {cal.referenceVoltageVolts.toFixed(3)}
            </span>
            <span className="text-xs font-mono text-slate-400">V</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">
            DAC Ref: {cal.referenceDacStatus}
          </div>
        </div>

        {/* Last Calibrated Date */}
        <div className="p-3 rounded border border-slate-800 bg-slate-950/60">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Last Field Calibrated
          </div>
          <div className="text-base font-bold font-mono tabular-nums text-slate-200 mt-1">
            {cal.lastCalibratedAt}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            {cal.calibrationPointsCount}-Point Factory Matrix
          </div>
        </div>
      </div>

      {/* Schematic Flow Indicator */}
      <div className="p-3 rounded border border-slate-800/80 bg-slate-950/40 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Physical Sensor
          </span>
          <span className="text-slate-600">→</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
            Analog ADC
          </span>
          <span className="text-slate-600">→</span>
          <span className={`px-2 py-0.5 rounded border ${
            cal.activeMode === 'ACTIVE_CALIBRATION'
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            In-Module Calibrator [b_cal, m_cal]
          </span>
          <span className="text-slate-600">→</span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700">
            RF Edge Gateway
          </span>
        </div>

        <button
          onClick={() => onApplyCalibration('TOGGLE_BYPASS')}
          className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2 transition-colors whitespace-nowrap"
        >
          {cal.activeMode === 'ACTIVE_CALIBRATION' ? 'Bypass Calibrator (Send Raw)' : 'Activate Calibrator'}
        </button>
      </div>

      {/* Closed-Loop Calibration Actions */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2">
        <button
          onClick={() => onApplyCalibration('AUTO_ZERO')}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-cyan-600 text-white hover:bg-cyan-500 transition-colors shadow-sm shadow-cyan-900/40"
          title="Auto-zero offset based on current measured residual bias"
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Execute Auto-Tare / Zero-Point Cal</span>
        </button>

        <button
          onClick={() => onApplyCalibration('TWO_POINT_SPAN')}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
          title="Run two-point reference calibration using internal precision voltage reference"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>2-Point Reference Span Calibration</span>
        </button>

        <button
          onClick={() => onApplyCalibration('RESET_FACTORY')}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
          title="Restore factory calibration coefficients"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset to Factory Baseline</span>
        </button>
      </div>
    </div>
  );
};
