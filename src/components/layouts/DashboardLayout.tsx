import React from 'react';
import { LearningStep, StudentTelemetry, AdaptiveResponse, SkillRoadmapData } from '../../types/learning.ts';
import { InteractiveChallenge } from '../InteractiveChallenge.tsx';
import { MermaidViewer } from '../MermaidViewer.tsx';
import { TelemetryStream } from '../TelemetryStream.tsx';
import { Sparkles, CheckCircle2, Circle, ArrowRight, Compass, TrendingUp, Zap } from 'lucide-react';

interface DashboardLayoutProps {
  roadmap: SkillRoadmapData;
  currentStep: LearningStep;
  currentStepIndex: number;
  telemetry: StudentTelemetry;
  adaptiveState: AdaptiveResponse;
  onSelectStep: (index: number) => void;
  onRecordAction: (action: string, details?: string) => void;
  onRequestHint: () => void;
  onCompleteStep: (success: boolean) => void;
  onTriggerBreather: () => void;
  onOpenJsonInspector: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  roadmap,
  currentStep,
  currentStepIndex,
  telemetry,
  adaptiveState,
  onSelectStep,
  onRecordAction,
  onRequestHint,
  onCompleteStep,
  onTriggerBreather,
  onOpenJsonInspector,
}) => {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Adaptive Intelligence Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Adaptive AI Guidance
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  adaptiveState.adaptive_next_step.difficulty_adjustment === 'Made Easier'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : adaptiveState.adaptive_next_step.difficulty_adjustment === 'Increased Difficulty'
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}>
                  Difficulty: {adaptiveState.adaptive_next_step.difficulty_adjustment}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {adaptiveState.live_performance_analysis}
              </p>
            </div>
          </div>

          {/* Quick Metrics strictly computed from student progress */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2">
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400">Progress Score</div>
              <div className="text-base font-bold font-mono text-emerald-400">
                {adaptiveState.real_time_metrics.current_focus_score}/100
              </div>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400">Mastery</div>
              <div className="text-base font-bold font-mono text-indigo-300">
                {Math.round((telemetry.totalStepsCompleted / Math.max(1, roadmap.steps.length)) * 100)}%
              </div>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400">Momentum</div>
              <div className="text-xs font-bold text-slate-200">
                {adaptiveState.real_time_metrics.momentum_status}
              </div>
            </div>
          </div>
        </div>

        {/* Real Student Progress Bar */}
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Student Curriculum Progress ({telemetry.totalStepsCompleted} of {roadmap.steps.length} milestones conquered)</span>
            <span className="text-emerald-400 font-bold">{Math.round((telemetry.totalStepsCompleted / Math.max(1, roadmap.steps.length)) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.round((telemetry.totalStepsCompleted / Math.max(1, roadmap.steps.length)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main 3-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Curriculum Steps & Navigation */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
              <span>Curriculum Steps</span>
              <span className="text-[10px] font-mono text-indigo-400">
                {currentStepIndex + 1}/{roadmap.steps.length}
              </span>
            </h4>

            <div className="flex flex-col gap-2">
              {roadmap.steps.map((step, idx) => {
                const isActive = idx === currentStepIndex;
                const isPast = idx < currentStepIndex;

                return (
                  <button
                    key={step.id}
                    onClick={() => onSelectStep(idx)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600/15 border-indigo-500/60 text-slate-100 ring-1 ring-indigo-500/30'
                        : isPast
                        ? 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200'
                        : 'bg-slate-950/20 border-slate-800/40 text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isPast ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isActive ? (
                        <div className="w-4 h-4 rounded-full border-2 border-indigo-400 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        </div>
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{step.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                        <span>{step.difficulty}</span>
                        <span>•</span>
                        <span>{step.durationEstimateSec}s</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 text-xs text-indigo-200/90 leading-relaxed">
            💡 <strong>Next Micro-Action:</strong> {adaptiveState.adaptive_next_step.micro_action}
          </div>
        </div>

        {/* Middle Column: Interactive Workspace */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <InteractiveChallenge
              step={currentStep}
              telemetry={telemetry}
              onRecordAction={onRecordAction}
              onRequestHint={onRequestHint}
              onCompleteStep={onCompleteStep}
              onTriggerBreather={onTriggerBreather}
              activeLayout="dashboard"
            />
          </div>

          {/* Mermaid Roadmap */}
          <MermaidViewer
            chart={adaptiveState.updated_roadmap_diagram || roadmap.mermaidRoadmap}
            title="Real-Time Visual Roadmap (Mermaid.js)"
          />
        </div>

        {/* Right Column: Telemetry & Live Stats */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <TelemetryStream
            telemetry={telemetry}
            onOpenJsonInspector={onOpenJsonInspector}
            isAdapting={false}
          />

          {/* Live Progress Card */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>Session Momentum</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Path Progress</span>
              <span className="font-mono text-slate-200 font-semibold">
                {Math.round(((currentStepIndex + 1) / roadmap.steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / roadmap.steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
