import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StudentTelemetry,
  AdaptiveResponse,
  SkillRoadmapData,
  LearningStep,
  OrchestratedInsightResponse,
} from './types/learning.ts';
import { getFallbackRoadmap } from './server/geminiService.ts';
import { Header } from './components/Header.tsx';
import { ProgressHeader } from './components/ProgressHeader.tsx';
import { StepWorkspace } from './components/StepWorkspace.tsx';
import { RoadmapJourney } from './components/RoadmapJourney.tsx';
import { ProgressAnalyticsView } from './components/ProgressAnalyticsView.tsx';
import { ScenarioDrawer } from './components/ScenarioDrawer.tsx';
import { GoalSelectorModal } from './components/GoalSelectorModal.tsx';
import { JsonInspectorModal } from './components/JsonInspectorModal.tsx';
import { GuidedDemoModal } from './components/GuidedDemoModal.tsx';
import { GroundedKnowledgeModal } from './components/GroundedKnowledgeModal.tsx';
import { BreatherModal } from './components/BreatherModal.tsx';
import { useAuth } from './context/AuthContext.tsx';
import { calculateStudentProgressScore } from './utils/scoring.ts';
import { generateAuthenticMomentumAndStreak } from './utils/momentum.ts';
import { CheckCircle2, Circle, ArrowRight, Layers, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const INITIAL_SKILL = 'React 19 & Full-Stack Web Development';

export default function App() {
  const { user, signInWithGoogle, logout, saveSessionToFirestore, isSyncing } = useAuth();
  const [skillGoal, setSkillGoal] = useState<string>(INITIAL_SKILL);
  const [roadmap, setRoadmap] = useState<SkillRoadmapData>(() => getFallbackRoadmap(INITIAL_SKILL));
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [activeView, setActiveView] = useState<'workspace' | 'roadmap' | 'progress'>('workspace');
  const [isAdapting, setIsAdapting] = useState<boolean>(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isGroundedModalOpen, setIsGroundedModalOpen] = useState<boolean>(false);
  const [isBreatherModalOpen, setIsBreatherModalOpen] = useState<boolean>(false);

  // Orchestrated AI Analyst insight (silent processing of raw telemetry)
  const [orchestratedInsight, setOrchestratedInsight] = useState<OrchestratedInsightResponse | null>({
    personalized_insight: "Welcome to your personalized roadmap! Master the core concept, then test it in the interactive sandbox.",
    performance_tag: "Ready for Challenge",
    next_recommended_action: {
      title: "Mental Model Micro-Step",
      description: "Take the first bite-sized interactive challenge.",
      button_text: "Start Micro-Win",
    },
    dynamic_ui_state: "unlock_new_badge",
  });

  // Live telemetry state (starts strictly from student session start with 0 completed steps)
  const [telemetry, setTelemetry] = useState<StudentTelemetry>(() => ({
    sessionId: `sess-${Math.random().toString(36).substring(2, 8)}`,
    skillGoal: INITIAL_SKILL,
    currentStepId: 'step-1',
    currentStepTitle: 'First Victory: 60-Second Mental Model',
    timeSpentOnCurrentStepSec: 0,
    expectedStepDurationSec: 45,
    hintsClicked: 0,
    quizAttempts: 0,
    consecutiveErrors: 0,
    lastQuizResult: 'none',
    idleTimeSec: 0,
    rapidClicksCount: 0,
    tabBlurCount: 0,
    recentActions: [
      { timestamp: Date.now(), action: 'Session Initialized', details: 'Awaiting student first action' },
    ],
    totalStepsCompleted: 0,
    totalRoadmapSteps: 4,
    correctAnswers: 0,
    incorrectAnswers: 0,
    streakCount: 0,
    progressPercent: 0,
    masteryScore: 0,
  }));

  // AI Adaptive state - score and momentum calculated dynamically from student progress
  const [adaptiveState, setAdaptiveState] = useState<AdaptiveResponse>(() => {
    const initialTelemetry: StudentTelemetry = {
      sessionId: 'init',
      skillGoal: INITIAL_SKILL,
      currentStepId: 'step-1',
      currentStepTitle: 'First Victory: 60-Second Mental Model',
      timeSpentOnCurrentStepSec: 0,
      expectedStepDurationSec: 45,
      hintsClicked: 0,
      quizAttempts: 0,
      consecutiveErrors: 0,
      idleTimeSec: 0,
      rapidClicksCount: 0,
      tabBlurCount: 0,
      recentActions: [],
      totalStepsCompleted: 0,
      totalRoadmapSteps: 4,
      correctAnswers: 0,
      incorrectAnswers: 0,
      streakCount: 0,
    };
    const initialMetrics = calculateStudentProgressScore(initialTelemetry, 4);
    const initialMomentum = generateAuthenticMomentumAndStreak(initialTelemetry);

    return {
      live_performance_analysis: 'Session initialized. Complete your first micro-challenge below to begin calculating your live progress mastery score!',
      adaptive_ui_layout: 'dashboard',
      adaptive_next_step: {
        step_title: 'First Victory: Mental Model & First Line',
        micro_action: 'Identify the primary mechanism of this skill in one glance.',
        difficulty_adjustment: 'Kept Same',
      },
      real_time_metrics: {
        current_focus_score: initialMetrics.focusScore,
        momentum_status: initialMetrics.momentumStatus,
        progress_percent: initialMetrics.progressPercent,
        accuracy_percent: initialMetrics.accuracyPercent,
        xp_earned: initialMetrics.xpEarned,
      },
      weekly_momentum: initialMomentum.weekly_momentum,
      habit_streak: initialMomentum.habit_streak,
      updated_roadmap_diagram: roadmap.mermaidRoadmap,
    };
  });

  const currentStep: LearningStep = roadmap.steps[currentStepIndex] || roadmap.steps[0];
  const lastActiveTimestamp = useRef<number>(Date.now());
  const clickCountRecent = useRef<number>(0);

  // Active step live timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => {
        const timeNow = Date.now();
        const isIdle = timeNow - lastActiveTimestamp.current > 7000;
        return {
          ...prev,
          timeSpentOnCurrentStepSec: prev.timeSpentOnCurrentStepSec + 1,
          idleTimeSec: isIdle ? prev.idleTimeSec + 1 : prev.idleTimeSec,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Track global user interaction for idle detection
  useEffect(() => {
    const handleActivity = () => {
      lastActiveTimestamp.current = Date.now();
      clickCountRecent.current += 1;
      if (clickCountRecent.current > 5) {
        setTelemetry((prev) => ({
          ...prev,
          rapidClicksCount: prev.rapidClicksCount + 1,
        }));
      }
    };

    const resetClicksInterval = setInterval(() => {
      clickCountRecent.current = 0;
    }, 2000);

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearInterval(resetClicksInterval);
    };
  }, []);

  // Core API call to adapt live telemetry
  const triggerAdaptation = useCallback(
    async (telemetryOverride?: StudentTelemetry) => {
      const payloadToSend = telemetryOverride || telemetry;
      setIsAdapting(true);

      const liveCalculated = calculateStudentProgressScore(payloadToSend, roadmap.steps.length);

      try {
        const [adaptRes, insightRes] = await Promise.allSettled([
          fetch('/api/adapt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadToSend),
          }).then((r) => r.json()),
          fetch('/api/orchestrate-insight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadToSend),
          }).then((r) => r.json()),
        ]);

        if (adaptRes.status === 'fulfilled') {
          const data: AdaptiveResponse = adaptRes.value;
          const authenticMomentum = generateAuthenticMomentumAndStreak(payloadToSend);
          const mergedData: AdaptiveResponse = {
            ...data,
            weekly_momentum: data.weekly_momentum || authenticMomentum.weekly_momentum,
            habit_streak: data.habit_streak || authenticMomentum.habit_streak,
            real_time_metrics: {
              ...data.real_time_metrics,
              current_focus_score: typeof data.real_time_metrics?.current_focus_score === 'number'
                ? data.real_time_metrics.current_focus_score
                : liveCalculated.focusScore,
              momentum_status: data.real_time_metrics?.momentum_status || liveCalculated.momentumStatus,
              progress_percent: liveCalculated.progressPercent,
              accuracy_percent: liveCalculated.accuracyPercent,
              xp_earned: liveCalculated.xpEarned,
            },
          };

          setAdaptiveState(mergedData);

          if (user) {
            saveSessionToFirestore(payloadToSend, mergedData).catch((err) => {
              console.warn('Firestore auto-sync skipped:', err);
            });
          }
        }

        if (insightRes.status === 'fulfilled') {
          setOrchestratedInsight(insightRes.value);
        }
      } catch (err) {
        console.warn('Failed to fetch adaptation or insight:', err);
      } finally {
        setIsAdapting(false);
      }
    },
    [telemetry, roadmap.steps.length, user, saveSessionToFirestore]
  );

  // Record an action to the telemetry log
  const handleRecordAction = useCallback((action: string, details?: string) => {
    lastActiveTimestamp.current = Date.now();
    setTelemetry((prev) => ({
      ...prev,
      recentActions: [
        ...prev.recentActions.slice(-15),
        { timestamp: Date.now(), action, details },
      ],
    }));
  }, []);

  // Handle hint request
  const handleRequestHint = useCallback(() => {
    setTelemetry((prev) => {
      const newHints = prev.hintsClicked + 1;
      const updated: StudentTelemetry = {
        ...prev,
        hintsClicked: newHints,
      };

      const scoreData = calculateStudentProgressScore(updated, roadmap.steps.length);
      setAdaptiveState((curr) => ({
        ...curr,
        real_time_metrics: {
          ...curr.real_time_metrics,
          current_focus_score: scoreData.focusScore,
          xp_earned: scoreData.xpEarned,
        },
      }));

      return updated;
    });
  }, [roadmap.steps.length]);

  // Handle step completion / answer verification
  const handleCompleteStep = useCallback(
    (isSuccess: boolean) => {
      if (isSuccess) {
        const nextIdx = currentStepIndex + 1;
        const nextStepItem = roadmap.steps[nextIdx];

        setTelemetry((prev) => {
          const updated: StudentTelemetry = {
            ...prev,
            totalStepsCompleted: Math.min(roadmap.steps.length, prev.totalStepsCompleted + 1),
            totalRoadmapSteps: roadmap.steps.length,
            correctAnswers: (prev.correctAnswers || 0) + 1,
            quizAttempts: (prev.quizAttempts || 0) + 1,
            streakCount: prev.streakCount + 1,
            lastQuizResult: 'correct',
            consecutiveErrors: 0,
            timeSpentOnCurrentStepSec: 0,
            hintsClicked: 0,
            currentStepId: nextStepItem ? nextStepItem.id : prev.currentStepId,
            currentStepTitle: nextStepItem ? nextStepItem.title : prev.currentStepTitle,
            expectedStepDurationSec: nextStepItem ? nextStepItem.durationEstimateSec : 60,
          };

          const progressMetrics = calculateStudentProgressScore(updated, roadmap.steps.length);
          updated.masteryScore = progressMetrics.focusScore;
          updated.progressPercent = progressMetrics.progressPercent;

          setAdaptiveState((curr) => ({
            ...curr,
            real_time_metrics: {
              ...curr.real_time_metrics,
              current_focus_score: progressMetrics.focusScore,
              momentum_status: progressMetrics.momentumStatus,
              progress_percent: progressMetrics.progressPercent,
              accuracy_percent: progressMetrics.accuracyPercent,
              xp_earned: progressMetrics.xpEarned,
            },
          }));

          setTimeout(() => triggerAdaptation(updated), 300);

          return updated;
        });

        if (nextIdx < roadmap.steps.length) {
          setCurrentStepIndex(nextIdx);
        }
      } else {
        setTelemetry((prev) => {
          const updated: StudentTelemetry = {
            ...prev,
            incorrectAnswers: (prev.incorrectAnswers || 0) + 1,
            quizAttempts: (prev.quizAttempts || 0) + 1,
            consecutiveErrors: prev.consecutiveErrors + 1,
            streakCount: 0,
            lastQuizResult: 'incorrect',
          };

          const progressMetrics = calculateStudentProgressScore(updated, roadmap.steps.length);
          updated.masteryScore = progressMetrics.focusScore;
          updated.progressPercent = progressMetrics.progressPercent;

          setAdaptiveState((curr) => ({
            ...curr,
            real_time_metrics: {
              ...curr.real_time_metrics,
              current_focus_score: progressMetrics.focusScore,
              momentum_status: progressMetrics.momentumStatus,
              progress_percent: progressMetrics.progressPercent,
              accuracy_percent: progressMetrics.accuracyPercent,
              xp_earned: progressMetrics.xpEarned,
            },
          }));

          return updated;
        });
      }
    },
    [currentStepIndex, roadmap.steps, triggerAdaptation]
  );

  // Preset Scenario Simulator
  const handleSimulateScenario = useCallback(
    (scenario: 'struggling' | 'excelling' | 'analytical' | 'steady') => {
      let custom: StudentTelemetry;

      if (scenario === 'struggling') {
        custom = {
          ...telemetry,
          totalStepsCompleted: 0,
          totalRoadmapSteps: roadmap.steps.length,
          correctAnswers: 0,
          incorrectAnswers: 2,
          timeSpentOnCurrentStepSec: 135,
          expectedStepDurationSec: 45,
          hintsClicked: 3,
          quizAttempts: 3,
          consecutiveErrors: 2,
          lastQuizResult: 'incorrect',
          idleTimeSec: 25,
          rapidClicksCount: 7,
          streakCount: 0,
          recentActions: [
            ...telemetry.recentActions,
            { timestamp: Date.now(), action: 'Simulated struggle sequence', details: '3 hints, 2 quiz failures' },
          ],
        };
      } else if (scenario === 'excelling') {
        custom = {
          ...telemetry,
          totalStepsCompleted: 3,
          totalRoadmapSteps: roadmap.steps.length,
          correctAnswers: 3,
          incorrectAnswers: 0,
          timeSpentOnCurrentStepSec: 14,
          expectedStepDurationSec: 45,
          hintsClicked: 0,
          quizAttempts: 3,
          consecutiveErrors: 0,
          lastQuizResult: 'correct',
          idleTimeSec: 0,
          rapidClicksCount: 0,
          streakCount: 4,
          recentActions: [
            ...telemetry.recentActions,
            { timestamp: Date.now(), action: 'Simulated accelerated mastery', details: '3 steps completed, 100% accuracy' },
          ],
        };
      } else if (scenario === 'analytical') {
        custom = {
          ...telemetry,
          totalStepsCompleted: 1,
          totalRoadmapSteps: roadmap.steps.length,
          correctAnswers: 1,
          incorrectAnswers: 0,
          timeSpentOnCurrentStepSec: 85,
          expectedStepDurationSec: 50,
          hintsClicked: 0,
          quizAttempts: 1,
          consecutiveErrors: 0,
          lastQuizResult: 'correct',
          idleTimeSec: 4,
          streakCount: 1,
          recentActions: [
            ...telemetry.recentActions,
            { timestamp: Date.now(), action: 'Simulated deep analytical study', details: '1 step completed, 85s dwell' },
          ],
        };
      } else {
        custom = {
          ...telemetry,
          totalStepsCompleted: 1,
          totalRoadmapSteps: roadmap.steps.length,
          correctAnswers: 1,
          incorrectAnswers: 0,
          timeSpentOnCurrentStepSec: 35,
          expectedStepDurationSec: 45,
          hintsClicked: 1,
          quizAttempts: 1,
          consecutiveErrors: 0,
          lastQuizResult: 'correct',
          streakCount: 1,
          recentActions: [
            ...telemetry.recentActions,
            { timestamp: Date.now(), action: 'Reset to steady pace', details: '1 completed step' },
          ],
        };
      }

      const scoreData = calculateStudentProgressScore(custom, roadmap.steps.length);
      custom.masteryScore = scoreData.focusScore;
      custom.progressPercent = scoreData.progressPercent;

      setTelemetry(custom);
      triggerAdaptation(custom);
    },
    [telemetry, roadmap.steps.length, triggerAdaptation]
  );

  // Generate / Switch skill goal
  const handleSelectGoal = async (newGoal: string) => {
    setSkillGoal(newGoal);
    setIsAdapting(true);

    try {
      const res = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillGoal: newGoal }),
      });

      if (res.ok) {
        const newRoadmap: SkillRoadmapData = await res.json();
        setRoadmap(newRoadmap);
        setCurrentStepIndex(0);
        const firstStep = newRoadmap.steps[0];

        const resetTelemetry: StudentTelemetry = {
          ...telemetry,
          skillGoal: newGoal,
          currentStepId: firstStep ? firstStep.id : 'step-1',
          currentStepTitle: firstStep ? firstStep.title : 'First Victory',
          timeSpentOnCurrentStepSec: 0,
          expectedStepDurationSec: firstStep ? firstStep.durationEstimateSec : 45,
          hintsClicked: 0,
          quizAttempts: 0,
          consecutiveErrors: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          totalStepsCompleted: 0,
          totalRoadmapSteps: newRoadmap.steps.length,
          streakCount: 0,
          progressPercent: 0,
          masteryScore: 0,
          recentActions: [{ timestamp: Date.now(), action: `Skill goal changed: ${newGoal}` }],
        };
        setTelemetry(resetTelemetry);
        triggerAdaptation(resetTelemetry);
      }
    } catch (e) {
      console.warn('Error fetching new roadmap:', e);
      const fb = getFallbackRoadmap(newGoal);
      setRoadmap(fb);
      setCurrentStepIndex(0);
    } finally {
      setIsAdapting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-300">
      {/* 3-Zone Clean Header */}
      <Header
        activeView={activeView}
        onSelectView={setActiveView}
        focusScore={adaptiveState.real_time_metrics.current_focus_score}
        completedSteps={telemetry.totalStepsCompleted}
        totalSteps={roadmap.steps.length}
        streakCount={telemetry.streakCount}
        user={user}
        isSyncing={isSyncing}
        onSignInWithGoogle={signInWithGoogle}
        onLogout={logout}
        onOpenGroundedDocs={() => setIsGroundedModalOpen(true)}
      />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 flex flex-col gap-6">
        {/* Prominent Goal & Progress Header */}
        <ProgressHeader
          skillGoal={skillGoal}
          currentStepIndex={currentStepIndex}
          totalSteps={roadmap.steps.length}
          currentStepTitle={currentStep.title}
          telemetry={telemetry}
          adaptiveState={adaptiveState}
          orchestratedInsight={orchestratedInsight}
          onChangeGoal={() => setIsGoalModalOpen(true)}
          onRecommendedAction={() => {
            handleRecordAction('Recommended Action Clicked', orchestratedInsight?.next_recommended_action.button_text);
            triggerAdaptation();
          }}
        />

        {/* View 1: Learn & Practice Workspace */}
        {activeView === 'workspace' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Quick Step Navigator */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Curriculum Steps
                  </h3>
                  <span className="text-xs font-mono text-indigo-400 font-semibold">
                    {currentStepIndex + 1} of {roadmap.steps.length}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {roadmap.steps.map((step, idx) => {
                    const isCompleted = idx < telemetry.totalStepsCompleted;
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <button
                        key={step.id}
                        onClick={() => {
                          setCurrentStepIndex(idx);
                          handleRecordAction('Selected step', step.title);
                        }}
                        className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex items-start gap-3 cursor-pointer ${
                          isCurrent
                            ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/30'
                            : isCompleted
                            ? 'bg-slate-950/60 border-emerald-500/30 text-slate-300 hover:text-white'
                            : 'bg-slate-950/30 border-slate-800/60 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : isCurrent ? (
                            <div className="w-4 h-4 rounded-full border-2 border-indigo-400 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            </div>
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate">{step.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {step.difficulty} • {step.durationEstimateSec}s
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick AI Tip card */}
              <div className="p-4 rounded-3xl bg-indigo-950/20 border border-indigo-900/40 text-xs text-indigo-200/90 leading-relaxed">
                <div className="font-bold text-indigo-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Next Micro-Action:</span>
                </div>
                <p>{adaptiveState.adaptive_next_step.micro_action}</p>
              </div>
            </div>

            {/* Right Column: Interactive Step Workspace */}
            <div className="lg:col-span-8">
              <StepWorkspace
                currentStep={currentStep}
                telemetry={telemetry}
                onRecordAction={handleRecordAction}
                onRequestHint={handleRequestHint}
                onCompleteStep={handleCompleteStep}
                onTriggerBreather={() => setIsBreatherModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* View 2: Full Roadmap Journey */}
        {activeView === 'roadmap' && (
          <RoadmapJourney
            roadmap={roadmap}
            currentStepIndex={currentStepIndex}
            totalCompletedSteps={telemetry.totalStepsCompleted}
            mermaidDiagram={adaptiveState.updated_roadmap_diagram || roadmap.mermaidRoadmap}
            onSelectStep={(idx) => {
              setCurrentStepIndex(idx);
              setActiveView('workspace');
              handleRecordAction('Roadmap step selected', roadmap.steps[idx]?.title);
            }}
          />
        )}

        {/* View 3: Live Progress & Analytics */}
        {activeView === 'progress' && (
          <ProgressAnalyticsView
            telemetry={telemetry}
            adaptiveState={adaptiveState}
            steps={roadmap.steps}
            onOpenJsonInspector={() => setIsJsonModalOpen(true)}
            isAdapting={isAdapting}
            onRefreshAiEvaluation={() => triggerAdaptation()}
          />
        )}

        {/* Evaluator Scenario Drawer (Collapsible & Unobtrusive) */}
        <ScenarioDrawer
          onSimulateScenario={handleSimulateScenario}
          onRun60SecDemo={() => setIsDemoModalOpen(true)}
          onOpenJsonInspector={() => setIsJsonModalOpen(true)}
          onOpenGroundedSearch={() => setIsGroundedModalOpen(true)}
          onTriggerAdaptationNow={() => triggerAdaptation()}
          isAdapting={isAdapting}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Dishasathi AI (दिशासाथी) — Personalized Adaptive Learning Companion</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span>Real-time Telemetry Active</span>
            <span>•</span>
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
            >
              Restart 60s Tour
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GoalSelectorModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSelectGoal={handleSelectGoal}
        currentGoal={skillGoal}
      />

      <JsonInspectorModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        telemetry={telemetry}
        adaptiveResponse={adaptiveState}
        orchestratedInsight={orchestratedInsight}
        onSendCustomTelemetry={(custom) => {
          setTelemetry(custom);
          triggerAdaptation(custom);
        }}
        isAdapting={isAdapting}
      />

      <GuidedDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onDemoComplete={(scenario) => {
          handleSimulateScenario(scenario);
        }}
      />

      <GroundedKnowledgeModal
        isOpen={isGroundedModalOpen}
        onClose={() => setIsGroundedModalOpen(false)}
        initialTopic={skillGoal}
      />

      <BreatherModal
        isOpen={isBreatherModalOpen}
        onClose={() => setIsBreatherModalOpen(false)}
        onComplete={() => {
          handleRecordAction('Completed mindful breather');
          setTelemetry((prev) => ({
            ...prev,
            timeSpentOnCurrentStepSec: Math.max(0, prev.timeSpentOnCurrentStepSec - 15),
          }));
        }}
      />
    </div>
  );
}
