/**
 * SensIQ - Industrial Sensor Health & In-Module Calibration Platform
 * Main Dashboard Application
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Equipment,
  SensorModule,
  TelemetryPoint,
  FaultInjectionConfig,
  ActiveFaultType,
  AccuracyPrecisionMetrics,
  FailureDiagnosis,
} from './types/telemetry';
import {
  INITIAL_EQUIPMENTS,
  INITIAL_MODULES,
  generateTelemetrySample,
  computeAccuracyAndPrecision,
  analyzeSensorDiagnostics,
  applyInModuleCalibration,
} from './services/physicsEngine';
import { requestAiDiagnosis } from './services/aiDiagnosticService';
import { TopBar } from './components/TopBar';
import { MachineSelector } from './components/MachineSelector';
import { TelemetryChart } from './components/TelemetryChart';
import { AccuracyPrecisionCard } from './components/AccuracyPrecisionCard';
import { InModuleCalibratorPanel } from './components/InModuleCalibratorPanel';
import { FaultInjectionSandbox } from './components/FaultInjectionSandbox';
import { AiDiagnosticModal } from './components/AiDiagnosticModal';
import { CalibrationCertificateModal } from './components/CalibrationCertificateModal';
import { Radio, Cpu, Activity, ShieldCheck, Database, Sliders } from 'lucide-react';

export default function App() {
  const [equipments, setEquipments] = useState<Equipment[]>(INITIAL_EQUIPMENTS);
  const [modules, setModules] = useState<Record<string, SensorModule>>(INITIAL_MODULES);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('eq-cnc-04');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamSpeed, setStreamSpeed] = useState<number>(1);
  const [showRawLine, setShowRawLine] = useState<boolean>(true);
  const [activeNavTab, setActiveNavTab] = useState<string>('telemetry');

  // Per-equipment telemetry rolling history
  const [telemetryMap, setTelemetryMap] = useState<Record<string, TelemetryPoint[]>>(() => {
    const initial: Record<string, TelemetryPoint[]> = {};
    INITIAL_EQUIPMENTS.forEach((eq) => {
      const mod = INITIAL_MODULES[eq.id];
      const initialFault: FaultInjectionConfig = {
        activeFault: 'NONE',
        driftMagnitude: 0.12,
        noiseMultiplier: 8.0,
        stuckValue: null,
        zeroShiftValue: 0,
        machineSurgeFactor: 1.35,
      };
      const pts: TelemetryPoint[] = [];
      for (let i = 0; i < 30; i++) {
        pts.push(generateTelemetrySample(eq, mod, i, initialFault, i));
      }
      initial[eq.id] = pts;
    });
    return initial;
  });

  // Per-equipment fault injection settings
  const [faultConfigs, setFaultConfigs] = useState<Record<string, FaultInjectionConfig>>(() => {
    const map: Record<string, FaultInjectionConfig> = {};
    INITIAL_EQUIPMENTS.forEach((eq) => {
      map[eq.id] = {
        activeFault: 'NONE',
        driftMagnitude: 0.12,
        noiseMultiplier: 8.0,
        stuckValue: null,
        zeroShiftValue: (eq.primaryVariable.max - eq.primaryVariable.min) * 0.14,
        machineSurgeFactor: 1.38,
      };
    });
    return map;
  });

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  const [aiReportText, setAiReportText] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const stepCounterRef = useRef<number>(30);

  const selectedEquipment = useMemo(
    () => equipments.find((e) => e.id === selectedEquipmentId) || equipments[0],
    [equipments, selectedEquipmentId]
  );

  const currentModule = useMemo(
    () => modules[selectedEquipmentId] || modules['eq-cnc-04'],
    [modules, selectedEquipmentId]
  );

  const currentFaultConfig = useMemo(
    () => faultConfigs[selectedEquipmentId] || {
      activeFault: 'NONE',
      driftMagnitude: 0.12,
      noiseMultiplier: 8.0,
      stuckValue: null,
      zeroShiftValue: 0,
      machineSurgeFactor: 1.35,
    },
    [faultConfigs, selectedEquipmentId]
  );

  const currentTelemetry = useMemo(
    () => telemetryMap[selectedEquipmentId] || [],
    [telemetryMap, selectedEquipmentId]
  );

  // Metrology metrics calculation
  const metrics = useMemo<AccuracyPrecisionMetrics>(() => {
    return computeAccuracyAndPrecision(currentTelemetry, selectedEquipment);
  }, [currentTelemetry, selectedEquipment]);

  // AI Failure Diagnosis classification
  const diagnosis = useMemo<FailureDiagnosis>(() => {
    return analyzeSensorDiagnostics(
      selectedEquipment,
      currentModule,
      metrics,
      currentFaultConfig
    );
  }, [selectedEquipment, currentModule, metrics, currentFaultConfig]);

  // Latest readings lookup for the fleet selector
  const latestReadings = useMemo(() => {
    const res: Record<string, { value: number; ideal: number }> = {};
    equipments.forEach((eq) => {
      const history = telemetryMap[eq.id];
      if (history && history.length > 0) {
        const last = history[history.length - 1];
        res[eq.id] = { value: last.moduleCalibratedValue, ideal: last.idealValue };
      } else {
        res[eq.id] = {
          value: (eq.primaryVariable.nominalMin + eq.primaryVariable.nominalMax) / 2,
          ideal: (eq.primaryVariable.nominalMin + eq.primaryVariable.nominalMax) / 2,
        };
      }
    });
    return res;
  }, [equipments, telemetryMap]);

  // Telemetry stream generator tick
  const advanceStreamTick = useCallback(() => {
    stepCounterRef.current += 1;
    const step = stepCounterRef.current;

    setTelemetryMap((prev) => {
      const updated: Record<string, TelemetryPoint[]> = { ...prev };

      equipments.forEach((eq) => {
        const mod = modules[eq.id];
        const fault = faultConfigs[eq.id];
        const existing = prev[eq.id] || [];
        const newPoint = generateTelemetrySample(eq, mod, step, fault, existing.length);
        const windowSize = 35;
        const nextWindow = [...existing.slice(-(windowSize - 1)), newPoint];
        updated[eq.id] = nextWindow;
      });

      return updated;
    });
  }, [equipments, modules, faultConfigs]);

  // Interval-based live streaming
  useEffect(() => {
    if (!isStreaming) return;
    const intervalMs = Math.max(100, Math.round(500 / streamSpeed));
    const timer = setInterval(() => {
      advanceStreamTick();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isStreaming, streamSpeed, advanceStreamTick]);

  // In-Module Calibrator command dispatcher
  const handleApplyCalibration = useCallback(
    (action: 'AUTO_ZERO' | 'TWO_POINT_SPAN' | 'RESET_FACTORY' | 'TOGGLE_BYPASS') => {
      const lastPoint = currentTelemetry[currentTelemetry.length - 1];
      const measured = lastPoint ? lastPoint.moduleCalibratedValue : 0;
      const ideal = lastPoint ? lastPoint.idealValue : 0;

      const updated = applyInModuleCalibration(
        currentModule,
        action,
        metrics.systematicBias,
        measured,
        ideal
      );

      setModules((prev) => ({
        ...prev,
        [selectedEquipmentId]: updated,
      }));
    },
    [currentModule, currentTelemetry, metrics.systematicBias, selectedEquipmentId]
  );

  // Fault configuration updater
  const handleSetFault = useCallback(
    (fault: ActiveFaultType) => {
      setFaultConfigs((prev) => ({
        ...prev,
        [selectedEquipmentId]: {
          ...prev[selectedEquipmentId],
          activeFault: fault,
        },
      }));
    },
    [selectedEquipmentId]
  );

  // Auto-remediation trigger from diagnostic banner
  const handleAutoRemediate = useCallback(() => {
    if (diagnosis.recommendedCalibratorAction === 'AUTO_ZERO') {
      handleApplyCalibration('AUTO_ZERO');
    } else if (diagnosis.recommendedCalibratorAction === 'TWO_POINT_SPAN') {
      handleApplyCalibration('TWO_POINT_SPAN');
    } else {
      handleApplyCalibration('RESET_FACTORY');
    }
  }, [diagnosis, handleApplyCalibration]);

  // Trigger Gemini AI deep analysis
  const handleOpenAiDiagnostics = useCallback(async () => {
    setIsAiModalOpen(true);
    setIsAiLoading(true);
    try {
      const res = await requestAiDiagnosis(
        selectedEquipment,
        currentModule,
        metrics,
        currentTelemetry,
        diagnosis
      );
      setAiReportText(res.analysis);
    } catch (err: any) {
      setAiReportText(`Diagnostic analysis error: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  }, [selectedEquipment, currentModule, metrics, currentTelemetry, diagnosis]);

  // CSV telemetry export
  const handleExportCsv = useCallback(() => {
    const headers = [
      'Timestamp',
      'Time_Formatted',
      'Equipment_ID',
      'Sensor_Type',
      'Ideal_Physics_Reference',
      'Raw_Transducer_Reading',
      'Module_Calibrated_Reading',
      'Residual_Error_Delta',
      'Absolute_Error',
      'Unit',
    ];

    const rows = currentTelemetry.map((pt) => [
      pt.timestamp,
      `"${pt.timeFormatted}"`,
      `"${selectedEquipment.id}"`,
      `"${currentModule.sensorType}"`,
      pt.idealValue.toFixed(4),
      pt.rawSensorValue.toFixed(4),
      pt.moduleCalibratedValue.toFixed(4),
      pt.residualError.toFixed(4),
      pt.absoluteError.toFixed(4),
      `"${selectedEquipment.primaryVariable.unit}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `SensIQ_Telemetry_${selectedEquipment.id}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentTelemetry, selectedEquipment, currentModule]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Strict 3-Zone Top Navigation */}
      <TopBar
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming((s) => !s)}
        onOpenAiDiagnostics={handleOpenAiDiagnostics}
        onOpenCertificate={() => setIsCertificateOpen(true)}
        onExportCsv={handleExportCsv}
        activeNavTab={activeNavTab}
        onSelectNavTab={(tab) => {
          setActiveNavTab(tab);
          const element = document.getElementById(tab);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Edge Gateway Status Strip (Disciplined typography, zero pill clutter) */}
      <div className="w-full border-b border-slate-800/80 bg-slate-900/30 px-4 sm:px-6 py-2 text-xs font-mono text-slate-400">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-300 font-medium">IoT Local Edge Server: CONNECTED</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span>Protocol: BLE 5.2 / Industrial MQTT</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span>Trained Baseline: Active</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Module Nodes: 4 Active</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span>Sampling: {currentModule.samplingRateHz} Hz</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span>RSSI: {currentModule.signalRssiDbm} dBm</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Stage */}
      <main className="mx-auto max-w-7xl w-full flex-1 px-4 sm:px-6 py-6 space-y-6">
        {/* Section 1: Fleet Overview & Module Node Selection */}
        <section id="fleet">
          <MachineSelector
            equipments={equipments}
            modules={modules}
            selectedEquipmentId={selectedEquipmentId}
            onSelectEquipment={setSelectedEquipmentId}
            latestReadings={latestReadings}
          />
        </section>

        {/* Section 2: Real-time Telemetry Stream & Ideal Physics Model Waveforms */}
        <section id="telemetry">
          <TelemetryChart
            equipment={selectedEquipment}
            telemetryHistory={currentTelemetry}
            isStreaming={isStreaming}
            onToggleStreaming={() => setIsStreaming((s) => !s)}
            onStepTick={advanceStreamTick}
            streamSpeed={streamSpeed}
            onChangeSpeed={setStreamSpeed}
            showRawLine={showRawLine}
            onToggleShowRaw={() => setShowRawLine((s) => !s)}
          />
        </section>

        {/* Section 3: Dual Column - Accuracy & Precision vs In-Module Calibrator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Metrology & Metrics (Accuracy vs Precision) */}
          <section id="accuracy-precision" className="lg:col-span-7">
            <AccuracyPrecisionCard
              metrics={metrics}
              equipment={selectedEquipment}
            />
          </section>

          {/* Embedded In-Module Calibrator Unit */}
          <section id="calibrator" className="lg:col-span-5">
            <InModuleCalibratorPanel
              module={currentModule}
              equipment={selectedEquipment}
              onApplyCalibration={handleApplyCalibration}
              systematicBias={metrics.systematicBias}
            />
          </section>
        </div>

        {/* Section 4: Fault Injection & Sensor Failure Mode Identification Sandbox */}
        <section id="fault-injection">
          <FaultInjectionSandbox
            faultConfig={currentFaultConfig}
            onSetFault={handleSetFault}
            diagnosis={diagnosis}
            equipment={selectedEquipment}
            module={currentModule}
            onAutoRemediate={handleAutoRemediate}
          />
        </section>

        {/* Secondary Parameters & Technical Specifications */}
        <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800/60">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Machine Process Correlations & Secondary Physics Indicators
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Thermodynamic & Mechanical State Matrix
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {selectedEquipment.secondaryParameters.map((param, idx) => (
              <div
                key={idx}
                className="p-3 rounded bg-slate-950/50 border border-slate-800/80"
              >
                <div className="text-[11px] text-slate-400 font-mono">
                  {param.label}
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-bold font-mono tabular-nums text-slate-100">
                    {param.value}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {param.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Quiet Technical Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-xs font-mono text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            SensIQ Industrial Metrology Platform · In-Module Smart Calibration & Telemetry AI
          </div>
          <div className="flex items-center gap-3">
            <span>Edge Engine: Nominal</span>
            <span className="text-slate-700" aria-hidden="true">·</span>
            <span>Physics Baseline: Calibrated</span>
            <span className="text-slate-700" aria-hidden="true">·</span>
            <span>ISO/IEC 17025 Traceable</span>
          </div>
        </div>
      </footer>

      {/* AI Forensic Diagnostic Modal */}
      <AiDiagnosticModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        reportText={aiReportText}
        isLoading={isAiLoading}
        onReanalyze={handleOpenAiDiagnostics}
        onApplyRecommendedRemedy={
          diagnosis.requiresCalibratorAction ? handleAutoRemediate : undefined
        }
      />

      {/* ISO 17025 Calibration Certificate Modal */}
      <CalibrationCertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        equipment={selectedEquipment}
        module={currentModule}
        metrics={metrics}
        diagnosis={diagnosis}
      />
    </div>
  );
}
