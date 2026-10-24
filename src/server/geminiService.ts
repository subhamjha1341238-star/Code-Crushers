import { GoogleGenAI, Type } from '@google/genai';
import { StudentTelemetry, AdaptiveResponse, SkillRoadmapData, OrchestratedInsightResponse, PerformanceTag, DynamicUiState } from '../types/learning.ts';
import { calculateStudentProgressScore } from '../utils/scoring.ts';
import { generateAuthenticMomentumAndStreak } from '../utils/momentum.ts';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function generateVoiceTutorResponse(
  message: string,
  language: string = 'English'
): Promise<{ text: string; topic: string; followUpQuestions: string[] }> {
  const prompt = `You are ShikshaSathi AI, an empathetic, encouraging, and world-class personal voice tutor.
The student said: "${message}"
Language/Dialect preference: ${language}

Provide:
1. A warm, crystal-clear, conversational spoken explanation (2-4 sentences max so it sounds natural when spoken aloud).
2. The core topic/subject.
3. 2 short, engaging follow-up questions to test or deepen understanding.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      text: { type: Type.STRING, description: "Conversational answer spoken clearly and naturally." },
      topic: { type: Type.STRING, description: "The identified educational topic." },
      followUpQuestions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "2 follow-up conversational questions.",
      },
    },
    required: ["text", "topic", "followUpQuestions"],
  };

  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        text: `Great question about "${message}". In simple terms, it's all about how fundamental principles interact to produce observable effects. Let's explore how this applies in everyday scenarios!`,
        topic: message.slice(0, 30),
        followUpQuestions: ["Would you like to try a quick interactive quiz on this?", "Shall we break down a visual diagram of this concept?"],
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return {
      text: parsed.text || "I understood your question. Let's delve into the core concepts together!",
      topic: parsed.topic || message,
      followUpQuestions: parsed.followUpQuestions || ["Would you like to try a quiz on this?"],
    };
  } catch (error) {
    console.error("Error in generateVoiceTutorResponse:", error);
    return {
      text: `Let's break down "${message}". Focus on the core mechanism first, and we can test it with a quick interactive quiz!`,
      topic: message,
      followUpQuestions: ["Want to explore the mind map for this?", "Ready for a quick 2-question quiz?"],
    };
  }
}
export const ORCHESTRATED_INSIGHT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    personalized_insight: {
      type: Type.STRING,
      description: "A human-like, encouraging 1-sentence feedback based on their invisible activity. (e.g., 'You grasped the core concept really fast, let's level up!')",
    },
    performance_tag: {
      type: Type.STRING,
      enum: ["Fast Learner", "Deep Thinker", "Needs Quick Revision", "Ready for Challenge"],
      description: "A visual badge to show on the UI based on their speed and accuracy.",
    },
    next_recommended_action: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING, description: "What they should do next, dynamically adjusted to their performance without mentioning why." },
        button_text: { type: Type.STRING, description: "e.g., 'Take a Quiz', 'Watch 1-min Summary'" },
      },
      required: ["title", "description", "button_text"],
    },
    dynamic_ui_state: {
      type: Type.STRING,
      enum: ["show_confetti", "show_encouragement_popup", "unlock_new_badge"],
      description: "Tell the frontend what animation or popup to trigger to gamify the experience.",
    },
  },
  required: ["personalized_insight", "performance_tag", "next_recommended_action", "dynamic_ui_state"],
};

export async function orchestrateLearnerInsight(telemetry: StudentTelemetry): Promise<OrchestratedInsightResponse> {
  const prompt = `STUDENT BACKGROUND ACTIVITY TELEMETRY (SILENT PROCESSING ONLY):
${JSON.stringify(telemetry, null, 2)}

Analyze this background activity silently.
CRITICAL MANDATE: DO NOT mention any raw telemetry values (do NOT mention "seconds", "hints", "attempts", or error numbers) in your response text.
Generate encouraging, natural, human-like insight and orchestrate the frontend UI action.`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      return getHeuristicOrchestratedInsight(telemetry);
    }

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Orchestration API timed out after 5000ms")), 5000)
    );

    const callPromise = ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ORCHESTRATED_INSIGHT_SCHEMA,
        systemInstruction: "You are an elite AI Learning Analyst and UI Orchestrator. Process raw telemetry silently. CRITICAL RULE: DO NOT output, repeat, or show any of the raw telemetry numbers or data in your response text. Output only valid JSON matching the schema.",
        temperature: 0.4,
      },
    });

    const response = await Promise.race([callPromise, timeoutPromise]);
    const text = response.text?.trim() || "";
    return JSON.parse(text) as OrchestratedInsightResponse;
  } catch (error) {
    console.error("Gemini API Error in orchestrateLearnerInsight:", error);
    return getHeuristicOrchestratedInsight(telemetry);
  }
}

