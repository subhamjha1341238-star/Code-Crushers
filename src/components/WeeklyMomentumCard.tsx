import React, { useState } from 'react';
import { BarChart3, TrendingUp, CheckCircle, Sparkles, RefreshCw, Brain } from 'lucide-react';
import { StudentTelemetry, WeeklyMomentumAiOutput, WeeklyDayMetric } from '../types/learning.ts';
import { generateAuthenticMomentumAndStreak } from '../utils/momentum.ts';

interface WeeklyMomentumCardProps {
  telemetry: StudentTelemetry;
  weeklyMomentum?: WeeklyMomentumAiOutput;
  isAdapting?: boolean;
  onRefreshAiEvaluation?: () => void;
}

export const WeeklyMomentumCard: React.FC<WeeklyMomentumCardProps> = ({
  telemetry,
  weeklyMomentum,
  isAdapting = false,
  onRefreshAiEvaluation,
}) => {
  const [dailyTargetMin, setDailyTargetMin] = useState<number>(() => weeklyMomentum?.dailyTargetMin || 10);
  const [selectedDay, setSelectedDay] = useState<WeeklyDayMetric | null>(null);

  // Use AI-generated momentum from model, or authentic calculation from student telemetry (never raw dummy data)
  const activeMomentum: WeeklyMomentumAiOutput = weeklyMomentum || generateAuthenticMomentumAndStreak(telemetry, dailyTargetMin).weekly_momentum;

  const targetMetPercent = activeMomentum.targetMetPercent;
  const daysCompleted = activeMomentum.targetReachedDays;
  const avgMinutes = activeMomentum.avgMinutesPerDay.toFixed(1);
  const maxMinutesInChart = Math.max(20, ...activeMomentum.days.map((d) => d.activeMinutes + 4));

  return (
    <div className="bg-[#111726] border border-slate-800/90 rounded-3xl p-5 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-slate-700">
      {/* Background ambient neon glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between relative z-10 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Weekly Momentum</h3>
            <span className="text-[10px] font-mono font-medium text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              AI Generated
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-slate-400">
              Daily target: <span className="font-semibold text-slate-200">{dailyTargetMin} mins</span>
            </span>
            <button
              onClick={() => {
                const nextTarget = dailyTargetMin === 10 ? 15 : dailyTargetMin === 15 ? 20 : 10;
                setDailyTargetMin(nextTarget);
              }}
              title="Click to toggle daily target goal"
              className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-800/40 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
            >
              Adjust
            </button>
            {onRefreshAiEvaluation && (
              <button
                onClick={onRefreshAiEvaluation}
                disabled={isAdapting}
                title="Trigger Gemini to re-evaluate momentum from live activity"
                className="text-[10px] font-mono text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 ml-1"
              >
                <RefreshCw className={`w-3 h-3 ${isAdapting ? 'animate-spin text-emerald-400' : ''}`} />
                <span>Sync AI</span>
              </button>
            )}
          </div>
        </div>

        {/* Target Met Badge */}
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold shadow-[0_0_12px_rgba(16,185,129,0.18)]">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{targetMetPercent}% Target Met</span>
        </div>
      </div>

      {/* AI Pedagogical Insight banner */}
      {activeMomentum.momentumAiInsight && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300 flex items-center gap-2">
          <Brain className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="line-clamp-1 italic">{activeMomentum.momentumAiInsight}</span>
        </div>
      )}

      {/* Bar Chart Container */}
      <div className="relative pt-6 pb-2 px-1">
        {/* Dashed Target Guideline */}
        <div
          className="absolute left-0 right-0 border-t border-dashed border-emerald-500/30 pointer-events-none z-0"
          style={{ bottom: `${(dailyTargetMin / maxMinutesInChart) * 128 + 32}px` }}
        >
          <span className="absolute right-0 -top-4 font-mono text-[10px] text-emerald-400/70 bg-[#111726]/80 px-1">
            {dailyTargetMin}m target
          </span>
        </div>

        {/* 7 Columns (Mon - Sun) */}
        <div className="flex items-end justify-between gap-2 h-44 relative z-10">
          {activeMomentum.days.map((item) => {
            const hasData = item.activeMinutes > 0;
            const barHeightPx = hasData
              ? Math.max(20, Math.min(140, Math.round((item.activeMinutes / maxMinutesInChart) * 140)))
              : 8;

            const isSelected = selectedDay?.dayName === item.dayName;

            return (
              <div
                key={item.shortDay}
                onClick={() => setSelectedDay(item)}
                className="flex-1 flex flex-col items-center justify-end group cursor-pointer"
              >
                {/* Minute Label above bar */}
                <div className="mb-2 text-center h-4 flex items-center justify-center">
                  {hasData ? (
                    <span
                      className={`font-mono text-[11px] font-semibold transition-colors ${
                        item.isToday
                          ? 'text-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                          : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {item.activeMinutes}m
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-slate-600">-</span>
                  )}
                </div>

                {/* Vertical Bar */}
                <div className="w-full max-w-[38px] flex justify-center items-end h-[140px]">
                  {hasData ? (
                    <div
                      style={{ height: `${barHeightPx}px` }}
                      className={`w-full rounded-xl transition-all duration-500 relative ${
                        item.isToday
                          ? 'bg-gradient-to-t from-emerald-500 to-emerald-300 ring-2 ring-emerald-300/80 shadow-[0_0_20px_rgba(52,211,153,0.7)]'
                          : 'bg-gradient-to-t from-emerald-600 to-emerald-400 opacity-85 group-hover:opacity-100 group-hover:brightness-110'
                      } ${isSelected ? 'ring-2 ring-white scale-105' : ''}`}
                    >
                      {item.isToday && (
                        <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse" />
                      )}
                    </div>
                  ) : (
                    <div
                      style={{ height: '8px' }}
                      className="w-full rounded-md bg-slate-800/40 border border-slate-800/80 group-hover:bg-slate-800"
                    />
                  )}
                </div>

                {/* Day Label */}
                <div className="mt-2.5 text-center">
                  <span
                    className={`font-mono text-xs font-medium block transition-colors ${
                      item.isToday
                        ? 'text-emerald-300 font-bold'
                        : hasData
                        ? 'text-slate-300 group-hover:text-slate-100'
                        : 'text-slate-500'
                    }`}
                  >
                    {item.shortDay}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Tooltip Detail */}
      {selectedDay && (
        <div className="mt-3 py-2 px-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">{selectedDay.dayName}:</span>
            <span className="text-emerald-400 font-mono font-semibold">
              {selectedDay.activeMinutes > 0
                ? `${selectedDay.activeMinutes} minutes active engagement`
                : 'Rest / Inactive'}
            </span>
          </div>
          <span className="text-slate-400 text-[11px]">
            {selectedDay.metDailyTarget ? '✓ Target achieved' : 'Pending'}
          </span>
        </div>
      )}

      {/* Footer Stats Row */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-400 font-bold">—</span>
          <span>Avg: <strong className="text-slate-200">{avgMinutes} min/day</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Target reached <strong className="text-emerald-400">{daysCompleted}/7</strong> days</span>
        </div>
      </div>
    </div>
  );
};
