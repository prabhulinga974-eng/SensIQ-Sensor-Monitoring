/**
 * Fault Injection & Failure Mode Identification Sandbox
 * Injects physical sensor anomalies and evaluates the server's AI detection engine
 * to classify sensor failure modes vs. true machine operational excursions.
 */
import React from 'react';
import {
  FaultInjectionConfig,
  ActiveFaultType,
  FailureDiagnosis,
  Equipment,
  SensorModule,
} from '../types/telemetry';
import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  Radio,
  Unplug,
  PauseCircle,
  TrendingUp,
  Activity,
} from 'lucide-react';

interface FaultInjectionSandboxProps {
  faultConfig: FaultInjectionConfig;
  onSetFault: (fault: ActiveFaultType) => void;
  diagnosis: FailureDiagnosis;
  equipment: Equipment;
  module: SensorModule;
  onAutoRemediate: () => void;
}

export const FaultInjectionSandbox: React.FC<FaultInjectionSandboxProps> = ({
  faultConfig,
  onSetFault,
  diagnosis,
  equipment,
  module,
  onAutoRemediate,
}) => {
  const faultOptions: {
    id: ActiveFaultType;
    label: string;
    description: string;
    isMachineExcursion?: boolean;
  }[] = [
    {
      id: 'NONE',
      label: 'Nominal Health',
      description: 'Sensor & equipment operating within calibrated Class 0.5 tolerances',
    },
    {
      id: 'THERMAL_DRIFT',
      label: 'Thermal Drift',
      description: 'Gradual monotonic decalibration from prolonged heat cycling',
    },
    {
      id: 'ZERO_SHIFT',
      label: 'Zero-Point Shift (+15%)',
      description: 'Mechanical shock or tare loss causing constant systematic offset',
    },
    {
      id: 'STUCK_VALUE',
      label: 'Sensor Frozen / ADC Lock',
      description: 'ADC latchup or transducer membrane seizure; variance collapses to zero',
    },
    {
      id: 'EMI_NOISE',
      label: 'High EMI Noise Jitter',
      description: 'Ground loop interference or shielding breakdown degrading precision',
    },
    {
      id: 'OPEN_CIRCUIT',
      label: 'Open-Circuit Dropout',
      description: 'Physical wire disconnect or signal pin pulled to ground rail',
    },
    {
      id: 'MACHINE_SURGE',
      label: 'True Machine Surge',
      description: 'Real equipment distress: sensor is 100% accurate, but machine is failing!',
      isMachineExcursion: true,
    },
  ];

  return (
    <div className="w-full rounded-lg border border-slate-800 bg-slate-900/60 p-4 sm:p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Sensor Failure Identification & Fault Simulation
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test the trained server backend's ability to differentiate sensor defects from genuine machine events
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Selected Node: {module.id}
        </span>
      </div>

      {/* Fault Selector Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {faultOptions.map((opt) => {
          const isActive = faultConfig.activeFault === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSetFault(opt.id)}
              className={`text-left p-3 rounded-md border transition-all ${
                isActive
                  ? opt.isMachineExcursion
                    ? 'bg-amber-950/50 border-amber-500 text-amber-200 ring-1 ring-amber-500/40'
                    : opt.id === 'NONE'
                    ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/40'
                    : 'bg-rose-950/50 border-rose-500 text-rose-200 ring-1 ring-rose-500/40'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">{opt.label}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Live AI Classification Banner */}
      <div
        className={`p-4 rounded-md border ${
          diagnosis.mode === 'NOMINAL_HEALTHY'
            ? 'bg-emerald-950/20 border-emerald-800/70 text-emerald-100'
            : diagnosis.mode === 'MACHINE_PROCESS_FAULT'
            ? 'bg-amber-950/20 border-amber-800/70 text-amber-100'
            : 'bg-rose-950/20 border-rose-800/70 text-rose-100'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {diagnosis.mode === 'NOMINAL_HEALTHY' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-semibold tracking-wide text-slate-100">
                  {diagnosis.diagnosisTitle}
                </h4>
                {/* Clean unboxed determination */}
                <span className="text-xs font-mono text-slate-400">
                  · Confidence: {diagnosis.confidenceScore.toFixed(1)}% ·
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    diagnosis.isSensorFault
                      ? 'text-rose-400'
                      : diagnosis.mode === 'MACHINE_PROCESS_FAULT'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {diagnosis.isSensorFault
                    ? 'SENSOR FAULT IDENTIFIED'
                    : diagnosis.mode === 'MACHINE_PROCESS_FAULT'
                    ? 'GENUINE MACHINE EXCURSION'
                    : 'NOMINAL'}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {diagnosis.description}
              </p>

              {/* Evidence Checklist */}
              <div className="mt-3 space-y-1">
                {diagnosis.evidenceList.map((ev, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <span className="text-slate-500">›</span>
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action button if remediation is possible via calibrator */}
          {diagnosis.requiresCalibratorAction && (
            <button
              onClick={onAutoRemediate}
              className="sm:self-center shrink-0 px-3 py-1.5 text-xs font-medium rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition-colors whitespace-nowrap"
            >
              Remediate via In-Module Calibrator
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