export function getHeuristicOrchestratedInsight(t: StudentTelemetry): OrchestratedInsightResponse {
  const isStruggling = t.hintsClicked >= 2 || t.quizAttempts >= 2 || t.consecutiveErrors >= 2;
  const isSpeedy = t.hintsClicked === 0 && t.consecutiveErrors === 0 && t.lastQuizResult === 'correct' && t.timeSpentOnCurrentStepSec < 35;
  const isDeep = !isStruggling && !isSpeedy && t.timeSpentOnCurrentStepSec > 60;

  if (isStruggling) {
    return {
      personalized_insight: "Taking time to absorb this is part of real mastery — let's lock in the core idea with zero pressure.",
      performance_tag: "Needs Quick Revision",
      next_recommended_action: {
        title: "Bite-Sized Core Concept Drill",
        description: "A friendly 30-second refresher on the single fundamental principle.",
        button_text: "Try 30-sec Micro Drill",
      },
      dynamic_ui_state: "show_encouragement_popup",
    };
  }

  if (isSpeedy) {
    return {
      personalized_insight: "You grasped the core concept really fast, let's level up!",
      performance_tag: "Fast Learner",
      next_recommended_action: {
        title: "Accelerated Sprint Challenge",
        description: "Test your lightning intuition against an advanced real-world scenario.",
        button_text: "Unlock Boss Challenge",
      },
      dynamic_ui_state: "show_confetti",
    };
  }

  if (isDeep) {
    return {
      personalized_insight: "Your thorough contemplation shows deep analytical instincts — great architects think before they act.",
      performance_tag: "Deep Thinker",
      next_recommended_action: {
        title: "Architectural Synthesis",
        description: "Connect this pattern to broader system design tradeoffs.",
        button_text: "Explore Architecture Drill",
      },
      dynamic_ui_state: "unlock_new_badge",
    };
  }

  return {
    personalized_insight: "Solid, consistent rhythm! You are building durable muscle memory step by step.",
    performance_tag: "Ready for Challenge",
    next_recommended_action: {
      title: "Interactive Application Quiz",
      description: "Put this mental model to work with a practical puzzle.",
      button_text: "Take Next Quiz",
    },
    dynamic_ui_state: "unlock_new_badge",
  };
}

