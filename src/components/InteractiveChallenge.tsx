import React, { useState, useEffect } from 'react';
import { LearningStep, StudentTelemetry } from '../types/learning.ts';
import { Lightbulb, CheckCircle2, XCircle, ArrowRight, Sparkles, Wind, Clock, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { InteractiveTypeScriptText } from './InteractiveTypeScriptText.tsx';

interface InteractiveChallengeProps {
  step: LearningStep;
  telemetry: StudentTelemetry;
  onRecordAction: (action: string, details?: string) => void;
  onRequestHint: () => void;
  onCompleteStep: (success: boolean) => void;
  onTriggerBreather: () => void;
  activeLayout?: string;
}

export const InteractiveChallenge: React.FC<InteractiveChallengeProps> = ({
  step,
  telemetry,
  onRecordAction,
  onRequestHint,
  onCompleteStep,
  onTriggerBreather,
  activeLayout,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [revealedHints, setRevealedHints] = useState<number>(0);

  // Reset local state when step changes
  useEffect(() => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setIsCorrect(null);
    setRevealedHints(0);
  }, [step.id]);

  const challenge = step.interactiveChallenge;

  const handleSelect = (option: string) => {
    if (hasSubmitted && isCorrect) return;
    setSelectedOption(option);
    onRecordAction('Quiz Option Selected', option);
  };

  const handleHintClick = () => {
    const nextHintIdx = revealedHints + 1;
    setRevealedHints(nextHintIdx);
    onRequestHint();
    onRecordAction('Hint Requested', `Hint #${nextHintIdx}`);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;

    setHasSubmitted(true);
    const correct = String(selectedOption).trim() === String(challenge.correctAnswer).trim();
    setIsCorrect(correct);

    if (correct) {
      onRecordAction('Quiz Success', selectedOption);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#6366f1', '#ec4899', '#f59e0b'],
      });
      onCompleteStep(true);
    } else {
      onRecordAction('Quiz Failed Attempt', selectedOption);
      onCompleteStep(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Step Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-semibold rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            {step.category || 'Core Skill'}
          </span>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Est. {step.durationEstimateSec}s
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mindful Breather */}
          <button
            onClick={onTriggerBreather}
            className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Take a 15-second mindful breather"
          >
            <Wind className="w-3.5 h-3.5 text-sky-400" />
            <span>Need a Breather?</span>
          </button>

          {/* Hint button */}
          {challenge.hints && revealedHints < challenge.hints.length && (
            <button
              onClick={handleHintClick}
              className="px-3 py-1.5 text-xs font-medium rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Hint ({revealedHints}/{challenge.hints.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Challenge Question Prompt */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold flex items-center justify-between">
          <span>Mastery Check Challenge</span>
          <span className="text-[10px] text-slate-400 font-mono">Interactive TypeScript Text Active</span>
        </span>
        <div className="text-lg md:text-xl font-bold text-white leading-snug">
          <InteractiveTypeScriptText
            text={challenge.prompt}
            enableTypewriter={true}
            typewriterSpeedMs={14}
            showInspectorButton={true}
          />
        </div>

        {step.microAction && (
          <div className="text-xs text-slate-300 bg-indigo-950/40 border border-indigo-900/60 rounded-xl px-3.5 py-2.5 mt-1 flex items-start gap-2">
            <span className="text-base shrink-0">🎯</span>
            <div className="flex-1">
              <strong className="text-indigo-200 block mb-0.5">What to do:</strong>
              <InteractiveTypeScriptText
                text={step.microAction}
                enableTypewriter={false}
                showInspectorButton={false}
              />
            </div>
          </div>
        )}
      </div>

      {/* Hints Accordion */}
      {revealedHints > 0 && challenge.hints && (
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-amber-950/20 border border-amber-700/40 animate-fade-in">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Scaffolded Hints:</span>
          </div>
          {challenge.hints.slice(0, revealedHints).map((hint, idx) => (
            <div key={idx} className="text-xs text-amber-100/90 pl-3 border-l-2 border-amber-500 py-0.5">
              <strong className="text-amber-300">Hint {idx + 1}:</strong> {hint}
            </div>
          ))}
        </div>
      )}

      {/* Interactive Options List */}
      <div className="grid grid-cols-1 gap-2.5">
        {challenge.options?.map((option, index) => {
          const isSelected = selectedOption === option;
          const isCorrectAnswer = hasSubmitted && option === challenge.correctAnswer;
          const isWrongSelection = hasSubmitted && isSelected && !isCorrect;

          let btnClass = 'bg-slate-800/60 hover:bg-slate-800/90 border-slate-700/70 text-slate-200';
          if (isSelected && !hasSubmitted) {
            btnClass = 'bg-indigo-600/20 border-indigo-500 text-indigo-100 ring-2 ring-indigo-500/30';
          }
          if (isCorrectAnswer) {
            btnClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/40';
          } else if (isWrongSelection) {
            btnClass = 'bg-rose-950/60 border-rose-500 text-rose-100 ring-2 ring-rose-500/40';
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              disabled={hasSubmitted && isCorrect === true}
              className={`w-full text-left p-4 rounded-2xl border text-sm transition-all flex items-start gap-3 cursor-pointer ${btnClass}`}
            >
              <span
                className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-700/60 text-slate-300'
                }`}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1 leading-relaxed font-medium">{option}</span>
              {isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              {isWrongSelection && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Explanation Feedback on Submit */}
      {hasSubmitted && (
        <div
          className={`p-4 rounded-2xl border text-xs leading-relaxed animate-fade-in ${
            isCorrect
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="font-bold flex items-center gap-1.5 mb-1.5 text-sm">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Excellent! That is the correct solution.</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Not quite — take a look at the explanation below and try another option!</span>
              </>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700/50">
            <InteractiveTypeScriptText
              text={challenge.explanation}
              enableTypewriter={true}
              typewriterSpeedMs={12}
              showInspectorButton={true}
            />
          </div>
        </div>
      )}

      {/* Action Submit / Next Milestone Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-slate-400">
          Time on Step: <span className="font-mono text-slate-200 font-bold">{telemetry.timeSpentOnCurrentStepSec}s</span>
        </div>

        <div>
          {!hasSubmitted || !isCorrect ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                selectedOption
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Submit & Check</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onCompleteStep(true)}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Milestone Conquered! Next Step</span>
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
