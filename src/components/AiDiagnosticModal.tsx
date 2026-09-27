/**
 * Gemini AI Metrological Forensic Modal
 * Provides deep AI analysis of sensor health, physics differentiation,
 * and calibrator command recommendations.
 */
import React from 'react';
import { X, Sparkles, RefreshCw, Check, Copy } from 'lucide-react';

interface AiDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportText: string;
  isLoading: boolean;
  onReanalyze: () => void;
  onApplyRecommendedRemedy?: () => void;
}

export const AiDiagnosticModal: React.FC<AiDiagnosticModalProps> = ({
  isOpen,
  onClose,
  reportText,
  isLoading,
  onReanalyze,
  onApplyRecommendedRemedy,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                SensIQ Metrological Forensic Engine
              </h3>
              <p className="text-xs text-slate-400">
                Server-side AI evaluation of physics baseline vs. received module stream
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-slate-200 text-sm leading-relaxed">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="h-7 w-7 text-cyan-400 animate-spin" />
              <p className="text-sm font-medium text-slate-300">
                Running physics differential model & metrology forensics...
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Model: gemini-3.8-flash · Correlating sensor time-series with machine envelope
              </p>
            </div>
          ) : (
            <div className="prose prose-invert prose-cyan max-w-none space-y-3">
              {reportText.split('\n\n').map((block, i) => {
                if (block.startsWith('### ')) {
                  return (
                    <h3 key={i} className="text-base font-bold text-cyan-400 border-b border-slate-800 pb-1.5 mt-4">
                      {block.replace('### ', '')}
                    </h3>
                  );
                }
                if (block.startsWith('#### ')) {
                  return (
                    <h4 key={i} className="text-sm font-semibold text-slate-100 mt-3">
                      {block.replace('#### ', '')}
                    </h4>
                  );
                }
                if (block.startsWith('- ')) {
                  return (
                    <ul key={i} className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
                      {block.split('\n').map((line, j) => (
                        <li key={j}>{line.replace(/^- /, '')}</li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={i} className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {block}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <button
              onClick={onReanalyze}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Re-analyze</span>
            </button>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onApplyRecommendedRemedy && (
              <button
                onClick={() => {
                  onApplyRecommendedRemedy();
                  onClose();
                }}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
              >
                Apply In-Module Calibrator Remedy
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