export const ADAPTIVE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    live_performance_analysis: {
      type: Type.STRING,
      description: "A 1-sentence analysis of their live activity (e.g., 'Student completed the task 2 mins faster than average, speeding up the next step.')",
    },
    adaptive_ui_layout: {
      type: Type.STRING,
      enum: ["dashboard", "minimalist_focus", "gamified_arena", "data_heavy"],
      description: "Dynamically switch the frontend layout. Choose 'minimalist_focus' if they took too long or used hints, to remove distractions.",
    },
    adaptive_next_step: {
      type: Type.OBJECT,
      properties: {
        step_title: { type: Type.STRING },
        micro_action: { type: Type.STRING, description: "The exact next thing to do. Make it simpler if they struggled." },
        difficulty_adjustment: { type: Type.STRING, enum: ["Made Easier", "Kept Same", "Increased Difficulty"] },
      },
      required: ["step_title", "micro_action", "difficulty_adjustment"],
    },
    real_time_metrics: {
      type: Type.OBJECT,
      description: "Live stats derived strictly from the student's actual step progress, accuracy, and interaction.",
      properties: {
        current_focus_score: { type: Type.INTEGER, description: "Score out of 100 strictly calculated from completed steps ratio, accuracy, and hint friction. 0 when no progress has occurred." },
        momentum_status: { type: Type.STRING, description: "Dynamic momentum reflecting true student status, e.g. 'Session Initialized', 'Focused Flow', 'Unstoppable Momentum', or 'Refining Concept'." },
        progress_percent: { type: Type.INTEGER, description: "Percentage (0-100) of roadmap steps completed by student." },
        accuracy_percent: { type: Type.INTEGER, description: "Percentage (0-100) of quiz attempts answered correctly." },
        xp_earned: { type: Type.INTEGER, description: "Authentic XP earned through steps completed and quizzes answered." },
      },
      required: ["current_focus_score", "momentum_status"],
    },
    weekly_momentum: {
      type: Type.OBJECT,
      description: "Weekly momentum graph metrics derived authentically from actual student active time, milestones, and habit target (no fake raw data).",
      properties: {
        dailyTargetMin: { type: Type.INTEGER },
        targetMetPercent: { type: Type.INTEGER },
        targetReachedDays: { type: Type.INTEGER },
        totalDaysEvaluated: { type: Type.INTEGER },
        avgMinutesPerDay: { type: Type.NUMBER },
        momentumAiInsight: { type: Type.STRING },
        generatedByModel: { type: Type.STRING },
        days: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              dayName: { type: Type.STRING },
              shortDay: { type: Type.STRING },
              dayLetter: { type: Type.STRING },
              activeMinutes: { type: Type.INTEGER },
              metDailyTarget: { type: Type.BOOLEAN },
              isToday: { type: Type.BOOLEAN },
              isActive: { type: Type.BOOLEAN },
            },
            required: ["dayName", "shortDay", "dayLetter", "activeMinutes", "metDailyTarget", "isToday", "isActive"],
          },
        },
      },
      required: ["dailyTargetMin", "targetMetPercent", "targetReachedDays", "totalDaysEvaluated", "avgMinutesPerDay", "momentumAiInsight", "days"],
    },
    habit_streak: {
      type: Type.OBJECT,
      description: "Authentic habit streak based on when the student is actually active.",
      properties: {
        actualStreakDays: { type: Type.INTEGER },
        statusBadge: { type: Type.STRING },
        statusEmoji: { type: Type.STRING },
        multiplierText: { type: Type.STRING },
        headline: { type: Type.STRING },
        streakProtected: { type: Type.BOOLEAN },
        nextMilestone: { type: Type.STRING },
        aiCoachingNote: { type: Type.STRING },
        generatedByModel: { type: Type.STRING },
        days: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              dayLetter: { type: Type.STRING },
              dayName: { type: Type.STRING },
              completed: { type: Type.BOOLEAN },
              isToday: { type: Type.BOOLEAN },
              isLocked: { type: Type.BOOLEAN },
            },
            required: ["dayLetter", "dayName", "completed", "isToday", "isLocked"],
          },
        },
      },
      required: ["actualStreakDays", "statusBadge", "statusEmoji", "multiplierText", "headline", "streakProtected", "nextMilestone", "aiCoachingNote", "days"],
    },
    updated_roadmap_diagram: {
      type: Type.STRING,
      description: "Mermaid.js code for the roadmap. Add a new branch or revision node if they struggled in the live activity. Do NOT wrap in markdown ticks.",
    },
  },
  required: [
    "live_performance_analysis",
    "adaptive_ui_layout",
    "adaptive_next_step",
    "real_time_metrics",
    "updated_roadmap_diagram",
  ],
};

