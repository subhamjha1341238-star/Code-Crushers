import React from 'react';
import { AdaptiveUILayout } from '../types/learning.ts';
import { Play, Sparkles, RefreshCw, Feather, Flame, Cpu, LayoutDashboard, Sliders, ChevronDown } from 'lucide-react';

interface ScenarioPresetsBarProps {
  currentSkill: string;
  activeLayout: AdaptiveUILayout;
  isAutoPilot: boolean;
  isAdapting: boolean;
  onToggleAutoPilot: () => void;
  onSelectLayout: (layout: AdaptiveUILayout) => void;
  onRun60SecDemo: () => void;
  onSimulateScenario: (scenario: 'struggling' | 'excelling' | 'analytical' | 'steady') => void;
  onTriggerAdaptationNow: () => void;
  onChangeSkill: () => void;
  onOpenJsonInspector: () => void;
  onOpenGroundedSearch: () => void;
}

export const ScenarioPresetsBar: React.FC<ScenarioPresetsBarProps> = ({
  currentSkill,
  activeLayout,
  isAutoPilot,
  isAdapting,
  onToggleAutoPilot,
  onSelectLayout,
  onRun60SecDemo,
  onSimulateScenario,
  onTriggerAdaptationNow,
  onChangeSkill,
  onOpenJsonInspector,
  onOpenGroundedSearch,
}) => {
  return (
    <div className="flex flex-col gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 backdrop-blur-md shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Skill Goal & Switcher */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onChangeSkill}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 transition-all cursor-pointer text-left"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform" />
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-500">Current Goal</div>
              <div className="text-xs font-bold text-slate-200 truncate max-w-[200px] sm:max-w-[300px]">
                {currentSkill}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 shrink-0" />
          </button>

          {/* 60-Second Demo Hero Button */}
          <button
            onClick={onRun60SecDemo}
            className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Run interactive 60-second tour showing live telemetry and dynamic adaptation"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>60s Guided Demo</span>
          </button>

          {/* Google Search Grounded Docs Button */}
          <button
            onClick={onOpenGroundedSearch}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-800/50 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Search live web documentation grounded by Google Search and Gemini 3.8 Flash"
          >
            <span className="text-sm">🌐</span>
            <span className="hidden md:inline">Google Search Docs</span>
          </button>
        </div>

        {/* Right: AI Auto-Pilot & Layout Morph Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* AI Auto-Pilot Switch */}
          <button
            onClick={onToggleAutoPilot}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
              isAutoPilot
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 ring-1 ring-indigo-500/30'
                : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAutoPilot ? 'text-indigo-400 animate-spin-slow' : 'text-slate-500'}`} />
            <span>AI Auto-Morph: <strong className={isAutoPilot ? 'text-indigo-200' : 'text-slate-400'}>{isAutoPilot ? 'ON' : 'MANUAL'}</strong></span>
          </button>

          {/* Layout Selector */}
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-slate-800">
            <button
              onClick={() => onSelectLayout('dashboard')}
              title="Dashboard Layout"
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                activeLayout === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <button
              onClick={() => onSelectLayout('minimalist_focus')}
              title="Minimalist Focus Layout (Struggle/Calm)"
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                activeLayout === 'minimalist_focus'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Feather className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Focus</span>
            </button>

            <button
              onClick={() => onSelectLayout('gamified_arena')}
              title="Gamified Arena Layout (High Performance)"
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                activeLayout === 'gamified_arena'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Arena</span>
            </button>

            <button
              onClick={() => onSelectLayout('data_heavy')}
              title="Data-Heavy Telemetry Studio"
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                activeLayout === 'data_heavy'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Data Studio</span>
            </button>
          </div>

          {/* Trigger Adaptation Now Button */}
          <button
            onClick={onTriggerAdaptationNow}
            disabled={isAdapting}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
            title="Send live interaction telemetry payload to Gemini to re-adapt"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAdapting ? 'animate-spin' : ''}`} />
            <span>{isAdapting ? 'Analyzing...' : 'Adapt Live'}</span>
          </button>
        </div>
      </div>

      {/* Simulator Quick Scenarios Row for Evaluators & Judges */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <Sliders className="w-3 h-3 text-slate-500" />
          Test Telemetry Scenarios:
        </span>

        <button
          onClick={() => onSimulateScenario('struggling')}
          className="px-2.5 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-950/70 border border-amber-800/50 text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>🧘 Struggling (3 Hints + 2 Errors)</span>
          <span className="text-[9px] font-mono text-amber-400/80">→ Minimalist Focus</span>
        </button>

        <button
          onClick={() => onSimulateScenario('excelling')}
          className="px-2.5 py-1 rounded-lg bg-pink-950/40 hover:bg-pink-950/70 border border-pink-800/50 text-pink-300 transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>🚀 High-Performer (15s Speed + Streak)</span>
          <span className="text-[9px] font-mono text-pink-400/80">→ Gamified Arena</span>
        </button>

        <button
          onClick={() => onSimulateScenario('analytical')}
          className="px-2.5 py-1 rounded-lg bg-sky-950/40 hover:bg-sky-950/70 border border-sky-800/50 text-sky-300 transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>📊 Deep Analytical Dwell</span>
          <span className="text-[9px] font-mono text-sky-400/80">→ Data Heavy</span>
        </button>

        <button
          onClick={() => onSimulateScenario('steady')}
          className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>🧭 Steady Pace</span>
          <span className="text-[9px] font-mono text-slate-400">→ Dashboard</span>
        </button>
      </div>
    </div>
  );
};
