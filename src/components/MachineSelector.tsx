/**
 * Machine & Installed Module Selector
 * Lists the industrial equipment fleet with attached sensor modules.
 * Adheres to Zero-Pill metadata guidelines and tabular numeral discipline.
 */
import React from 'react';
import { Equipment, SensorModule } from '../types/telemetry';
import { Cpu, Gauge, Zap, Radio } from 'lucide-react';

interface MachineSelectorProps {
  equipments: Equipment[];
  modules: Record<string, SensorModule>;
  selectedEquipmentId: string;
  onSelectEquipment: (id: string) => void;
  latestReadings: Record<string, { value: number; ideal: number }>;
}

export const MachineSelector: React.FC<MachineSelectorProps> = ({
  equipments,
  modules,
  selectedEquipmentId,
  onSelectEquipment,
  latestReadings,
}) => {
  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold tracking-wide text-slate-300 uppercase">
          Monitored Industrial Fleet & In-Module Nodes
        </h2>
        <span className="text-xs text-slate-500 font-mono">
          {equipments.length} Nodes Online · Sampling 10-50 Hz
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {equipments.map((eq) => {
          const isSelected = eq.id === selectedEquipmentId;
          const mod = modules[eq.id];
          const reading = latestReadings[eq.id] || {
            value: (eq.primaryVariable.nominalMin + eq.primaryVariable.nominalMax) / 2,
            ideal: (eq.primaryVariable.nominalMin + eq.primaryVariable.nominalMax) / 2,
          };
          const delta = reading.value - reading.ideal;
          const isDeltaSignificant = Math.abs(delta) > (eq.primaryVariable.max - eq.primaryVariable.min) * 0.05;

          return (
            <button
              key={eq.id}
              onClick={() => onSelectEquipment(eq.id)}
              className={`text-left p-3.5 rounded-lg border transition-all relative ${
                isSelected
                  ? 'border-cyan-500/80 bg-slate-900/90 shadow-md shadow-cyan-950/20 ring-1 ring-cyan-500/30'
                  : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70 hover:border-slate-700'
              }`}
            >
              {/* Header: Name and operational status text */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-sm font-semibold text-slate-100 line-clamp-1">
                  {eq.name}
                </span>
                <span
                  className={`text-xs font-mono font-medium whitespace-nowrap ${
                    eq.status === 'HEALTHY'
                      ? 'text-emerald-400'
                      : eq.status === 'WARNING'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {eq.operationalState}
                </span>
              </div>

              {/* Subtitle location and type */}
              <div className="text-xs text-slate-400 line-clamp-1 mb-2.5">
                {eq.location}
              </div>

              {/* Real-time reading display */}
              <div className="border-t border-slate-800/60 pt-2.5">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-0.5">
                  {eq.primaryVariable.name}
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold font-mono tabular-nums text-slate-100">
                      {reading.value.toFixed(eq.primaryVariable.precisionDecimals)}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {eq.primaryVariable.unit}
                    </span>
                  </div>

                  {/* Residual Delta indicator */}
                  <span
                    className={`text-xs font-mono tabular-nums ${
                      !isDeltaSignificant
                        ? 'text-slate-400'
                        : delta > 0
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                    title="Deviation from AI physics model baseline"
                  >
                    Δ {delta >= 0 ? '+' : ''}{delta.toFixed(eq.primaryVariable.precisionDecimals)}
                  </span>
                </div>
              </div>

              {/* Clean unboxed metadata with dot separators */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/40 flex items-center text-[11px] text-slate-400 font-mono">
                <span>{mod ? mod.id : 'NODE'}</span>
                <span className="mx-1.5 text-slate-600" aria-hidden="true">·</span>
                <span>{mod ? mod.protocol.split(' ')[0] : 'RF'}</span>
                <span className="mx-1.5 text-slate-600" aria-hidden="true">·</span>
                <span>{mod ? `${mod.batteryPercentage}% pwr` : '100%'}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
