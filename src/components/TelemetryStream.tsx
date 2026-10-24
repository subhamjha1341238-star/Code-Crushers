import React from 'react';
import { StudentTelemetry } from '../types/learning.ts';
import { Activity, Clock, Lightbulb, AlertTriangle, Eye, MousePointerClick, Zap, Code2 } from 'lucide-react';

interface TelemetryStreamProps {
  telemetry: StudentTelemetry;
  onOpenJsonInspector: () => void;
  isAdapting: boolean;
}

export const TelemetryStream: React.FC<TelemetryStreamProps> = ({
  telemetry,
  onOpenJsonInspector,
  isAdapting,
}) => {
  const isOvertime = telemetry.timeSpentOnCurrentStepSec > telemetry.expectedStepDurationSec;
  const isStruggling = telemetry.hintsClicked >= 2 || telemetry.consecutiveErrors >= 2;

  return (
    <div className="flex flex-col bg-slate-900/70 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Telemetry Stream</h4>
        </div>

        <button
          onClick={onOpenJsonInspector}
          className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 hover:bg-indigo-950/70 border border-indigo-800/40 px-2 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Payload JSON</span>
        </button>
      </div>

      {/* Grid of Key Telemetry Indicators */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {/* Step Time */}
        <div className={`p-2.5 rounded-xl border flex flex-col ${
          isOvertime ? 'bg-amber-950/20 border-amber-800/40' : 'bg-slate-950/40 border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              Step Dwell
            </span>
            <span className="font-mono text-[10px] text-slate-500">exp {telemetry.expectedStepDurationSec}s</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-base font-bold font-mono ${isOvertime ? 'text-amber-400' : 'text-slate-100'}`}>
              {telemetry.timeSpentOnCurrentStepSec}s
            </span>
            {isOvertime && <span className="text-[10px] text-amber-500 font-semibold">+Overtime</span>}
          </div>
        </div>

        {/* Hints */}
        <div className={`p-2.5 rounded-xl border flex flex-col ${
          telemetry.hintsClicked >= 2 ? 'bg-amber-950/20 border-amber-800/40' : 'bg-slate-950/40 border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              Hints Clicked
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-base font-bold font-mono ${telemetry.hintsClicked >= 2 ? 'text-amber-400' : 'text-slate-100'}`}>
              {telemetry.hintsClicked}
            </span>
            <span className="text-[10px] text-slate-500">requests</span>
          </div>
        </div>

        {/* Quiz Attempts & Errors */}
        <div className={`p-2.5 rounded-xl border flex flex-col ${
          telemetry.consecutiveErrors > 0 ? 'bg-rose-950/20 border-rose-800/40' : 'bg-slate-950/40 border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              Attempts / Err
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-base font-bold font-mono text-slate-100">
              {telemetry.quizAttempts}
            </span>
            <span className="text-[10px] text-rose-400">
              ({telemetry.consecutiveErrors} err)
            </span>
          </div>
        </div>

        {/* Milestones Completed */}
        <div className="p-2.5 rounded-xl border bg-slate-950/40 border-slate-800/80 flex flex-col">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-indigo-400" />
              Step Milestones
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-base font-bold font-mono text-indigo-300">
              {telemetry.totalStepsCompleted}/{telemetry.totalRoadmapSteps || 4}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">
              ({Math.round(((telemetry.totalStepsCompleted || 0) / Math.max(1, telemetry.totalRoadmapSteps || 4)) * 100)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Live State Inference Tag */}
      <div className="mt-3 p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">Telemetry Inferred State:</span>
        <span className={`text-[11px] font-semibold font-mono px-2 py-0.5 rounded-full ${
          isStruggling
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            : telemetry.hintsClicked === 0 && telemetry.timeSpentOnCurrentStepSec < 30
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
        }`}>
          {isStruggling ? 'Cognitive Friction' : telemetry.hintsClicked === 0 && telemetry.timeSpentOnCurrentStepSec < 30 ? 'High Velocity' : 'Steady Pacing'}
        </span>
      </div>

      {/* Recent Action Feed (Last 3) */}
      <div className="mt-3">
        <div className="text-[10px] font-mono uppercase text-slate-500 mb-1.5">Live Event Stream</div>
        <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
          {telemetry.recentActions.slice(-4).reverse().map((act, i) => (
            <div key={i} className="text-[11px] text-slate-400 font-mono flex items-center justify-between py-0.5 border-b border-slate-800/40 last:border-none">
              <span className="truncate max-w-[170px] text-slate-300">{act.action}</span>
              <span className="text-[10px] text-slate-500 shrink-0">{act.details || 'event'}</span>
            </div>
          ))}
          {telemetry.recentActions.length === 0 && (
            <div className="text-[11px] text-slate-600 italic">No events logged yet</div>
          )}
        </div>
      </div>
    </div>
  );
};
