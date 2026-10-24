import React, { useEffect, useState } from 'react';
import { OrchestratedInsightResponse, PerformanceTag, DynamicUiState } from '../types/learning.ts';
import { Sparkles, Zap, Brain, HeartHandshake, Swords, ArrowRight, Award, MessageSquareHeart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { InteractiveTypeScriptText } from './InteractiveTypeScriptText.tsx';

interface OrchestratedInsightBannerProps {
  insight: OrchestratedInsightResponse | null;
  onActionClick: () => void;
  onRequestFreshInsight: () => void;
  isLoading: boolean;
}

export const OrchestratedInsightBanner: React.FC<OrchestratedInsightBannerProps> = ({
  insight,
  onActionClick,
  onRequestFreshInsight,
  isLoading,
}) => {
  const [showEncouragementModal, setShowEncouragementModal] = useState(false);

  useEffect(() => {
    if (!insight) return;

    if (insight.dynamic_ui_state === 'show_confetti') {
      confetti({
        particleCount: 65,
        spread: 65,
        origin: { y: 0.5 },
        colors: ['#10b981', '#6366f1', '#ec4899', '#f59e0b'],
      });
    } else if (insight.dynamic_ui_state === 'show_encouragement_popup') {
      setShowEncouragementModal(true);
      const timer = setTimeout(() => setShowEncouragementModal(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [insight]);

  if (!insight) return null;

  const getTagStyle = (tag: PerformanceTag) => {
    switch (tag) {
      case 'Fast Learner':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          icon: <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/30" />,
        };
      case 'Deep Thinker':
        return {
          bg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
          icon: <Brain className="w-3.5 h-3.5 text-indigo-400" />,
        };
      case 'Needs Quick Revision':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          icon: <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'Ready for Challenge':
        return {
          bg: 'bg-pink-500/15 border-pink-500/30 text-pink-300',
          icon: <Swords className="w-3.5 h-3.5 text-pink-400" />,
        };
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-300',
          icon: <Sparkles className="w-3.5 h-3.5 text-slate-400" />,
        };
    }
  };

  const tagStyle = getTagStyle(insight.performance_tag);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-4 shadow-xl backdrop-blur-md animate-fade-in">
      {/* Dynamic encouragement popup toast */}
      {showEncouragementModal && (
        <div className="absolute top-2 right-2 z-20 bg-amber-950/90 border border-amber-500/50 text-amber-200 px-3 py-1.5 rounded-xl shadow-lg text-xs flex items-center gap-2 animate-bounce">
          <HeartHandshake className="w-4 h-4 text-amber-400" />
          <span>Encouragement boost active: Take your time, you've got this!</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: AI Insight & Badge */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/30">
            <MessageSquareHeart className="w-5 h-5" />
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                Dishasathi AI Companion
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${tagStyle.bg}`}>
                {tagStyle.icon}
                <span>{insight.performance_tag}</span>
              </span>
              {insight.dynamic_ui_state === 'unlock_new_badge' && (
                <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3 text-purple-400" />
                  Badge Unlocked!
                </span>
              )}
            </div>

            <div className="text-sm font-medium text-slate-100 leading-snug">
              <InteractiveTypeScriptText
                text={insight.personalized_insight}
                enableTypewriter={true}
                typewriterSpeedMs={14}
                showInspectorButton={false}
              />
            </div>
          </div>
        </div>

        {/* Right: Dynamic Next Recommended Action CTA */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-between md:justify-end">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-200">
              {insight.next_recommended_action.title}
            </span>
            <span className="text-[11px] text-slate-400 max-w-xs truncate">
              {insight.next_recommended_action.description}
            </span>
          </div>

          <button
            onClick={onActionClick}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>{insight.next_recommended_action.button_text}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
