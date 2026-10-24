import React from 'react';
import { LearningStep, StudentTelemetry, AdaptiveResponse } from '../../types/learning.ts';
import { InteractiveChallenge } from '../InteractiveChallenge.tsx';
import { MermaidViewer } from '../MermaidViewer.tsx';
import { TelemetryStream } from '../TelemetryStream.tsx';
import { Binary, Gauge, Cpu, BarChart3, Database, GitBranch, ArrowUpRight } from 'lucide-react';

interface DataHeavyLayoutProps {
  currentStep: LearningStep;
  telemetry: StudentTelemetry;
  adaptiveState: AdaptiveResponse;
  onRecordAction: (action: string, details?: string) => void;
  onRequestHint: () => void;
  onCompleteStep: (success: boolean) => void;
  onTriggerBreather: () => void;
  onOpenJsonInspector: () => void;
}

export const DataHeavyLayout: React.FC<DataHeavyLayoutProps> = ({
  currentStep,
  telemetry,
  adaptiveState,
  onRecordAction,
  onRequestHint,
  onCompleteStep,
  onTriggerBreather,
  onOpenJsonInspector,
}) => {
  // Analytical metrics
  const cognitiveFriction = Math.min(100, (telemetry.hintsClicked * 25) + (telemetry.consecutiveErrors * 35));
  const executionVelocity = Math.max(10, Math.round((telemetry.expectedStepDurationSec / Math.max(1, telemetry.timeSpentOnCurrentStepSec)) * 100));

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      {/* Telemetry Studio Header Bar */}
      <div className="bg-slate-900 border border-sky-500/30 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
                Cognitive Telemetry Studio
              </span>
              <span className="text-[10px] font-mono bg-sky-500/20 text-sky-200 border border-sky-500/30 px-2 py-0.5 rounded-full">
                Sampling Rate: Real-Time Event Loop
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              {adaptiveState.live_performance_analysis}
            </p>
          </div>
        </div>

        {/* Studio Gauges strictly derived from student progress */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400">Progress Score</div>
            <div className="text-sm font-mono font-bold text-emerald-400">{adaptiveState.real_time_metrics.current_focus_score}/100</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400">Milestones</div>
            <div className="text-sm font-mono font-bold text-indigo-400">{telemetry.totalStepsCompleted}/{telemetry.totalRoadmapSteps || 4}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400">Friction Index</div>
            <div className="text-sm font-mono font-bold text-amber-400">{cognitiveFriction}%</div>
          </div>
          <button
            onClick={onOpenJsonInspector}
            className="px-3 py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-xs font-mono text-sky-300 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Raw JSON Schema</span>
          </button>
        </div>
      </div>

      {/* 3-Column Technical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Challenge + Technical Spec */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <span className="text-xs font-mono text-slate-400">
                STEP_NODE: [{currentStep.id}]
              </span>
              <span className="text-xs font-mono text-indigo-400">
                ADAPTIVE_TIER: {adaptiveState.adaptive_next_step.difficulty_adjustment}
              </span>
            </div>

            <InteractiveChallenge
              step={currentStep}
              telemetry={telemetry}
              onRecordAction={onRecordAction}
              onRequestHint={onRequestHint}
              onCompleteStep={onCompleteStep}
              onTriggerBreather={onTriggerBreather}
              activeLayout="data_heavy"
            />
          </div>
        </div>

        {/* Right Column: Deep Telemetry Matrix + Mermaid Architecture */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <MermaidViewer
            chart={adaptiveState.updated_roadmap_diagram}
            title="State Machine Graph (Mermaid.js Execution Tree)"
          />

          <TelemetryStream
            telemetry={telemetry}
            onOpenJsonInspector={onOpenJsonInspector}
            isAdapting={false}
          />
        </div>
      </div>
    </div>
  );
};
