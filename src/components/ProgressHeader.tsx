import React from 'react';
import { Target, CheckCircle2, Flame, Award, ArrowRight, Sparkles, Edit3 } from 'lucide-react';
import { StudentTelemetry, AdaptiveResponse, OrchestratedInsightResponse } from '../types/learning.ts';

interface ProgressHeaderProps {
  skillGoal: string;
  currentStepIndex: number;
  totalSteps: number;
  currentStepTitle: string;
  telemetry: StudentTelemetry;
  adaptiveState: AdaptiveResponse;
  orchestratedInsight: OrchestratedInsightResponse | null;
  onChangeGoal: () => void;
  onRecommendedAction: () => void;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  skillGoal,
  currentStepIndex,
  totalSteps,
  currentStepTitle,
  telemetry,
  adaptiveState,
  orchestratedInsight,
  onChangeGoal,
  onRecommendedAction,
}) => {
  const percentComplete = Math.round((telemetry.totalStepsCompleted / Math.max(1, totalSteps)) * 100);
  const score = adaptiveState.real_time_metrics.current_focus_score;

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md flex flex-col gap-5">
      {/* Top Row: Current Goal & Edit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase font-mono tracking-wider text-slate-400">
              Learning Goal
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{skillGoal}</span>
              <button
                onClick={onChangeGoal}
                className="text-slate-400 hover:text-indigo-400 p-1 rounded-lg transition-colors cursor-pointer"
                title="Change learning goal"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </h2>
          </div>
        </div>

        {/* Current Active Step Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Currently on:</span>
          <span className="px-3 py-1 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-semibold text-xs">
            Step {currentStepIndex + 1} of {totalSteps}: {currentStepTitle}
          </span>
        </div>
      </div>

      {/* Main Progress Bar & Milestones */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Progress: {telemetry.totalStepsCompleted} of {totalSteps} Milestones Completed</span>
          </span>
          <span className="text-emerald-400 font-mono font-bold text-sm">
            {percentComplete}% Complete
          </span>
        </div>

        {/* Clean, high-visibility progress bar */}
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${Math.max(4, percentComplete)}%` }}
          />
        </div>
      </div>

      {/* 4 Simple, Human-Readable Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1: Mastery Score */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            Mastery Score
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-emerald-400">{score}</span>
            <span className="text-xs text-slate-500 font-mono">/100</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {score === 0 ? 'Starting first step' : score >= 80 ? 'Mastery reached' : 'Growing with progress'}
          </span>
        </div>

        {/* Metric 2: Milestones Conquered */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            Milestones
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-indigo-300">
              {telemetry.totalStepsCompleted}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ {totalSteps}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">Verified steps completed</span>
        </div>

        {/* Metric 3: Accuracy */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Accuracy
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-amber-300">
              {telemetry.quizAttempts > 0
                ? `${Math.round(((telemetry.correctAnswers || 0) / telemetry.quizAttempts) * 100)}%`
                : '100%'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {telemetry.correctAnswers || 0} correct of {telemetry.quizAttempts || 0} attempts
          </span>
        </div>

        {/* Metric 4: Streak */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            Answer Streak
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-orange-400">
              {telemetry.streakCount}x
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {telemetry.streakCount > 1 ? 'Hot streak active!' : 'Build your streak'}
          </span>
        </div>
      </div>

      {/* AI Analyst Friendly Tip */}
      {orchestratedInsight && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              AI Coach
            </span>
            <p className="text-slate-200 font-medium">
              "{orchestratedInsight.personalized_insight}"
            </p>
          </div>
          <button
            onClick={onRecommendedAction}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <span>{orchestratedInsight.next_recommended_action.button_text}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
