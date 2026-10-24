import { StudentTelemetry } from '../types/learning.ts';

export interface CalculatedStudentScore {
  progressPercent: number;
  accuracyPercent: number;
  focusScore: number;
  xpEarned: number;
  momentumStatus: string;
}

/**
 * Pure mathematical scoring engine calculated strictly from student progress and interaction telemetry.
 * Eliminates all static demo numbers and ensures real-time parity with the student's true learning state.
 */
export function calculateStudentProgressScore(
  t: StudentTelemetry,
  totalRoadmapSteps: number = 4
): CalculatedStudentScore {
  const totalSteps = Math.max(1, t.totalRoadmapSteps || totalRoadmapSteps || 4);
  const completedSteps = Math.max(0, t.totalStepsCompleted || 0);

  // 1. Real curriculum progress completion percentage (0 - 100%)
  const progressRatio = Math.min(1, completedSteps / totalSteps);
  const progressPercent = Math.round(progressRatio * 100);

  // 2. Real quiz accuracy
  const correct = Math.max(0, t.correctAnswers || 0);
  const incorrect = Math.max(0, t.incorrectAnswers || 0);
  const totalAttempts = correct + incorrect + (t.quizAttempts > correct + incorrect ? t.quizAttempts - (correct + incorrect) : 0);

  let accuracyRatio = 0;
  if (totalAttempts > 0) {
    accuracyRatio = correct / totalAttempts;
  } else if (completedSteps > 0) {
    accuracyRatio = 1.0;
  } else {
    accuracyRatio = 0; // Fresh student with zero answers yet
  }
  const accuracyPercent = Math.round(accuracyRatio * 100);

  // 3. Focus / Mastery Score calculation strictly from student progress
  let focusScore: number;

  if (completedSteps === 0 && totalAttempts === 0 && (t.hintsClicked || 0) === 0) {
    // Fresh session start: student has just initiated, score represents genuine zero progress
    focusScore = 0;
  } else {
    // Weightings:
    // - Progress Completion: up to 45 pts
    // - Real Accuracy: up to 35 pts
    // - Streak Momentum: up to 20 pts
    // - Deductions for hint friction and consecutive errors
    const progressPoints = progressRatio * 45;
    const accuracyPoints = accuracyRatio * 35;
    const streakPoints = Math.min(20, (t.streakCount || 0) * 5);

    const hintDeduction = Math.min(15, (t.hintsClicked || 0) * 3);
    const errorDeduction = Math.min(20, (t.consecutiveErrors || 0) * 6);
    const rapidClickDeduction = Math.min(10, Math.floor((t.rapidClicksCount || 0) / 3));

    const rawScore = progressPoints + accuracyPoints + streakPoints - hintDeduction - errorDeduction - rapidClickDeduction;
    focusScore = Math.max(0, Math.min(100, Math.round(rawScore)));
  }

  // 4. Genuine XP earned solely through verified student milestones
  const xpEarned = Math.max(
    0,
    (completedSteps * 100) +
    (correct * 50) +
    (Math.max(0, t.streakCount || 0) * 25) -
    Math.min(50, (t.hintsClicked || 0) * 10)
  );

  // 5. Authentic momentum status derived from student action
  let momentumStatus = 'Starting Journey';
  if (completedSteps === 0 && totalAttempts === 0) {
    momentumStatus = 'Session Initialized';
  } else if (t.consecutiveErrors >= 2 || (t.hintsClicked || 0) >= 3) {
    momentumStatus = 'Refining Concept (Calm Scaffolding)';
  } else if ((t.streakCount || 0) >= 3 && accuracyRatio >= 0.8) {
    momentumStatus = 'Unstoppable Momentum 🔥';
  } else if ((t.streakCount || 0) >= 1) {
    momentumStatus = 'Focused Flow ⚡';
  } else if (t.timeSpentOnCurrentStepSec > (t.expectedStepDurationSec || 45) * 1.5) {
    momentumStatus = 'Deep Contemplation';
  } else {
    momentumStatus = 'Building Mastery';
  }

  return {
    progressPercent,
    accuracyPercent,
    focusScore,
    xpEarned,
    momentumStatus,
  };
}
