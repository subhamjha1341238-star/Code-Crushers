import React from 'react';
import { LearningStep, StudentTelemetry, AdaptiveResponse } from '../../types/learning.ts';
import { InteractiveChallenge } from '../InteractiveChallenge.tsx';
import { MermaidViewer } from '../MermaidViewer.tsx';
import { Feather, ShieldCheck, Heart, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface MinimalistFocusLayoutProps {
  currentStep: LearningStep;
  telemetry: StudentTelemetry;
  adaptiveState: AdaptiveResponse;
  onRecordAction: (action: string, details?: string) => void;
  onRequestHint: () => void;
  onCompleteStep: (success: boolean) => void;
  onTriggerBreather: () => void;
}

export const MinimalistFocusLayout: React.FC<MinimalistFocusLayoutProps> = ({
  currentStep,
  telemetry,
  adaptiveState,
  onRecordAction,
  onRequestHint,
  onCompleteStep,
  onTriggerBreather,
}) => {
  const [showRoadmap, setShowRoadmap] = React.useState(false);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 animate-fade-in">
      {/* Calm Status Header */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Minimalist Focus Mode
                </span>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  AI Calibrated: {adaptiveState.adaptive_next_step.difficulty_adjustment}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {adaptiveState.live_performance_analysis}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] uppercase font-mono text-slate-400">Progress Score</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold font-mono text-emerald-400">
                {adaptiveState.real_time_metrics.current_focus_score}/100
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                ({telemetry.totalStepsCompleted}/{telemetry.totalRoadmapSteps || 4} done)
              </span>
            </div>
          </div>
        </div>

        {/* Micro reassurance message */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-indigo-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Distractions removed. Just focus on one small win right here.</span>
          </div>
          <button
            onClick={() => setShowRoadmap(!showRoadmap)}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <span>{showRoadmap ? 'Hide Roadmap' : 'Peek Scaffolding Roadmap'}</span>
            {showRoadmap ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Optional Roadmap Accordion */}
      {showRoadmap && (
        <div className="animate-fade-in">
          <MermaidViewer
            chart={adaptiveState.updated_roadmap_diagram}
            title="Calibrated Scaffolding Path (Revision Branch Added)"
          />
        </div>
      )}

      {/* Main Focus Card */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
        
        <div className="mb-6">
          <span className="text-xs font-mono text-indigo-400 font-semibold uppercase">
            Step {currentStep.id.replace('step-', '')}: Micro-Challenge
          </span>
          <h2 className="text-2xl font-bold text-slate-100 mt-1">
            {currentStep.title}
          </h2>
          <p className="text-sm text-slate-300 mt-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            👉 <strong className="text-indigo-300">Your single micro-task:</strong> {adaptiveState.adaptive_next_step.micro_action || currentStep.microAction}
          </p>
        </div>

        <InteractiveChallenge
          step={currentStep}
          telemetry={telemetry}
          onRecordAction={onRecordAction}
          onRequestHint={onRequestHint}
          onCompleteStep={onCompleteStep}
          onTriggerBreather={onTriggerBreather}
          activeLayout="minimalist_focus"
        />
      </div>
    </div>
  );
};
