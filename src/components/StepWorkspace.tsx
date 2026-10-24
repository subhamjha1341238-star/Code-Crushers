import React, { useState } from 'react';
import { LearningStep, StudentTelemetry } from '../types/learning.ts';
import { InteractiveLab } from './InteractiveLab.tsx';
import { InteractiveChallenge } from './InteractiveChallenge.tsx';
import { Cpu, CheckSquare, FileText, Sparkles, BookOpen } from 'lucide-react';

interface StepWorkspaceProps {
  currentStep: LearningStep;
  telemetry: StudentTelemetry;
  onRecordAction: (action: string, details?: string) => void;
  onRequestHint: () => void;
  onCompleteStep: (success: boolean) => void;
  onTriggerBreather: () => void;
}

export const StepWorkspace: React.FC<StepWorkspaceProps> = ({
  currentStep,
  telemetry,
  onRecordAction,
  onRequestHint,
  onCompleteStep,
  onTriggerBreather,
}) => {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'challenge' | 'notes'>('challenge');
  const [userNotes, setUserNotes] = useState<string>('');

  return (
    <div className="flex flex-col gap-4">
      {/* Workspace Interactive Mode Selector Tabs */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          {/* Quiz Challenge Tab */}
          <button
            onClick={() => {
              setActiveTab('challenge');
              onRecordAction('Switched to Quiz Challenge tab');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'challenge'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Mastery Quiz</span>
          </button>

          {/* Interactive Sandbox Tab */}
          <button
            onClick={() => {
              setActiveTab('sandbox');
              onRecordAction('Switched to Interactive Lab tab');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sandbox'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Hands-on Sandbox</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {/* Notes / Scratchpad Tab */}
          <button
            onClick={() => {
              setActiveTab('notes');
              onRecordAction('Switched to Notes tab');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Scratchpad</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 pr-2">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Interactive Learning Mode</span>
        </div>
      </div>

      {/* Tab 1: Quiz Challenge */}
      {activeTab === 'challenge' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
          <InteractiveChallenge
            step={currentStep}
            telemetry={telemetry}
            onRecordAction={onRecordAction}
            onRequestHint={onRequestHint}
            onCompleteStep={onCompleteStep}
            onTriggerBreather={onTriggerBreather}
          />
        </div>
      )}

      {/* Tab 2: Interactive Sandbox */}
      {activeTab === 'sandbox' && (
        <InteractiveLab
          step={currentStep}
          onRecordAction={onRecordAction}
        />
      )}

      {/* Tab 3: Notes & Scratchpad */}
      {activeTab === 'notes' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Participant Step Scratchpad</h3>
              <p className="text-xs text-slate-400">
                Jot down key formulas, concepts, or thoughts while learning. Notes stay saved during your session.
              </p>
            </div>
          </div>

          <textarea
            value={userNotes}
            onChange={(e) => {
              setUserNotes(e.target.value);
              onRecordAction('Scratchpad updated', `${e.target.value.length} chars`);
            }}
            placeholder="Type your notes or reflections on this milestone..."
            className="w-full h-44 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
          />

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Character count: {userNotes.length}</span>
            <span className="text-emerald-400 font-mono">Auto-saving locally</span>
          </div>
        </div>
      )}
    </div>
  );
};
