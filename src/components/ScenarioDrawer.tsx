import React, { useState } from 'react';
import { Sliders, Play, Code2, Globe, RefreshCw, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { AdaptiveUILayout } from '../types/learning.ts';

interface ScenarioDrawerProps {
  onSimulateScenario: (scenario: 'struggling' | 'excelling' | 'analytical' | 'steady') => void;
  onRun60SecDemo: () => void;
  onOpenJsonInspector: () => void;
  onOpenGroundedSearch: () => void;
  onTriggerAdaptationNow: () => void;
  isAdapting: boolean;
}

export const ScenarioDrawer: React.FC<ScenarioDrawerProps> = ({
  onSimulateScenario,
  onRun60SecDemo,
  onOpenJsonInspector,
  onOpenGroundedSearch,
  onTriggerAdaptationNow,
  isAdapting,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-4 shadow-xl backdrop-blur-md transition-all">
      {/* Accordion Toggle Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <span>Evaluator & Testing Tools</span>
          <span className="text-[10px] font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            Simulate Student Scenarios
          </span>
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
        </button>

        {/* Quick Trigger Adapt button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerAdaptationNow}
            disabled={isAdapting}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isAdapting ? 'animate-spin' : ''}`} />
            <span>{isAdapting ? 'Adapting...' : 'Sync AI Engine'}</span>
          </button>
        </div>
      </div>

      {/* Expanded Tools */}
      {isOpen && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-3 animate-fade-in">
          <div className="text-xs text-slate-400">
            Quickly test how the AI engine adapts to different student behaviors:
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Scenario 1: Struggling */}
            <button
              onClick={() => onSimulateScenario('struggling')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-600/50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>⚠️ Simulate Struggle (Hints & Errors)</span>
            </button>

            {/* Scenario 2: Excelling */}
            <button
              onClick={() => onSimulateScenario('excelling')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-600/50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🚀 Simulate Fast Mastery (High Accuracy)</span>
            </button>

            {/* Scenario 3: Deep Thinker */}
            <button
              onClick={() => onSimulateScenario('analytical')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-950/40 hover:bg-sky-900/50 text-sky-300 border border-sky-600/50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🧠 Simulate Deep Study (High Dwell)</span>
            </button>

            {/* Scenario 4: Steady */}
            <button
              onClick={() => onSimulateScenario('steady')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>⚖️ Reset to Baseline</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
            <button
              onClick={onRun60SecDemo}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>Run 60s Guided Demo</span>
            </button>

            <button
              onClick={onOpenJsonInspector}
              className="px-3 py-1.5 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Inspect Telemetry JSON</span>
            </button>

            <button
              onClick={onOpenGroundedSearch}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-950/50 hover:bg-sky-900/60 text-sky-300 border border-sky-800/60 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>Google Search Grounded Docs</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
