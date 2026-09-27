/**
 * ISO/IEC 17025 Compliant Sensor Calibration Certificate Modal
 * Produces official metrology and calibration records for industrial audits.
 */
import React from 'react';
import { X, Printer, ShieldCheck, Download, CheckCircle2 } from 'lucide-react';
import { Equipment, SensorModule, AccuracyPrecisionMetrics, FailureDiagnosis } from '../types/telemetry';

interface CalibrationCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment;
  module: SensorModule;
  metrics: AccuracyPrecisionMetrics;
  diagnosis: FailureDiagnosis;
}

export const CalibrationCertificateModal: React.FC<CalibrationCertificateModalProps> = ({
  isOpen,
  onClose,
  equipment,
  module,
  metrics,
  diagnosis,
}) => {
  if (!isOpen) return null;

  const certNumber = `CERT-${equipment.id.toUpperCase()}-${module.id}-${new Date().getFullYear()}`;
  const isPassing = metrics.accuracyPercent >= 90 && metrics.precisionPercent >= 80;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950/80 print:hidden">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>ISO/IEC 17025 Metrological Calibration Certificate</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Certificate Sheet (Printable) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-950 text-slate-100 space-y-6 font-sans">
          {/* Header Lockup */}
          <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>SensIQ Metrology Laboratories</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Certificate of Calibration & Sensor Health Verification
              </p>
            </div>

            <div className="text-right font-mono text-xs text-slate-400">
              <div className="font-semibold text-slate-200">{certNumber}</div>
              <div>Date: {new Date().toISOString().split('T')[0]}</div>
              <div>Standard: ISO/IEC 17025:2017</div>
            </div>
          </div>

          {/* Asset & Transducer Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono bg-slate-900/60 p-4 rounded border border-slate-800">
            <div>
              <div className="text-slate-500 uppercase tracking-wider text-[10px] mb-1">Equipment Unit</div>
              <div className="text-slate-200 font-semibold">{equipment.name}</div>
              <div className="text-slate-400">{equipment.location}</div>
              <div className="text-slate-500 mt-1">Operating Hours: {equipment.operatingHours} hrs</div>
            </div>

            <div>
              <div className="text-slate-500 uppercase tracking-wider text-[10px] mb-1">Installed Node & Calibrator</div>
              <div className="text-slate-200 font-semibold">{module.id} ({module.sensorName})</div>
              <div className="text-slate-400">Firmware: {module.firmwareVersion} · {module.protocol}</div>
              <div className="text-slate-500 mt-1">HW Calibrator: {module.inModuleCalibrator.hardwareRevision}</div>
            </div>
          </div>

          {/* Metrological Test Results Table */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
              As-Found Telemetry Metrology Evaluation
            </h4>
            <table className="w-full text-xs font-mono border-collapse border border-slate-800">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-left">
                  <th className="p-2.5">Parameter</th>
                  <th className="p-2.5">Ideal Physics Ref</th>
                  <th className="p-2.5">Received Reading</th>
                  <th className="p-2.5">Systematic Bias</th>
                  <th className="p-2.5">Uncertainty (k=2)</th>
                  <th className="p-2.5 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                <tr>
                  <td className="p-2.5 font-medium text-slate-100">{equipment.primaryVariable.name}</td>
                  <td className="p-2.5 tabular-nums">{metrics.idealReferenceValue.toFixed(3)} {equipment.primaryVariable.unit}</td>
                  <td className="p-2.5 tabular-nums">{metrics.meanReceivedValue.toFixed(3)} {equipment.primaryVariable.unit}</td>
                  <td className="p-2.5 tabular-nums">{metrics.systematicBias >= 0 ? '+' : ''}{metrics.systematicBias.toFixed(3)}</td>
                  <td className="p-2.5 tabular-nums">±{(metrics.standardDeviation * 2).toFixed(3)}</td>
                  <td className={`p-2.5 font-bold text-right ${isPassing ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPassing ? 'PASS' : 'DEVIATION'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Statistical Metrics Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-900/40 border border-slate-800">
              <div className="text-slate-500 text-[10px]">Calculated Accuracy</div>
              <div className="text-base font-bold text-slate-100 mt-0.5">{metrics.accuracyPercent.toFixed(1)}%</div>
            </div>

            <div className="p-2.5 rounded bg-slate-900/40 border border-slate-800">
              <div className="text-slate-500 text-[10px]">Calculated Precision</div>
              <div className="text-base font-bold text-slate-100 mt-0.5">{metrics.precisionPercent.toFixed(1)}%</div>
            </div>

            <div className="p-2.5 rounded bg-slate-900/40 border border-slate-800">
              <div className="text-slate-500 text-[10px]">Standard Deviation (σ)</div>
              <div className="text-base font-bold text-slate-100 mt-0.5">{metrics.standardDeviation.toFixed(4)}</div>
            </div>

            <div className="p-2.5 rounded bg-slate-900/40 border border-slate-800">
              <div className="text-slate-500 text-[10px]">In-Module V_REF</div>
              <div className="text-base font-bold text-cyan-400 mt-0.5">{module.inModuleCalibrator.referenceVoltageVolts.toFixed(3)}V</div>
            </div>
          </div>

          {/* In-Module Hardware Calibration State */}
          <div className="text-xs font-mono text-slate-400 border border-slate-800/80 p-3 rounded bg-slate-900/20">
            <div className="text-slate-300 font-semibold mb-1">In-Module Calibrator Register State:</div>
            <div>Zero Offset Register (b_cal): {module.inModuleCalibrator.zeroOffset} {equipment.primaryVariable.unit}</div>
            <div>Span Gain Register (m_cal): {module.inModuleCalibrator.spanGain.toFixed(4)}x</div>
            <div>DAC Status: {module.inModuleCalibrator.referenceDacStatus} · Mode: {module.inModuleCalibrator.activeMode}</div>
          </div>

          {/* Certification Verdict */}
          <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-400 font-mono">
                Diagnostic Status: <span className="text-slate-200">{diagnosis.diagnosisTitle}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Calibrated against edge physics baseline with 95% confidence interval.
              </div>
            </div>

            <div className={`px-4 py-2 rounded text-xs font-mono font-bold tracking-wide uppercase ${
              isPassing
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}>
              {isPassing ? 'CERTIFICATE APPROVED' : 'CALIBRATION REQUIRED'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
