import React, { useState } from 'react';
import { X, Copy, Check, Code2, ArrowRight, RefreshCw, Send } from 'lucide-react';
import { StudentTelemetry, AdaptiveResponse, OrchestratedInsightResponse } from '../types/learning.ts';

interface JsonInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: StudentTelemetry;
  adaptiveResponse: AdaptiveResponse;
  orchestratedInsight?: OrchestratedInsightResponse | null;
  onSendCustomTelemetry: (custom: StudentTelemetry) => void;
  isAdapting: boolean;
}

export const JsonInspectorModal: React.FC<JsonInspectorModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  adaptiveResponse,
  orchestratedInsight,
  onSendCustomTelemetry,
  isAdapting,
}) => {
  const [activeTab, setActiveTab] = useState<'analyst' | 'response' | 'payload' | 'schema' | 'custom'>('analyst');
  const [copied, setCopied] = useState<string | null>(null);
  const [customJsonInput, setCustomJsonInput] = useState<string>(() => JSON.stringify(telemetry, null, 2));
  const [customError, setCustomError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCustomSubmit = () => {
    try {
      const parsed = JSON.parse(customJsonInput);
      setCustomError(null);
      onSendCustomTelemetry(parsed);
      setActiveTab('analyst');
    } catch (e: any) {
      setCustomError(`JSON Syntax Error: ${e.message}`);
    }
  };

  const schemaDefinition = {
    type: "object",
    properties: {
      live_performance_analysis: {
        type: "string",
        description: "A 1-sentence analysis of their live activity (e.g., 'Student completed the task 2 mins faster than average, speeding up the next step.')"
      },
      adaptive_ui_layout: {
        type: "string",
        enum: ["dashboard", "minimalist_focus", "gamified_arena", "data_heavy"],
        description: "Dynamically switch the frontend layout. Choose 'minimalist_focus' if they took too long or used hints, to remove distractions."
      },
      adaptive_next_step: {
        type: "object",
        properties: {
          step_title: { type: "string" },
          micro_action: { type: "string", description: "The exact next thing to do. Make it simpler if they struggled." },
          difficulty_adjustment: { type: "string", enum: ["Made Easier", "Kept Same", "Increased Difficulty"] }
        },
        required: ["step_title", "micro_action", "difficulty_adjustment"]
      },
      real_time_metrics: {
        type: "object",
        description: "Live stats to update the dashboard instantly based on their activity.",
        properties: {
          current_focus_score: { type: "integer", description: "Score out of 100 based on completion time and hint usage" },
          momentum_status: { type: "string", description: "e.g., 'On Fire!', 'Needs a Breather', 'Building Concept'" }
        },
        required: ["current_focus_score", "momentum_status"]
      },
      updated_roadmap_diagram: {
        type: "string",
        description: "Mermaid.js code for the roadmap. Add a new branch or revision node if they struggled in the live activity. Do NOT wrap in markdown ticks."
      }
    },
    required: ["live_performance_analysis", "adaptive_ui_layout", "adaptive_next_step", "real_time_metrics", "updated_roadmap_diagram"]
  };

  const analystSchemaDefinition = {
    type: "object",
    properties: {
      personalized_insight: {
        type: "string",
        description: "A human-like, encouraging 1-sentence feedback based on their invisible activity. (e.g., 'You grasped the core concept really fast, let's level up!')"
      },
      performance_tag: {
        type: "string",
        enum: ["Fast Learner", "Deep Thinker", "Needs Quick Revision", "Ready for Challenge"],
        description: "A visual badge to show on the UI based on their speed and accuracy."
      },
      next_recommended_action: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string", description: "What they should do next, dynamically adjusted to their performance without mentioning why." },
          button_text: { type: "string", description: "e.g., 'Take a Quiz', 'Watch 1-min Summary'" }
        },
        required: ["title", "description", "button_text"]
      },
      dynamic_ui_state: {
        type: "string",
        enum: ["show_confetti", "show_encouragement_popup", "unlock_new_badge"],
        description: "Tell the frontend what animation or popup to trigger to gamify the experience."
      }
    },
    required: ["personalized_insight", "performance_tag", "next_recommended_action", "dynamic_ui_state"]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Live Telemetry & AI Output Inspector</h3>
              <p className="text-xs text-slate-400">Verify structured JSON telemetry analysis and schema adherence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center justify-between gap-2 mt-4 pb-2 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab('analyst')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'analyst'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              AI Analyst & Orchestrator
            </button>
            <button
              onClick={() => setActiveTab('response')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'response'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              Adaptive Layout & Roadmap
            </button>
            <button
              onClick={() => setActiveTab('payload')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'payload'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              Silent Telemetry Log
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'schema'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              Analyst Schema
            </button>
            <button
              onClick={() => {
                setCustomJsonInput(JSON.stringify(telemetry, null, 2));
                setActiveTab('custom');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              Custom JSON Tester
            </button>
          </div>

          {activeTab !== 'custom' && (
            <button
              onClick={() => {
                const content = activeTab === 'analyst'
                  ? JSON.stringify(orchestratedInsight, null, 2)
                  : activeTab === 'response'
                  ? JSON.stringify(adaptiveResponse, null, 2)
                  : activeTab === 'payload'
                  ? JSON.stringify(telemetry, null, 2)
                  : JSON.stringify(analystSchemaDefinition, null, 2);
                handleCopy(content, activeTab);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied === activeTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === activeTab ? 'Copied!' : 'Copy'}</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto mt-3 rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed">
          {activeTab === 'analyst' && (
            <div className="flex flex-col gap-3">
              <div className="text-[11px] text-purple-300 font-sans bg-purple-950/40 border border-purple-800/40 p-2.5 rounded-xl">
                🔒 <strong>Silent Telemetry Analysis:</strong> Raw telemetry values are processed invisibly in the background. Notice how <strong>no raw seconds or error counts</strong> are mentioned in the personalized insight below!
              </div>
              <pre className="whitespace-pre-wrap break-words text-purple-300/90">
                {JSON.stringify(orchestratedInsight, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'response' && (
            <pre className="whitespace-pre-wrap break-words text-emerald-300/90">
              {JSON.stringify(adaptiveResponse, null, 2)}
            </pre>
          )}

          {activeTab === 'payload' && (
            <pre className="whitespace-pre-wrap break-words text-sky-300/90">
              {JSON.stringify(telemetry, null, 2)}
            </pre>
          )}

          {activeTab === 'schema' && (
            <pre className="whitespace-pre-wrap break-words text-purple-300/90">
              {JSON.stringify(schemaDefinition, null, 2)}
            </pre>
          )}

          {activeTab === 'custom' && (
            <div className="flex flex-col gap-3">
              <div className="text-[11px] text-slate-400 font-sans">
                Paste or edit any student telemetry payload below and click <strong>Simulate AI Adaptation</strong> to evaluate the AI's live response.
              </div>
              <textarea
                value={customJsonInput}
                onChange={(e) => setCustomJsonInput(e.target.value)}
                rows={14}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 font-mono text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              {customError && (
                <div className="text-xs text-rose-400 font-sans">{customError}</div>
              )}
              <div className="flex justify-end">
                <button
                  onClick={handleCustomSubmit}
                  disabled={isAdapting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simulate AI Adaptation</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
