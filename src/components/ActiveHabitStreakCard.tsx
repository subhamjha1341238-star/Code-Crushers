import React from 'react';
import { Flame, Check, Lock, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { StudentTelemetry, HabitStreakAiOutput } from '../types/learning.ts';
import { generateAuthenticMomentumAndStreak } from '../utils/momentum.ts';

interface ActiveHabitStreakCardProps {
  telemetry: StudentTelemetry;
  habitStreak?: HabitStreakAiOutput;
  isAdapting?: boolean;
}

export const ActiveHabitStreakCard: React.FC<ActiveHabitStreakCardProps> = ({
  telemetry,
  habitStreak,
  isAdapting = false,
}) => {
  // Use AI-generated habit streak from model or authentic calculation from student telemetry (never raw dummy data)
  const activeStreak: HabitStreakAiOutput = habitStreak || generateAuthenticMomentumAndStreak(telemetry).habit_streak;

  const streakDays = activeStreak.actualStreakDays;
  const statusBadge = activeStreak.statusBadge;
  const statusEmoji = activeStreak.statusEmoji;
  const multiplierText = activeStreak.multiplierText;
  const streakProtected = activeStreak.streakProtected;
  const nextMilestone = activeStreak.nextMilestone;
  const coachingNote = activeStreak.aiCoachingNote;

  return (
    <div className="bg-[#111726] border border-slate-800/90 rounded-3xl p-5 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-slate-700">
      {/* Background radiant flame glow */}
      <div className="absolute top-0 left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">Active Habit</h3>
          <span className="text-[10px] font-mono font-medium text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            AI Evaluated
          </span>
        </div>

        {/* Dynamic Status Pill Badge */}
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-400/40 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-[0_0_14px_rgba(16,185,129,0.25)]">
          <span>{statusEmoji}</span>
          <span>{statusBadge}</span>
        </div>
      </div>

      {/* Streak Big Headline */}
      <div className="relative z-10 mt-1 mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {activeStreak.headline || `${streakDays} Day Streak`}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Consistency unlocks <strong className="text-amber-300">{multiplierText}</strong></span>
        </p>
      </div>

      {/* Circular Day Pills Row (Evaluated from when student was actually active) */}
      <div className="relative z-10 pt-2 pb-3">
        <div className="grid grid-cols-7 gap-2">
          {activeStreak.days.map((item, index) => {
            return (
              <div key={index} className="flex flex-col items-center gap-1.5 group cursor-default">
                {/* Day circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                    item.completed
                      ? item.isToday
                        ? 'bg-emerald-500/25 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.5)] scale-105'
                        : 'bg-emerald-500/15 border-2 border-emerald-400/80 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.2)]'
                      : item.isToday
                      ? 'bg-indigo-500/10 border-2 border-dashed border-indigo-400/60 text-indigo-300 animate-pulse'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-600'
                  }`}
                >
                  {item.completed ? (
                    <Check className="w-4 h-4 stroke-[3] text-emerald-400" />
                  ) : item.isToday ? (
                    <span className="text-[11px] font-mono font-bold text-indigo-300">Live</span>
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                  )}

                  {/* Pulsing halo if today */}
                  {item.isToday && item.completed && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>

                {/* Day Letter */}
                <span
                  className={`font-mono text-xs font-semibold ${
                    item.isToday
                      ? 'text-emerald-300 font-bold'
                      : item.completed
                      ? 'text-slate-300'
                      : 'text-slate-600'
                  }`}
                >
                  {item.dayLetter}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Coaching Note */}
      {coachingNote && (
        <div className="mb-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="line-clamp-1">{coachingNote}</span>
        </div>
      )}

      {/* Streak Protection / Goal Footer */}
      <div className="mt-2 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs relative z-10">
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className={`w-4 h-4 ${streakProtected ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span>{streakProtected ? 'Streak Protected Today' : 'Pending Today\'s Action'}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-300 font-mono text-[11px]">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Next: {nextMilestone}</span>
        </div>
      </div>
    </div>
  );
};
