import React, { useState, useEffect } from 'react';
import { X, Play, Sparkles, CheckCircle2, ArrowRight, Activity, Feather, Flame, ShieldAlert, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GuidedDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDemoComplete: (scenario: 'struggling' | 'excelling') => void;
}

export const GuidedDemoModal: React.FC<GuidedDemoModalProps> = ({
  isOpen,
  onClose,
  onDemoComplete,
}) => {
  const [demoStep, setDemoStep] = useState<number>(1);
  const [countdown, setCountdown] = useState<number>(60);
  const [simulatedTelemetry, setSimulatedTelemetry] = useState<{
    dwell: number;
    hints: number;
    attempts: number;
  }>({ dwell: 8, hints: 0, attempts: 0 });

  useEffect(() => {
    if (!isOpen) {
      setDemoStep(1);
      setCountdown(60);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (demoStep === 1) {
      setDemoStep(2);
      setSimulatedTelemetry({ dwell: 35, hints: 1, attempts: 1 });
    } else if (demoStep === 2) {
      setDemoStep(3);
      setSimulatedTelemetry({ dwell: 70, hints: 2, attempts: 2 });
    } else if (demoStep === 3) {
      setDemoStep(4);
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      onDemoComplete('struggling');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Play className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">60-Second Guided Demo</h3>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Step {demoStep} of 4
                </span>
              </div>
              <p className="text-xs text-slate-400">From "Where do I start?" to a confident first practical victory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 60s Demo Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-indigo-500 transition-all duration-300"
            style={{ width: `${(demoStep / 4) * 100}%` }}
          />
        </div>

        {/* Demo Content by Step */}
        <div className="min-h-[220px] flex flex-col justify-center">
          {demoStep === 1 && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                Phase 1: "Where Do I Start?" — Zero Friction
              </span>
              <h4 className="text-xl font-bold text-slate-100">
                Overwhelmed by a massive new skill? We replace 200 pages with 1 micro-win.
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Traditional platforms dump huge textbooks or multi-hour videos. Dishasathi AI immediately isolates the single foundational mental model. You don't have to figure anything out — your next action is obvious.
              </p>
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300">
                🎯 <strong>Micro-Target:</strong> Identify the core mechanism in under 60 seconds with instant feedback.
              </div>
            </div>
          )}

          {demoStep === 2 && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Phase 2: Live Interaction Telemetry Engine
              </span>
              <h4 className="text-xl font-bold text-slate-100">
                We don't wait for semester exam scores — every click and second is live.
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                As the student interacts, the telemetry engine silently logs active dwell time, hesitation pauses, hints requested, and error patterns in real-time.
              </p>
              <div className="grid grid-cols-3 gap-2 mt-1 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500">Dwell Time</div>
                  <div className="text-amber-400 font-bold">{simulatedTelemetry.dwell}s</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500">Hints Clicked</div>
                  <div className="text-amber-400 font-bold">{simulatedTelemetry.hints}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500">Quiz Retries</div>
                  <div className="text-rose-400 font-bold">{simulatedTelemetry.attempts}</div>
                </div>
              </div>
            </div>
          )}

          {demoStep === 3 && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <span className="text-xs font-mono font-bold text-pink-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Phase 3: Real-Time Dynamic Morphing
              </span>
              <h4 className="text-xl font-bold text-slate-100">
                The UI layout switches automatically to match the learner's cognitive state.
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Struggling? The UI morphs into <strong>Minimalist Focus</strong>: distractions stripped, micro-scaffolding inserted into Mermaid roadmap. Flying fast? It morphs into <strong>Gamified Arena</strong> with combos and boss tiers!
              </p>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <Feather className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  <strong>AI Action:</strong> Switching layout to <code className="text-amber-300">minimalist_focus</code>, adjusting difficulty to <code className="text-amber-300">Made Easier</code>, and injecting revision branch node.
                </span>
              </div>
            </div>
          )}

          {demoStep === 4 && (
            <div className="flex flex-col gap-3 animate-fade-in text-center items-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-1">
                <Award className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold text-slate-100">
                First Confident Step Achieved! 🏆
              </h4>
              <p className="text-sm text-slate-300 max-w-md">
                Zero overwhelm, obvious next step, gamified motivation, and zero friction. The student is now confident, oriented, and ready to conquer the path!
              </p>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Skip Tour
          </button>

          <button
            onClick={handleNextStep}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>{demoStep === 4 ? 'Experience Live System Now' : 'Continue 60s Demo'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