export async function analyzeLiveTelemetry(telemetry: StudentTelemetry): Promise<AdaptiveResponse> {
  const prompt = `You are an advanced Real-Time Adaptive Learning AI. You evaluate live student interaction telemetry and generate adaptive pedagogical steering.

CRITICAL MANDATES (NO DUMMY RAW DATA - CALCULATE AUTHENTIC PROGRESS & STREAK):
- Do NOT generate arbitrary, static, or placeholder scores.
- Evaluate the student's ACTUAL PERFORMANCE from telemetry:
  * totalStepsCompleted / totalRoadmapSteps: 45% of score
  * Accuracy: correctAnswers / max(1, quizAttempts)
  * Streak: streakCount (0 if no engagement yet)
  * Active study dwell: timeSpentOnCurrentStepSec
- Generate "weekly_momentum" graph representing the 7 days (Monday to Sunday) based on when the student was actually active:
  * Today's active minutes must be derived from actual study dwell time and completed steps.
  * Past days reflect active streak days where the student completed challenges. If a day had no study, activeMinutes = 0. Future days = 0.
  * Daily target is 10 mins. Calculate real targetReachedDays and targetMetPercent.
  * Provide an AI insight explaining the student's real momentum curve.
- Generate "habit_streak" reflecting when the student was actually active:
  * actualStreakDays: True consecutive days active.
  * Completed days in the 7-day pill row must be true ONLY for days the student actually studied; future days must be locked.
  * Status badge: 'On Fire!' (if streak >= 3 and correct answers > 0), 'Building Rhythm', or 'Streak Active'.

STUDENT LIVE TELEMETRY PAYLOAD:
${JSON.stringify(telemetry, null, 2)}

INSTRUCTIONS FOR LAYOUT & ADAPTATION RULES:
- If hints clicked >= 2, or quiz attempts >= 2 with errors, or time spent is > 2x expected, or idle time is high:
  * Layout MUST be 'minimalist_focus' to eliminate distraction and restore cognitive calmness.
  * Difficulty adjustment MUST be 'Made Easier'.
  * Adaptive next step must break the problem down into a digestible bite-sized micro action.
  * Roadmap MUST inject a remediation or revision node (e.g., [⚠️ Micro-Revision: Fundamentals Drill]).
  * Momentum status: 'Needs a Breather' or 'Refining Concept'.

- If completed quickly (< expected duration), 0 hints, 0 errors, streak >= 2:
  * Layout MUST be 'gamified_arena' to celebrate momentum, unlock high-velocity challenge, and gamify.
  * Difficulty adjustment MUST be 'Increased Difficulty' (or 'Kept Same' if at peak).
  * Roadmap should show fast-track path or boss level node.
  * Momentum status: 'Unstoppable Momentum 🔥'.

- If telemetry shows high dwell time without errors or deep inspection:
  * Layout can be 'data_heavy' or 'dashboard'.
  * Momentum status: 'Deep Analytical Flow' or 'Building Mastery'.

- Updated Mermaid diagram:
  Return clean Mermaid syntax (flowchart TD or graph TD). DO NOT wrap in markdown backticks.
  Style current step node with fill and stroke. If struggling, add a revision branch node before continuing.`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("No GEMINI_API_KEY detected, falling back to real-time heuristic adaptive engine.");
      return generateHeuristicAdaptiveResponse(telemetry);
    }

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini API call timed out after 5000ms")), 5000)
    );

    const callPromise = ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ADAPTIVE_RESPONSE_SCHEMA,
        systemInstruction: "You are an advanced Real-Time Adaptive Learning AI. Analyze live student telemetry JSON and return precise adaptive pedagogical decisions and layout transitions.",
        temperature: 0.3,
      },
    });

    const response = await Promise.race([callPromise, timeoutPromise]);

    const text = response.text?.trim() || "";
    const parsed = JSON.parse(text) as AdaptiveResponse;

    // Clean any accidental markdown ticks from mermaid diagram
    if (parsed.updated_roadmap_diagram) {
      parsed.updated_roadmap_diagram = parsed.updated_roadmap_diagram
        .replace(/^```mermaid\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();
    }

    // Ensure weekly_momentum and habit_streak are populated authentically
    const authenticFallback = generateAuthenticMomentumAndStreak(telemetry);
    if (!parsed.weekly_momentum || !Array.isArray(parsed.weekly_momentum.days)) {
      parsed.weekly_momentum = authenticFallback.weekly_momentum;
    } else {
      parsed.weekly_momentum.generatedByModel = 'Gemini 3.8 Flash (AI Evaluated)';
    }

    if (!parsed.habit_streak || !Array.isArray(parsed.habit_streak.days)) {
      parsed.habit_streak = authenticFallback.habit_streak;
    } else {
      parsed.habit_streak.generatedByModel = 'Gemini 3.8 Flash (AI Evaluated)';
    }

    return parsed;
  } catch (error) {
    console.error("Gemini API Error in analyzeLiveTelemetry:", error);
    return generateHeuristicAdaptiveResponse(telemetry);
  }
}

export async function evaluateStudentMomentumAndStreak(telemetry: StudentTelemetry) {
  const result = await analyzeLiveTelemetry(telemetry);
  return {
    weekly_momentum: result.weekly_momentum,
    habit_streak: result.habit_streak,
    real_time_metrics: result.real_time_metrics,
  };
}

export async function generateRoadmapForSkill(skillGoal: string): Promise<SkillRoadmapData> {
  const prompt = `Create a structured, bite-sized learning roadmap for the skill: "${skillGoal}".
Design 4 consecutive steps that take a beginner from "where do I start?" to a confident first practical victory in under 5 minutes.
For each step, include:
- id: short string
- title: clear, active step title
- microAction: one specific action the learner takes right now
- durationEstimateSec: number between 30 and 120
- difficulty: Beginner, Intermediate, or Advanced
- category: e.g. "Core Concept", "Hands-on Drill", "Pattern Mastery", "Mini Boss"
- interactiveChallenge: a quick interactive quiz/code check with:
  * prompt: the question
  * type: "choice"
  * options: array of 3-4 options
  * correctAnswer: matching exact option string
  * explanation: clear why
  * hints: 2 scaffolded hints

Also generate a clean Mermaid.js flowchart TD diagram connecting the steps. DO NOT wrap the mermaid string in markdown backticks.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      skillGoal: { type: Type.STRING },
      summary: { type: Type.STRING },
      mermaidRoadmap: { type: Type.STRING },
      steps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            microAction: { type: Type.STRING },
            durationEstimateSec: { type: Type.INTEGER },
            difficulty: { type: Type.STRING },
            category: { type: Type.STRING },
            interactiveChallenge: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING },
                type: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                hints: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["prompt", "type", "options", "correctAnswer", "explanation", "hints"],
            },
          },
          required: ["id", "title", "microAction", "durationEstimateSec", "difficulty", "category", "interactiveChallenge"],
        },
      },
    },
    required: ["skillGoal", "summary", "mermaidRoadmap", "steps"],
  };

  try {
    if (!process.env.GEMINI_API_KEY) {
      return getFallbackRoadmap(skillGoal);
    }

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini API call timed out after 6000ms")), 6000)
    );

    const callPromise = ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const response = await Promise.race([callPromise, timeoutPromise]);

    const text = response.text?.trim() || "";
    const parsed = JSON.parse(text) as SkillRoadmapData;

    if (parsed.mermaidRoadmap) {
      parsed.mermaidRoadmap = parsed.mermaidRoadmap
        .replace(/^```mermaid\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();
    }

    return parsed;
  } catch (error) {
    console.error("Gemini API Error in generateRoadmapForSkill:", error);
    return getFallbackRoadmap(skillGoal);
  }
}

export interface GroundedKnowledgeResult {
  topic: string;
  summary: string;
  sources: Array<{ title: string; url: string }>;
  searchQueries: string[];
}

export async function fetchGroundedKnowledge(topic: string): Promise<GroundedKnowledgeResult> {
  const prompt = `Provide an authoritative, up-to-date learning briefing on "${topic}".
Highlight:
1. Current industry standards, modern tools, and recent breaking changes in 2025/2026.
2. The single most important concept to master first.
3. Top 3 recommended official docs, repositories, or guides.
Be concise, clear, and actionable.`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        topic,
        summary: `Live grounded briefing for ${topic}: Modern industry workflows prioritize modularity, tight interactive feedback loops, and type safety. Focus on first principles before adopting heavy frameworks.`,
        sources: [
          { title: "Official Documentation Hub", url: `https://www.google.com/search?q=${encodeURIComponent(topic + " documentation")}` },
          { title: "Developer Guides & Best Practices", url: `https://www.google.com/search?q=${encodeURIComponent(topic + " tutorial")}` }
        ],
        searchQueries: [`${topic} tutorial 2026`, `${topic} documentation`],
      };
    }

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Grounded search timed out after 6000ms")), 6000)
    );

    const callPromise = ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const response = await Promise.race([callPromise, timeoutPromise]);
    const summary = response.text || "No summary returned.";

    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    const sources = rawChunks
      .filter((c: any) => c.web?.uri && c.web?.title)
      .map((c: any) => ({
        title: c.web.title,
        url: c.web.uri,
      }))
      .slice(0, 5);

    if (sources.length === 0) {
      sources.push({
        title: `${topic} Official Reference`,
        url: `https://www.google.com/search?q=${encodeURIComponent(topic + " official site")}`,
      });
    }

    return {
      topic,
      summary,
      sources,
      searchQueries,
    };
  } catch (error) {
    console.error("Error in fetchGroundedKnowledge:", error);
    return {
      topic,
      summary: `Live briefing for ${topic}: Master the fundamental mental model first, then build hands-on interactive micro-projects with automated testing.`,
      sources: [
        { title: `${topic} Guides`, url: `https://www.google.com/search?q=${encodeURIComponent(topic)}` },
      ],
      searchQueries: [`${topic} 2026`],
    };
  }
}


