import React from 'react';
import { LearningStep, StudentTelemetry, AdaptiveResponse } from '../../types/learning.ts';
import { InteractiveChallenge } from '../InteractiveChallenge.tsx';
import { MermaidViewer } from '../MermaidViewer.tsx';
import { Flame, Trophy, Zap, Swords, Target, Award, Sparkles } from 'lucide-react';

interface GamifiedArenaLayoutProps {
  currentStep: LearningStep;
  telemetry: StudentTelemetry;
  adaptiveState: AdaptiveResponse;
  onRecordAction: (action: string, details?: string) => void;
  onRequestHint: () => void;
  onCompleteStep: (success: boolean) => void;
  onTriggerBreather: () => void;
}

export const GamifiedArenaLayout: React.FC<GamifiedArenaLayoutProps> = ({
  currentStep,
  telemetry,
  adaptiveState,
  onRecordAction,
  onRequestHint,
  onCompleteStep,
  onTriggerBreather,
}) => {
  const currentStreak = Math.max(0, telemetry.streakCount || 0);
  const xpEarned = adaptiveState.real_time_metrics.xp_earned ?? Math.max(
    0,
    (telemetry.totalStepsCompleted * 100) +
    ((telemetry.correctAnswers || 0) * 50) +
    (currentStreak * 25) -
    Math.min(50, (telemetry.hintsClicked || 0) * 10)
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Gamified Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-pink-900/80 border-2 border-pink-500/50 p-6 shadow-2xl glow-arena">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/40">
              <Flame className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-pink-500 text-white shadow-sm">
                  ARENA COMBAT MODE
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-amber-300" />
                  {currentStreak}x STREAK MULTIPLIER
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                {adaptiveState.real_time_metrics.momentum_status}
              </h2>
              <p className="text-xs text-pink-200/90 max-w-xl">
                {adaptiveState.live_performance_analysis}
              </p>
            </div>
          </div>

          {/* Gamified Stats Pill strictly based on student progress */}
          <div className="flex items-center gap-4 bg-slate-950/60 border border-pink-500/30 rounded-2xl p-3 px-5 backdrop-blur-md">
            <div className="text-center">
              <div className="text-[10px] uppercase font-mono tracking-wider text-pink-300">Earned XP</div>
              <div className="text-xl font-black font-mono text-white flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-amber-400" />
                {xpEarned}
              </div>
            </div>
            <div className="w-px h-8 bg-pink-500/30" />
            <div className="text-center">
              <div className="text-[10px] uppercase font-mono tracking-wider text-pink-300">Progress Score</div>
              <div className="text-xl font-black font-mono text-emerald-400">
                {adaptiveState.real_time_metrics.current_focus_score}%
              </div>
            </div>
            <div className="w-px h-8 bg-pink-500/30" />
            <div className="text-center">
              <div className="text-[10px] uppercase font-mono tracking-wider text-pink-300">Milestones</div>
              <div className="text-sm font-bold font-mono text-pink-200 mt-1">
                {telemetry.totalStepsCompleted}/{telemetry.totalRoadmapSteps || 4}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Arena 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Challenge with Arena Theme */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-slate-900/90 border-2 border-purple-500/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
                <Swords className="w-4 h-4 text-pink-400" />
                <span>Next Boss Milestone: {adaptiveState.adaptive_next_step.step_title}</span>
              </div>
              <span className="text-xs font-mono font-bold text-pink-400 bg-pink-500/10 border border-pink-500/30 px-2.5 py-0.5 rounded-full">
                +250 XP
              </span>
            </div>

            <InteractiveChallenge
              step={currentStep}
              telemetry={telemetry}
              onRecordAction={onRecordAction}
              onRequestHint={onRequestHint}
              onCompleteStep={onCompleteStep}
              onTriggerBreather={onTriggerBreather}
              activeLayout="gamified_arena"
            />
          </div>
        </div>

        {/* Right: Fast-Track Roadmap & Trophy Showcase */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <MermaidViewer
            chart={adaptiveState.updated_roadmap_diagram}
            title="⚡ Fast-Track Arena Pathway"
          />

          {/* Unlocked Badges */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-3">
              <Award className="w-4 h-4 text-amber-400" />
              Active Arena Badges
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center gap-2.5">
                <span className="text-xl">⚡</span>
                <div>
                  <div className="text-xs font-bold text-slate-200">Speedster</div>
                  <div className="text-[10px] text-purple-300">&lt;60s Completion</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-pink-950/40 border border-pink-800/40 flex items-center gap-2.5">
                <span className="text-xl">🎯</span>
                <div>
                  <div className="text-xs font-bold text-slate-200">Zero-Hint King</div>
                  <div className="text-[10px] text-pink-300">Pure First Principles</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 flex items-center gap-2.5">
                <span className="text-xl">🔥</span>
                <div>
                  <div className="text-xs font-bold text-slate-200">Combo Master</div>
                  <div className="text-[10px] text-amber-300">3x Streak Active</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-2.5">
                <span className="text-xl">👑</span>
                <div>
                  <div className="text-xs font-bold text-slate-200">Arena Boss</div>
                  <div className="text-[10px] text-emerald-300">Next Tier Unlocked</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
