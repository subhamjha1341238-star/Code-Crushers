import React from 'react';
import { StudentTelemetry, AdaptiveResponse, LearningStep } from '../types/learning.ts';
import { WeeklyMomentumCard } from './WeeklyMomentumCard.tsx';
import { ActiveHabitStreakCard } from './ActiveHabitStreakCard.tsx';
import { Award, CheckCircle2, Zap, Clock, ShieldCheck, Code2, ArrowUpRight, CheckCircle, Activity } from 'lucide-react';

interface ProgressAnalyticsViewProps {
  telemetry: StudentTelemetry;
  adaptiveState: AdaptiveResponse;
  steps: LearningStep[];
  onOpenJsonInspector: () => void;
  isAdapting?: boolean;
  onRefreshAiEvaluation?: () => void;
}

export const ProgressAnalyticsView: React.FC<ProgressAnalyticsViewProps> = ({
  telemetry,
  adaptiveState,
  steps,
  onOpenJsonInspector,
  isAdapting = false,
  onRefreshAiEvaluation,
}) => {
  const score = adaptiveState.real_time_metrics.current_focus_score;
  const progressPercent = Math.round((telemetry.totalStepsCompleted / Math.max(1, steps.length)) * 100);
  const accuracyPercent = telemetry.quizAttempts > 0
    ? Math.round(((telemetry.correctAnswers || 0) / telemetry.quizAttempts) * 100)
    : 100;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Score & Formula */}
        <div className="bg-[#111726] border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                Verified Mastery Score
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Live Calculated
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono text-emerald-400">{score}</span>
              <span className="text-sm font-mono text-slate-500">/ 100</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Dynamically derived from completed milestones ({telemetry.totalStepsCompleted}/{steps.length}), quiz accuracy ({accuracyPercent}%), and habit consistency.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Mastery Status:</span>
            <span className="font-semibold text-slate-200">
              {score >= 80 ? 'Mastery Attained' : score >= 40 ? 'Steady Advancement' : 'Session Started'}
            </span>
          </div>
        </div>

        {/* Card 2: Curriculum Completion */}
        <div className="bg-[#111726] border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                Curriculum Completion
              </span>
              <span className="text-xs font-mono font-bold text-indigo-300">
                {progressPercent}%
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono text-indigo-300">
                {telemetry.totalStepsCompleted}
              </span>
              <span className="text-sm font-mono text-slate-500">/ {steps.length} Milestones</span>
            </div>

            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mt-3">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-xs text-slate-400 mt-2">
              {steps.length - telemetry.totalStepsCompleted === 0
                ? 'All roadmap milestones conquered! Outstanding!'
                : `${steps.length - telemetry.totalStepsCompleted} milestones remaining to achieve 100% curriculum completion.`}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Active Goal:</span>
            <span className="font-semibold text-slate-200 truncate max-w-[150px]">
              {telemetry.currentStepTitle || 'Step 1'}
            </span>
          </div>
        </div>

        {/* Card 3: Cognitive Flow & Focus */}
        <div className="bg-[#111726] border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Focus & Momentum
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {telemetry.streakCount}x Streak
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono text-amber-300">
                {accuracyPercent}%
              </span>
              <span className="text-xs text-slate-500">Quiz Accuracy</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Active Dwell</span>
                <span className="font-mono font-bold text-slate-200">{telemetry.timeSpentOnCurrentStepSec}s</span>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Quiz Attempts</span>
                <span className="font-mono font-bold text-slate-200">{telemetry.quizAttempts}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Momentum Status:</span>
            <span className="font-semibold text-slate-200">
              {adaptiveState.real_time_metrics.momentum_status}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Dedicated Progress Column on Right with User's Requested Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Learning Roadmap & Interaction History */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Milestone Status Tracker */}
          <div className="bg-[#111726] border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Milestone Mastery Checklist
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real progress tracking based on completed interactive steps
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                {telemetry.totalStepsCompleted} / {steps.length} Complete
              </span>
            </div>

            <div className="space-y-2.5">
              {steps.map((step, idx) => {
                const isCompleted = step.status === 'completed' || idx < telemetry.totalStepsCompleted;
                const isCurrent = step.id === telemetry.currentStepId;
                const estMin = Math.max(1, Math.round(step.durationEstimateSec / 60));

                return (
                  <div
                    key={step.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isCompleted
                        ? 'bg-emerald-950/15 border-emerald-800/30 text-slate-200'
                        : isCurrent
                        ? 'bg-indigo-950/25 border-indigo-700/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                        : 'bg-slate-950/40 border-slate-800/70 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                          isCompleted
                            ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                            : isCurrent
                            ? 'bg-indigo-500 text-white animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isCompleted ? '✓' : idx + 1}
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                          {step.title}
                          {isCurrent && (
                            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-800/40">
                              Current Focus
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {step.microAction}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {isCompleted ? (
                        <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1">
                          Conquered
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-slate-500">
                          {estMin}m est.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Interaction Timeline */}
          <div className="bg-[#111726] border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Live Student Action Timeline
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {telemetry.recentActions.length} Actions Recorded
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {telemetry.recentActions.slice(-8).reverse().map((act, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <span className="font-bold text-slate-200">{act.action}</span>
                      {act.details && (
                        <span className="text-slate-400 ml-2 font-mono text-[11px]">
                          ({act.details})
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(act.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Weekly Momentum & Active Habit Streak (Driven by AI Model & Authentic Student Activity) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Weekly Momentum Card */}
          <WeeklyMomentumCard
            telemetry={telemetry}
            weeklyMomentum={adaptiveState.weekly_momentum}
            isAdapting={isAdapting}
            onRefreshAiEvaluation={onRefreshAiEvaluation}
          />

          {/* Active Habit / Streak Card */}
          <ActiveHabitStreakCard
            telemetry={telemetry}
            habitStreak={adaptiveState.habit_streak}
            isAdapting={isAdapting}
          />

          {/* Clean footer info without raw clutter */}
          <div className="bg-[#111726]/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Calibrated via Real Activity</span>
            </div>
            <button
              onClick={onOpenJsonInspector}
              className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 bg-indigo-950/30 hover:bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Inspector</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