/**
 * Intelligent local pedagogical heuristic fallback.
 * Ensures instant real-time response and testing even if API quota or offline.
 * Crucially: calculates all scores strictly from the student's actual progress, accuracy, and telemetry.
 */
function generateHeuristicAdaptiveResponse(t: StudentTelemetry): AdaptiveResponse {
  const studentMetrics = calculateStudentProgressScore(t, t.totalRoadmapSteps || 4);
  const isStruggling = t.hintsClicked >= 2 || t.quizAttempts >= 2 || t.consecutiveErrors >= 2 || (t.timeSpentOnCurrentStepSec > t.expectedStepDurationSec * 1.8);
  const isExcelling = t.hintsClicked === 0 && t.consecutiveErrors === 0 && t.lastQuizResult === 'correct' && t.timeSpentOnCurrentStepSec <= t.expectedStepDurationSec * 0.9 && (t.streakCount >= 2 || t.totalStepsCompleted >= 1);
  const isAnalytical = !isStruggling && !isExcelling && t.timeSpentOnCurrentStepSec > t.expectedStepDurationSec * 1.2 && t.idleTimeSec < 15;

  let layout: AdaptiveResponse['adaptive_ui_layout'] = 'dashboard';
  let diffAdj: AdaptiveResponse['adaptive_next_step']['difficulty_adjustment'] = 'Kept Same';
  let analysis = '';
  let mermaidDiagram = '';

  if (isStruggling) {
    layout = 'minimalist_focus';
    diffAdj = 'Made Easier';
    analysis = `Detected cognitive friction (${t.hintsClicked} hints, ${t.consecutiveErrors} consecutive errors). Real-time progress score calibrated to ${studentMetrics.focusScore}/100. Streamlining interface to Minimalist Focus mode.`;
    
    mermaidDiagram = `flowchart TD
  classDef done fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff;
  classDef active fill:#6366f1,stroke:#4f46e5,stroke-width:3px,color:#fff;
  classDef alert fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff;
  classDef next fill:#334155,stroke:#64748b,stroke-width:1px,color:#cbd5e1;

  A["1. Foundational Core"]:::done --> B["${t.currentStepTitle || 'Current Concept'}"]:::active
  B -.->|"Struggle Detected"| REV["⚠️ Micro-Revision: Scaffolding Drill"]:::alert
  REV --> C["3. Simplified Target Step"]:::next
  C --> D["4. Mastery Synthesis"]:::next`;
  } else if (isExcelling) {
    layout = 'gamified_arena';
    diffAdj = 'Increased Difficulty';
    analysis = `Accelerated mastery (${studentMetrics.accuracyPercent}% accuracy, ${t.totalStepsCompleted} completed steps, ${t.streakCount}x streak). Real-time score ascended to ${studentMetrics.focusScore}/100. Unlocking Gamified Arena!`;

    mermaidDiagram = `flowchart TD
  classDef done fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff;
  classDef active fill:#ec4899,stroke:#db2777,stroke-width:3px,color:#fff;
  classDef arena fill:#8b5cf6,stroke:#7c3aed,stroke-width:3px,color:#fff;
  classDef next fill:#334155,stroke:#64748b,stroke-width:1px,color:#cbd5e1;

  A["1. Foundation Mastered"]:::done --> B["${t.currentStepTitle || 'Current Step'} (Mastered)"]:::done
  B ==>|"Speed Bonus Unlocked"| BOSS["⚔️ Boss Arena Challenge"]:::arena
  BOSS --> C["3. High-Velocity Specialization"]:::active
  C --> D["4. Elite Capstone"]:::next`;
  } else if (isAnalytical) {
    layout = 'data_heavy';
    diffAdj = 'Kept Same';
    analysis = `Deep contemplative study (${t.timeSpentOnCurrentStepSec}s dwell). Live score: ${studentMetrics.focusScore}/100 across ${studentMetrics.progressPercent}% curriculum completion. Unlocking Data Studio.`;

    mermaidDiagram = `flowchart TD
  classDef done fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff;
  classDef active fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#fff;
  classDef next fill:#334155,stroke:#64748b,stroke-width:1px,color:#cbd5e1;

  A["1. Architecture Baseline"]:::done --> B["${t.currentStepTitle || 'Current In-Depth Topic'}"]:::active
  B --> C["3. Applied Optimization & Benchmarking"]:::next
  C --> D["4. Production Deployment"]:::next`;
  } else {
    layout = 'dashboard';
    diffAdj = 'Kept Same';
    analysis = t.totalStepsCompleted === 0 && t.quizAttempts === 0
      ? `Fresh learning session active. Complete your first micro-challenge below to begin calculating your live mastery score!`
      : `Consistent learning trajectory. Real progress score: ${studentMetrics.focusScore}/100 with ${studentMetrics.progressPercent}% roadmap completed.`;

    mermaidDiagram = `flowchart TD
  classDef done fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff;
  classDef active fill:#6366f1,stroke:#4f46e5,stroke-width:2px,color:#fff;
  classDef next fill:#334155,stroke:#64748b,stroke-width:1px,color:#cbd5e1;

  A["1. Core Concept Initiation"]:::done --> B["${t.currentStepTitle || 'Active Skill Building'}"]:::active
  B --> C["3. Practical Application"]:::next
  C --> D["4. Skill Capstone"]:::next`;
  }

  const momentumAndStreak = generateAuthenticMomentumAndStreak(t);

  return {
    live_performance_analysis: analysis,
    adaptive_ui_layout: layout,
    adaptive_next_step: {
      step_title: isStruggling ? `Deconstructed: ${t.currentStepTitle || 'Essential Step'}` : isExcelling ? `Advanced Sprint: ${t.currentStepTitle || 'Mastery Step'}` : `Next Phase: ${t.currentStepTitle || 'Next Step'}`,
      micro_action: isStruggling ? "Take 1 small step: identify only the single core keyword without worrying about full syntax." : isExcelling ? "Solve the accelerated test case with edge-condition handling in under 45 seconds!" : "Apply the principle to the sample challenge below.",
      difficulty_adjustment: diffAdj,
    },
    real_time_metrics: {
      current_focus_score: studentMetrics.focusScore,
      momentum_status: studentMetrics.momentumStatus,
      progress_percent: studentMetrics.progressPercent,
      accuracy_percent: studentMetrics.accuracyPercent,
      xp_earned: studentMetrics.xpEarned,
    },
    weekly_momentum: momentumAndStreak.weekly_momentum,
    habit_streak: momentumAndStreak.habit_streak,
    updated_roadmap_diagram: mermaidDiagram,
  };
}

