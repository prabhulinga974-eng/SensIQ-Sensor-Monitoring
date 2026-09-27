/**
 * SensIQ Top Bar Component
 * Adheres to the strict 3-zone Top Bar Contract:
 * [Zone 1: Brand title wordmark] - [Zone 2: Clean nav links] - [Zone 3: Primary actions]
 */
import React from 'react';
import { Activity, Play, Pause, FileCheck, Sparkles, Download } from 'lucide-react';

interface TopBarProps {
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onOpenAiDiagnostics: () => void;
  onOpenCertificate: () => void;
  onExportCsv: () => void;
  activeNavTab: string;
  onSelectNavTab: (tab: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  isStreaming,
  onToggleStreaming,
  onOpenAiDiagnostics,
  onOpenCertificate,
  onExportCsv,
  activeNavTab,
  onSelectNavTab,
}) => {
  const navItems = [
    { id: 'telemetry', label: 'Telemetry Stream' },
    { id: 'calibrator', label: 'In-Module Calibrator' },
    { id: 'accuracy-precision', label: 'Metrology & Metrics' },
    { id: 'fault-injection', label: 'Fault Simulation' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Single text element Brand Zone */}
        <a
          href="/"
          className="text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors flex items-center gap-2"
        >
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>SensIQ</span>
        </a>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          {navItems.map((item) => {
            const isActive = activeNavTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectNavTab(item.id)}
                className={`transition-colors whitespace-nowrap py-1 relative ${
                  isActive
                    ? 'text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleStreaming}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              isStreaming
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                : 'bg-emerald-600/90 text-white hover:bg-emerald-500'
            }`}
            title={isStreaming ? 'Pause live telemetry stream' : 'Resume live telemetry stream'}
          >
            {isStreaming ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Resume</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenAiDiagnostics}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-cyan-600 text-white hover:bg-cyan-500 transition-colors whitespace-nowrap shadow-sm shadow-cyan-900/30"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Forensics</span>
          </button>

          <button
            onClick={onOpenCertificate}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors whitespace-nowrap"
            title="View ISO 17025 Metrology Certificate"
          >
            <FileCheck className="h-3.5 w-3.5" />
            <span>Certificate</span>
          </button>

          <button
            onClick={onExportCsv}
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800 transition-colors whitespace-nowrap"
            title="Export Telemetry Log (CSV)"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
};
