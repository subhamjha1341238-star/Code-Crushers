import React from 'react';
import { Brain, Target, CheckCircle2, Flame, LogIn, LogOut, Cloud, Globe } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  activeView: 'workspace' | 'roadmap' | 'progress';
  onSelectView: (view: 'workspace' | 'roadmap' | 'progress') => void;
  focusScore: number;
  completedSteps: number;
  totalSteps: number;
  streakCount: number;
  user: User | null;
  isSyncing: boolean;
  onSignInWithGoogle: () => void;
  onLogout: () => void;
  onOpenGroundedDocs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onSelectView,
  focusScore,
  completedSteps,
  totalSteps,
  streakCount,
  user,
  isSyncing,
  onSignInWithGoogle,
  onLogout,
  onOpenGroundedDocs,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 border-b border-slate-800/80 backdrop-blur-md px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark & Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                Dishasathi <span className="text-indigo-400">AI</span>
              </span>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              दिशासाथी AI • Intelligent Adaptive Learning Companion
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single-line, non-cluttered) */}
        <nav className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => onSelectView('workspace')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'workspace'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Learn & Practice
          </button>

          <button
            onClick={() => onSelectView('roadmap')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'roadmap'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Roadmap Journey
          </button>

          <button
            onClick={() => onSelectView('progress')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'progress'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Progress
          </button>
        </nav>

        {/* Zone 3: Session Metrics & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Score Badge */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono text-slate-400">Score:</span>
            <span className="text-xs font-bold font-mono text-emerald-400">
              {focusScore}/100
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-xs font-mono text-slate-300">
              {completedSteps}/{totalSteps} Done
            </span>
          </div>

          {/* User Auth */}
          {user ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 pl-1.5 pr-2 py-1 rounded-2xl">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-6 h-6 rounded-full border border-indigo-400/50"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-[10px] font-bold flex items-center justify-center text-white">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-200 hidden lg:inline max-w-[80px] truncate">
                {user.displayName?.split(' ')[0] || 'Learner'}
              </span>
              <button
                onClick={onLogout}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignInWithGoogle}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 cursor-pointer active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
