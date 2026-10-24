export type AdaptiveUILayout = 'dashboard' | 'minimalist_focus' | 'gamified_arena' | 'data_heavy';

export type DifficultyAdjustment = 'Made Easier' | 'Kept Same' | 'Increased Difficulty';

export interface StudentTelemetry {
  sessionId: string;
  skillGoal: string;
  currentStepId: string;
  currentStepTitle: string;
  timeSpentOnCurrentStepSec: number;
  expectedStepDurationSec: number;
  hintsClicked: number;
  quizAttempts: number;
  consecutiveErrors: number;
  lastQuizResult?: 'correct' | 'incorrect' | 'skipped' | 'none';
  idleTimeSec: number;
  rapidClicksCount: number;
  tabBlurCount: number;
  hesitationScore?: number; // 0-100
  recentActions: Array<{
    timestamp: number;
    action: string;
    details?: string;
  }>;
  totalStepsCompleted: number;
  totalRoadmapSteps?: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  streakCount: number;
  progressPercent?: number;
  masteryScore?: number;
  dailyActivityLog?: Record<string, number>; // date string -> minutes spent
  activeDates?: string[]; // list of ISO date strings where student was active
}

export type PerformanceTag = "Fast Learner" | "Deep Thinker" | "Needs Quick Revision" | "Ready for Challenge";
export type DynamicUiState = "show_confetti" | "show_encouragement_popup" | "unlock_new_badge";

export interface OrchestratedInsightResponse {
  personalized_insight: string;
  performance_tag: PerformanceTag;
  next_recommended_action: {
    title: string;
    description: string;
    button_text: string;
  };
  dynamic_ui_state: DynamicUiState;
}

export interface WeeklyDayMetric {
  dayName: string; // e.g. "Monday"
  shortDay: string; // e.g. "Mon"
  dayLetter: string; // e.g. "M"
  activeMinutes: number; // calculated minutes from student real performance
  metDailyTarget: boolean; // whether >= dailyTargetMin
  isToday: boolean;
  isActive: boolean; // student was actually active on this day
}

export interface WeeklyMomentumAiOutput {
  dailyTargetMin: number;
  targetMetPercent: number; // e.g. 100
  targetReachedDays: number; // e.g. 5
  totalDaysEvaluated: number; // 7
  avgMinutesPerDay: number; // e.g. 12.4
  momentumAiInsight: string;
  generatedByModel: string;
  days: WeeklyDayMetric[];
}

export interface HabitStreakDayItem {
  dayLetter: string; // "M", "T", "W", "T", "F", "S", "S"
  dayName: string;
  completed: boolean;
  isToday: boolean;
  isLocked: boolean;
}

export interface HabitStreakAiOutput {
  actualStreakDays: number;
  statusBadge: string; // "On Fire!" or "Building Momentum"
  statusEmoji: string; // "🔥" or "⚡"
  multiplierText: string; // "1.5x Focus Multiplier"
  headline: string; // "5 Day Streak"
  streakProtected: boolean;
  nextMilestone: string;
  aiCoachingNote: string;
  generatedByModel: string;
  days: HabitStreakDayItem[];
}

export interface AdaptiveResponse {
  live_performance_analysis: string;
  adaptive_ui_layout: AdaptiveUILayout;
  adaptive_next_step: {
    step_title: string;
    micro_action: string;
    difficulty_adjustment: DifficultyAdjustment;
  };
  real_time_metrics: {
    current_focus_score: number;
    momentum_status: string;
    progress_percent?: number;
    accuracy_percent?: number;
    xp_earned?: number;
  };
  weekly_momentum?: WeeklyMomentumAiOutput;
  habit_streak?: HabitStreakAiOutput;
  updated_roadmap_diagram: string;
  orchestrated_insight?: OrchestratedInsightResponse;
}

export interface LearningStep {
  id: string;
  title: string;
  microAction: string;
  status?: 'completed' | 'in_progress' | 'upcoming' | 'remediation';
  durationEstimateSec: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  interactiveChallenge: {
    prompt: string;
    starterCode?: string;
    type: 'choice' | 'code_snippet' | 'quick_input';
    options?: string[];
    correctAnswer: string | number;
    explanation: string;
    hints: string[];
  };
}

export interface SkillRoadmapData {
  skillGoal: string;
  summary: string;
  mermaidRoadmap: string;
  steps: LearningStep[];
}