export function getFallbackRoadmap(skillGoal: string): SkillRoadmapData {
  return {
    skillGoal,
    summary: `Tailored guided path for mastering ${skillGoal}. Starts with a zero-friction micro-win and dynamically calibrates based on your live interaction telemetry.`,
    mermaidRoadmap: `flowchart TD
  classDef done fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff;
  classDef active fill:#6366f1,stroke:#4f46e5,stroke-width:3px,color:#fff;
  classDef next fill:#1e293b,stroke:#475569,stroke-width:1px,color:#cbd5e1;

  S1["1. First Victory: Mental Model & First Line"]:::active
  S2["2. Interactive Feedback Loop"]:::next
  S3["3. Pattern Mastery & Edge Cases"]:::next
  S4["4. Real-World Capstone"]:::next

  S1 --> S2 --> S3 --> S4`,
    steps: [
      {
        id: "step-1",
        title: "First Victory: 60-Second Mental Model",
        microAction: "Identify the primary mechanism of this skill in one glance.",
        durationEstimateSec: 45,
        difficulty: "Beginner",
        category: "Mental Model",
        interactiveChallenge: {
          prompt: `When beginning "${skillGoal}", what is the most effective approach to avoid cognitive overload?`,
          type: "choice",
          options: [
            "Break the goal down into isolated micro-actions with immediate live feedback",
            "Read 200 pages of theoretical documentation before touching any practical exercise",
            "Memorize all edge cases and API signatures in a single sitting",
            "Attempt full production deployment without running tests",
          ],
          correctAnswer: "Break the goal down into isolated micro-actions with immediate live feedback",
          explanation: "Neurocognitive learning research proves that tight feedback loops on micro-chunks drastically accelerate retention while preventing overwhelm.",
          hints: [
            "Think about agile feedback vs monolithic reading.",
            "Look for the option mentioning isolated micro-actions and feedback.",
          ],
        },
      },
      {
        id: "step-2",
        title: "Hands-on Interaction Loop",
        microAction: "Execute the core command or syntax pattern in the interactive sandbox.",
        durationEstimateSec: 60,
        difficulty: "Beginner",
        category: "Hands-on Drill",
        interactiveChallenge: {
          prompt: "What is the primary indicator that an interactive learning loop is actively adapting to you?",
          type: "choice",
          options: [
            "Difficulty, scaffolding, and layout shift in real-time based on your actual pace and hint usage",
            "The curriculum is completely static and never changes regardless of how you perform",
            "You are forced into a fixed 60-minute unskippable video lecture",
            "The system ignores whether you got the question right or wrong",
          ],
          correctAnswer: "Difficulty, scaffolding, and layout shift in real-time based on your actual pace and hint usage",
          explanation: "Adaptive AI inspects live friction, error frequency, and velocity to dynamically re-architect the path.",
          hints: [
            "Recall our real-time telemetry engine.",
            "Adaptive systems respond to live telemetry, not static timelines.",
          ],
        },
      },
      {
        id: "step-3",
        title: "Edge Cases & Pattern Synthesis",
        microAction: "Spot the hidden flaw in the scenario and remediate it.",
        durationEstimateSec: 90,
        difficulty: "Intermediate",
        category: "Pattern Mastery",
        interactiveChallenge: {
          prompt: "If a learner gets stuck and starts triggering multiple hints in rapid succession, what should an intelligent adaptive system do?",
          type: "choice",
          options: [
            "Switch to 'minimalist_focus' to cut distractions, soften difficulty, and add a scaffolding revision branch",
            "Increase the timer speed and penalize them with flashing red sirens",
            "Hide all help options and force them to guess blindly",
            "Crash the session and make them start from step 1",
          ],
          correctAnswer: "Switch to 'minimalist_focus' to cut distractions, soften difficulty, and add a scaffolding revision branch",
          explanation: "Minimalist Focus strips secondary metrics and cognitive noise, giving the student psychological safety and scaffolding.",
          hints: [
            "What happens to the UI layout when struggle is detected?",
            "Look for 'minimalist_focus' and scaffolding.",
          ],
        },
      },
      {
        id: "step-4",
        title: "Capstone Demonstration",
        microAction: "Connect all concepts into a unified working milestone.",
        durationEstimateSec: 120,
        difficulty: "Advanced",
        category: "Capstone",
        interactiveChallenge: {
          prompt: "How does real-time telemetry analysis differ from traditional historical learning management systems?",
          type: "choice",
          options: [
            "It evaluates active dwell time, micro-hesitations, and live error recovery within the current session",
            "It only checks test scores at the end of a semester",
            "It requires manual grading by a human teacher weeks later",
            "It does not collect any data at all",
          ],
          correctAnswer: "It evaluates active dwell time, micro-hesitations, and live error recovery within the current session",
          explanation: "Real-time telemetry turns every user click, pause, and attempt into instantaneous educational guidance.",
          hints: [
            "Focus on session-level live metrics.",
            "Live interaction telemetry measures active dwell time and hesitations.",
          ],
        },
      },
    ],
  };
}
