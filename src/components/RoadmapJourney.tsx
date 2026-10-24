import React, { useState } from 'react';
import { SkillRoadmapData, LearningStep } from '../types/learning.ts';
import { MermaidViewer } from './MermaidViewer.tsx';
import { CheckCircle2, Circle, ArrowRight, Clock, Target, Layers, MapPin } from 'lucide-react';

interface RoadmapJourneyProps {
  roadmap: SkillRoadmapData;
  currentStepIndex: number;
  totalCompletedSteps: number;
  mermaidDiagram: string;
  onSelectStep: (index: number) => void;
}

export const RoadmapJourney: React.FC<RoadmapJourneyProps> = ({
  roadmap,
  currentStepIndex,
  totalCompletedSteps,
  mermaidDiagram,
  onSelectStep,
}) => {
  const [showDiagram, setShowDiagram] = useState<boolean>(true);

  return (
    <div className="flex flex-col gap-6">
      {/* Roadmap Header Summary */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Adaptive Learning Journey
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-white mt-1">
            {roadmap.skillGoal}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {roadmap.summary || 'A step-by-step personalized curriculum dynamically calibrated to your performance.'}
          </p>
        </div>

        <button
          onClick={() => setShowDiagram(!showDiagram)}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>{showDiagram ? 'Hide Visual Diagram' : 'Show Visual Diagram'}</span>
        </button>
      </div>

      {/* Visual Flowchart (Mermaid) */}
      {showDiagram && (
        <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-950/80 p-2 shadow-xl">
          <MermaidViewer
            chart={mermaidDiagram || roadmap.mermaidRoadmap}
            title="Interactive Visual Roadmap"
          />
        </div>
      )}

      {/* Step by Step Interactive Milestones List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 px-1">
          Milestone Breakdown ({roadmap.steps.length} Steps)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {roadmap.steps.map((step, idx) => {
            const isCompleted = idx < totalCompletedSteps;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.id}
                onClick={() => onSelectStep(idx)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isCurrent
                    ? 'bg-indigo-950/30 border-indigo-500/60 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/10'
                    : isCompleted
                    ? 'bg-slate-900/80 border-emerald-500/30 hover:border-emerald-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="shrink-0 mt-0.5">
                      {isCompleted ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center text-indigo-300 font-bold font-mono text-xs animate-pulse">
                          {idx + 1}
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 font-mono text-xs">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Step {idx + 1}
                      </span>
                      <h4 className={`text-base font-bold ${isCurrent ? 'text-white' : 'text-slate-200'}`}>
                        {step.title}
                      </h4>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                      isCompleted
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : isCurrent
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {isCompleted ? 'Completed' : isCurrent ? 'Active Now' : 'Upcoming'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {step.microAction}
                </p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {step.durationEstimateSec}s
                    </span>
                    <span>•</span>
                    <span className="text-indigo-400 font-medium">{step.difficulty}</span>
                  </div>

                  <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
                    {isCurrent ? 'Practicing' : 'Select Step'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
