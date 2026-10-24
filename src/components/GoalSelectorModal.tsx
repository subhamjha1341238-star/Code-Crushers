import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Layers, Target, ArrowRight } from 'lucide-react';

interface GoalSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGoal: (goal: string) => void;
  currentGoal: string;
}

const POPULAR_GOALS = [
  {
    title: 'React 19 & Modern Full-Stack Web Development',
    desc: 'Hooks, Server Components, State Management & Vite architecture.',
    category: 'Frontend & Full-Stack',
    icon: '⚛️',
  },
  {
    title: 'Generative AI Systems, Prompt Engineering & LLM Agents',
    desc: 'Grounding, tool calls, structured JSON outputs & token economics.',
    category: 'AI & Machine Learning',
    icon: '🤖',
  },
  {
    title: 'Python Data Science & Predictive Analytics',
    desc: 'Pandas, NumPy, data cleansing, statistical modeling in 30 days.',
    category: 'Data Science',
    icon: '🐍',
  },
  {
    title: 'Microservices & Distributed Systems Architecture',
    desc: 'Event-driven message queues, idempotency, consensus, scalability.',
    category: 'Backend Architecture',
    icon: '🌐',
  },
  {
    title: 'Cybersecurity & Offensive / Defensive Fundamentals',
    desc: 'Threat modeling, JWT security, SQL injection defenses, penetration testing.',
    category: 'Security',
    icon: '🛡️',
  },
];

export const GoalSelectorModal: React.FC<GoalSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectGoal,
  currentGoal,
}) => {
  const [customGoal, setCustomGoal] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customGoal.trim()) {
      onSelectGoal(customGoal.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Select or Customize Skill Goal</h3>
              <p className="text-xs text-slate-400">
                AI will build an instant bite-sized roadmap calibrated from "where do I start?"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom Input */}
        <form onSubmit={handleCustomSubmit} className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Enter Any Custom Skill or Topic:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder="e.g., Rust Memory Safety, Kubernetes Deployment, Digital Marketing..."
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!customGoal.trim()}
              className="px-5 py-2.5 rounded-xl font-medium text-sm bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Build Path</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Preset Cards */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Or Choose from Popular Mastery Tracks:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {POPULAR_GOALS.map((goal, idx) => {
              const isSelected = goal.title === currentGoal;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectGoal(goal.title);
                    onClose();
                  }}
                  className={`text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100 ring-2 ring-indigo-500/20'
                      : 'bg-slate-950/40 hover:bg-slate-800/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-100 line-clamp-1">{goal.title}</div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{goal.desc}</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[10px] font-mono text-indigo-400">
                    <span>{goal.category}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
