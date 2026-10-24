import React, { useState, useEffect } from 'react';
import { Wind, X, Check } from 'lucide-react';

interface BreatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const BreatherModal: React.FC<BreatherModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(15);
      setPhase('Inhale');
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  // Phase cycling based on seconds remaining
  useEffect(() => {
    const elapsed = 15 - secondsRemaining;
    const cycle = elapsed % 12;
    if (cycle < 4) {
      setPhase('Inhale');
    } else if (cycle < 8) {
      setPhase('Hold');
    } else {
      setPhase('Exhale');
    }
  }, [secondsRemaining]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
          <Wind className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">Mindful Reset</h3>
        <p className="text-xs text-slate-400 max-w-xs mb-6">
          Take a deep breath. Mental consolidation happens when tension releases.
        </p>

        {/* Animated Breathing Circle */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
          <div
            className={`absolute inset-0 rounded-full border-4 border-indigo-400/40 transition-all duration-1000 ${
              phase === 'Inhale'
                ? 'scale-110 bg-indigo-500/20'
                : phase === 'Hold'
                ? 'scale-110 bg-indigo-500/30 ring-4 ring-indigo-400/20'
                : 'scale-90 bg-indigo-500/10'
            }`}
          />
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold uppercase tracking-wider text-indigo-300">
              {phase}
            </span>
            <span className="text-3xl font-black font-mono text-white mt-1">
              {secondsRemaining}s
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => {
              onComplete();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>I'm Ready to Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
