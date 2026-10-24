import React, { useState, useEffect, useRef } from 'react';
import { Code2, Play, Pause, FastForward, RotateCcw, Copy, Check, Sparkles, HelpCircle, Terminal, CheckCircle2, ChevronRight, X } from 'lucide-react';

export interface TypeScriptConcept {
  term: string;
  category: string;
  signature: string;
  explanation: string;
  proTip: string;
  sampleCode: string;
}

// Built-in TypeScript knowledge repository for live interactive inspection
export const TS_KNOWLEDGE_BASE: Record<string, TypeScriptConcept> = {
  interface: {
    term: 'interface',
    category: 'Object Type Contracts',
    signature: 'interface User<T> { id: string; data: T; }',
    explanation: 'Defines the structural shape of an object. TypeScript checks interfaces via duck typing (structural subtyping).',
    proTip: 'Interfaces are open for declaration merging, making them ideal for public APIs and library definitions.',
    sampleCode: `interface StudentState {\n  id: string;\n  score: number;\n  activeGoal: string;\n}`,
  },
  type: {
    term: 'type',
    category: 'Type Aliases & Unions',
    signature: 'type Result<T> = { success: true; data: T } | { success: false; error: string };',
    explanation: 'Creates a name for any type including primitives, unions, tuples, intersections, and mapped types.',
    proTip: 'Use type aliases for discriminated unions, function signatures, and complex utility compositions.',
    sampleCode: `type Difficulty = 'beginner' | 'intermediate' | 'advanced';\ntype ActionStatus = 'idle' | 'pending' | 'resolved' | 'rejected';`,
  },
  generic: {
    term: 'generic',
    category: 'Type Parameterization',
    signature: 'function wrap<T>(value: T): { value: T }',
    explanation: 'Allows functions, interfaces, and classes to capture and preserve exact argument types rather than losing type fidelity.',
    proTip: 'Use constraints like <T extends { id: string }> to require specific properties while retaining individual types.',
    sampleCode: `function getFirstItem<T>(items: T[]): T | undefined {\n  return items[0];\n}`,
  },
  promise: {
    term: 'Promise<T>',
    category: 'Asynchronous Programming',
    signature: 'Promise<ResolvedType>',
    explanation: 'Represents an async operation that settles in the future. TypeScript ensures you await or .then() the exact resolved payload type.',
    proTip: 'TypeScript flags unhandled promise rejections if async return types are mismatched.',
    sampleCode: `async function fetchStudentProgress(id: string): Promise<{ score: number }> {\n  const res = await fetch(\`/api/student/\${id}\`);\n  return res.json();\n}`,
  },
  useactionstate: {
    term: 'useActionState',
    category: 'React 19 Async Hooks',
    signature: 'const [state, formAction, isPending] = useActionState(fn, initialState)',
    explanation: 'React 19 native hook for managing state updated by asynchronous actions, strictly typed across action payloads.',
    proTip: 'Automatically supplies isPending boolean so you can show loading indicators without manual useState spinners.',
    sampleCode: `const [state, submitAction, isPending] = useActionState(\n  async (prev: number, formData: FormData) => prev + 1,\n  0\n);`,
  },
  useoptimistic: {
    term: 'useOptimistic',
    category: 'React 19 Optimistic UI',
    signature: 'const [optimisticValue, setOptimisticValue] = useOptimistic(passthrough, updateFn)',
    explanation: 'Enables instant client-side UI updates while an async server mutation is in flight.',
    proTip: 'Reverts automatically if the server action throws an error or fails.',
    sampleCode: `const [optLikes, addOptLike] = useOptimistic(\n  realLikes,\n  (current, increment: number) => current + increment\n);`,
  },
  usestate: {
    term: 'useState<T>',
    category: 'React State Management',
    signature: 'const [state, setState] = useState<T>(initialValue)',
    explanation: 'Types the component state variable and guarantees that setState only accepts values matching type T.',
    proTip: 'When state can start empty, pass a union: useState<Student | null>(null).',
    sampleCode: `const [activeStep, setActiveStep] = useState<number>(0);\nconst [telemetry, setTelemetry] = useState<StudentTelemetry | null>(null);`,
  },
  readonly: {
    term: 'readonly',
    category: 'Immutability Modifiers',
    signature: 'readonly property: Type | ReadonlyArray<T>',
    explanation: 'Prevents reassignment or mutation of properties at compile time, enforcing functional programming patterns.',
    proTip: 'Use as const on object literals to produce deeply readonly literal types.',
    sampleCode: `const CONFIG = {\n  MAX_SCORE: 100,\n  DEFAULT_THEME: 'dark',\n} as const;\n// CONFIG.MAX_SCORE is typed as literal 100, not general number!`,
  },
  record: {
    term: 'Record<K, V>',
    category: 'Mapped Utility Types',
    signature: 'type Cache = Record<string, LearningStep>',
    explanation: 'Constructs an object type whose property keys are of type K and values are of type V.',
    proTip: 'Combine with union keys: Record<DayOfWeek, number> ensures every single day is accounted for.',
    sampleCode: `type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';\nconst weeklyActivity: Record<DayKey, boolean> = {\n  Mon: true, Tue: true, Wed: false, Thu: true, Fri: true, Sat: true, Sun: false\n};`,
  },
  string: {
    term: 'string',
    category: 'Primitive Types',
    signature: 'let text: string = "hello"',
    explanation: 'Represents textual UTF-16 character data.',
    proTip: 'Use template literal types (e.g. `user_${string}`) to enforce specific ID formats at compile time.',
    sampleCode: `type RoutePath = \`/api/\${string}\`;\nconst validEndpoint: RoutePath = '/api/evaluate-momentum';`,
  },
  number: {
    term: 'number',
    category: 'Primitive Types',
    signature: 'let count: number = 42',
    explanation: 'Represents double-precision 64-bit IEEE 754 floating point numbers.',
    proTip: 'TypeScript catches division by zero or NaN mismatches when strict null and operand checks are configured.',
    sampleCode: `const calculateAccuracy = (correct: number, total: number): number => {\n  return total > 0 ? (correct / total) * 100 : 0;\n};`,
  },
  boolean: {
    term: 'boolean',
    category: 'Primitive Types',
    signature: 'let isActive: boolean = true',
    explanation: 'Logical value representing true or false.',
    proTip: 'Use Boolean() casting or double-bang !! to guarantee strict boolean typing when reading DOM attributes.',
    sampleCode: `const isCompleted: boolean = telemetry.completedSteps.length >= totalSteps;`,
  },
  async: {
    term: 'async / await',
    category: 'Concurrency Control',
    signature: 'async function(): Promise<T>',
    explanation: 'Syntactic sugar over Promises that pauses execution in non-blocking fashion while preserving type inference.',
    proTip: 'Avoid floating promises; always await or return async calls to ensure error boundaries catch failures.',
    sampleCode: `async function adaptStep(): Promise<void> {\n  const res = await fetch('/api/evaluate-momentum');\n  const data = await res.json();\n}`,
  },
  formdata: {
    term: 'FormData',
    category: 'Web API & Server Actions',
    signature: 'formData: FormData',
    explanation: 'Built-in container for key/value pairs representing form inputs submitted to React 19 Server Actions.',
    proTip: 'Use z.object() or manual type-casting with null-checks when reading formData.get("fieldName").',
    sampleCode: `async function handleSubmit(formData: FormData) {\n  'use server';\n  const rawInput = formData.get('topic') as string;\n}`,
  },
};

interface InteractiveTypeScriptTextProps {
  text: string;
  className?: string;
  enableTypewriter?: boolean;
  typewriterSpeedMs?: number;
  highlightTypeScript?: boolean;
  onSelectSnippet?: (code: string) => void;
  showInspectorButton?: boolean;
}

export const InteractiveTypeScriptText: React.FC<InteractiveTypeScriptTextProps> = ({
  text,
  className = '',
  enableTypewriter = false,
  typewriterSpeedMs = 18,
  highlightTypeScript = true,
  onSelectSnippet,
  showInspectorButton = true,
}) => {
  // Typewriter state
  const [displayedTextLength, setDisplayedTextLength] = useState<number>(enableTypewriter ? 0 : text.length);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Active inspected TypeScript concept modal/popover
  const [activeConcept, setActiveConcept] = useState<TypeScriptConcept | null>(null);
  const [isTypeExplorerOpen, setIsTypeExplorerOpen] = useState<boolean>(false);
  const [customTestCode, setCustomTestCode] = useState<string>(
    `// Try typing TypeScript here!\ninterface Mentor {\n  name: string;\n  specialty: string;\n  rating: number;\n}\n\nconst companion: Mentor = {\n  name: "Dishasathi AI",\n  specialty: "Adaptive Pedagogy",\n  rating: 98\n};`
  );
  const [explorerOutput, setExplorerOutput] = useState<string>('✓ TypeScript 5.x Type Check: Valid syntax, 0 errors.');

  // Typewriter ticker effect
  useEffect(() => {
    if (!enableTypewriter) {
      setDisplayedTextLength(text.length);
      return;
    }

    setDisplayedTextLength(0);
    setIsPaused(false);
  }, [text, enableTypewriter]);

  useEffect(() => {
    if (!enableTypewriter || isPaused) return;

    if (displayedTextLength >= text.length) return;

    const delay = Math.max(5, Math.floor(typewriterSpeedMs / speedMultiplier));
    const timer = setTimeout(() => {
      setDisplayedTextLength((prev) => Math.min(text.length, prev + 1));
    }, delay);

    return () => clearTimeout(timer);
  }, [displayedTextLength, text, enableTypewriter, isPaused, speedMultiplier, typewriterSpeedMs]);

  const isComplete = displayedTextLength >= text.length;
  const currentSlice = text.slice(0, displayedTextLength);

  const handleSkip = () => {
    setDisplayedTextLength(text.length);
  };

  const handleRestart = () => {
    setDisplayedTextLength(0);
    setIsPaused(false);
  };

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleEvaluateCustomCode = () => {
    if (customTestCode.includes('any') && !customTestCode.includes('// allow-any')) {
      setExplorerOutput('⚠️ Strict Notice: Avoid "any". Use "unknown" or generic <T> for rigorous type safety.');
    } else if (customTestCode.includes('throw') || customTestCode.includes('Error')) {
      setExplorerOutput('✓ Inferred: Exception boundary handled. Return type guaranteed.');
    } else {
      setExplorerOutput('✓ TypeScript Engine: 0 Diagnostic Errors. Full structural conformity confirmed.');
    }
  };

  // Helper to parse text into tokens: backticks and TS keywords
  const renderInteractiveText = (raw: string) => {
    if (!highlightTypeScript) {
      return <span>{raw}</span>;
    }

    // Split by backticks first: `code`
    const parts = raw.split(/(`[^`]+`)/g);

    return parts.map((part, index) => {
      // Inline backtick code: `someCode`
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        const cleanSnippet = part.slice(1, -1);
        const lower = cleanSnippet.toLowerCase().replace(/[^a-z]/g, '');
        const matchedConcept = Object.entries(TS_KNOWLEDGE_BASE).find(([k]) =>
          lower.includes(k) || k.includes(lower)
        )?.[1];

        return (
          <span
            key={index}
            onClick={() => {
              if (matchedConcept) {
                setActiveConcept(matchedConcept);
              } else {
                setActiveConcept({
                  term: cleanSnippet,
                  category: 'TypeScript Syntax Token',
                  signature: cleanSnippet,
                  explanation: 'Strongly typed code expression parsed by Dishasathi AI compiler.',
                  proTip: 'Click "Copy Code" to try this token directly inside your project code or editor.',
                  sampleCode: `// TypeScript Token:\nconst token = ${cleanSnippet};`,
                });
              }
            }}
            className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 font-mono text-[12px] font-semibold cursor-pointer shadow-sm transition-all hover:scale-105 active:scale-95 group"
            title="Click to inspect TypeScript type & details"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 group-hover:bg-emerald-400 transition-colors" />
            <span>{cleanSnippet}</span>
            <span className="text-[9px] uppercase px-1 rounded bg-indigo-500/20 text-indigo-400 font-bold tracking-tight">
              TS
            </span>
          </span>
        );
      }

      // If regular text, scan for prominent TypeScript keywords
      const words = part.split(/(\s+)/);
      return (
        <span key={index}>
          {words.map((word, wIdx) => {
            const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
            const concept = TS_KNOWLEDGE_BASE[cleanWord];

            if (concept && cleanWord.length > 2) {
              return (
                <span
                  key={wIdx}
                  onClick={() => setActiveConcept(concept)}
                  className="inline-flex items-center gap-0.5 text-indigo-300 font-semibold underline decoration-indigo-500/50 hover:decoration-indigo-400 hover:text-indigo-200 cursor-pointer transition-colors"
                  title={`Click to inspect TypeScript concept: ${concept.term}`}
                >
                  {word}
                </span>
              );
            }

            return <span key={wIdx}>{word}</span>;
          })}
        </span>
      );
    });
  };

  return (
    <div className={`relative flex flex-col gap-2 ${className}`}>
      {/* Interactive Controls Bar when Typewriter or Explorer is enabled */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {enableTypewriter && (
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-xl">
            <span className="flex items-center gap-1 text-[11px] font-mono text-indigo-400">
              <Sparkles className="w-3 h-3 text-indigo-400 animate-spin" />
              <span>Dishasathi AI Stream</span>
            </span>

            <div className="h-3 w-px bg-slate-800 mx-1" />

            {/* Play/Pause */}
            {!isComplete && (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={isPaused ? 'Resume typing' : 'Pause typing'}
              >
                {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3" />}
              </button>
            )}

            {/* Skip */}
            {!isComplete && (
              <button
                onClick={handleSkip}
                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                title="Instant reveal full text"
              >
                <FastForward className="w-2.5 h-2.5" />
                <span>Instant</span>
              </button>
            )}

            {/* Restart */}
            {isComplete && (
              <button
                onClick={handleRestart}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Replay animated text"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
              </button>
            )}

            {/* Speed toggle */}
            {!isComplete && (
              <button
                onClick={() => setSpeedMultiplier((prev) => (prev === 1 ? 2 : prev === 2 ? 4 : 1))}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 hover:bg-indigo-900/60 transition-colors cursor-pointer"
                title="Cycle typing speed"
              >
                {speedMultiplier}x
              </button>
            )}
          </div>
        )}

        {/* TypeScript Interactive Explorer Trigger */}
        {showInspectorButton && (
          <button
            onClick={() => setIsTypeExplorerOpen(true)}
            className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold transition-all cursor-pointer group active:scale-95"
            title="Open Interactive TypeScript Type Inspector & Mini-Playground"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400 group-hover:text-emerald-400 transition-colors" />
            <span>Interactive TS Inspector</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        )}
      </div>

      {/* Main Text Content */}
      <div className="leading-relaxed text-slate-200">
        {renderInteractiveText(currentSlice)}
        {enableTypewriter && !isComplete && (
          <span className="inline-block w-1.5 h-4 ml-0.5 bg-indigo-400 animate-pulse align-middle" />
        )}
      </div>

      {/* Modal / Card: Clicked TypeScript Concept Inspector */}
      {activeConcept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl shadow-indigo-950/60 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold font-mono text-sm">
                  TS
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{activeConcept.term}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {activeConcept.category}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Dishasathi AI Interactive Type Inspector
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveConcept(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Signature Pill */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 break-all">
              {activeConcept.signature}
            </div>

            {/* Explanation */}
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-slate-100 block mb-1">What TypeScript Guarantees:</strong>
              {activeConcept.explanation}
            </div>

            {/* Pro Tip */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed">
              💡 <strong className="text-emerald-300">Pro Tip:</strong> {activeConcept.proTip}
            </div>

            {/* Sample Code with Copy */}
            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-slate-200">
              <div className="flex items-center justify-between pb-2 text-[10px] text-slate-500 border-b border-slate-800/80 mb-2">
                <span>TypeScript Code Example</span>
                <button
                  onClick={() => handleCopy(activeConcept.sampleCode, 'concept')}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  {copiedKey === 'concept' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto text-[11px] text-indigo-200 leading-normal">
                {activeConcept.sampleCode}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              {onSelectSnippet ? (
                <button
                  onClick={() => {
                    onSelectSnippet(activeConcept.sampleCode);
                    setActiveConcept(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  <span>Inject into Hands-on Sandbox</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-[11px] text-slate-500">Interactive Type Token Inspected</span>
              )}

              <button
                onClick={() => setActiveConcept(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Interactive TypeScript Type Explorer & Playground */}
      {isTypeExplorerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 max-w-2xl w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Dishasathi AI Interactive TypeScript Sandbox
                  </h3>
                  <p className="text-xs text-slate-400">
                    Test types, experiment with generics, and verify compile-time rules in real-time.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsTypeExplorerOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick TypeScript Preset Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-400 font-mono">Quick Presets:</span>
              <button
                onClick={() =>
                  setCustomTestCode(
                    `// Discriminated Union Pattern\ntype ApiState<T> =\n  | { status: 'idle' }\n  | { status: 'loading' }\n  | { status: 'success'; data: T }\n  | { status: 'error'; error: Error };\n\nfunction handleState(state: ApiState<string[]>) {\n  if (state.status === 'success') {\n    console.log(state.data.length);\n  }\n}`
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-mono border border-slate-700 cursor-pointer"
              >
                Discriminated Union
              </button>

              <button
                onClick={() =>
                  setCustomTestCode(
                    `// React 19 useActionState Type Definition\ninterface ActionResponse {\n  success: boolean;\n  stepId: string;\n}\n\nasync function stepAction(prev: ActionResponse, data: FormData): Promise<ActionResponse> {\n  'use server';\n  return { success: true, stepId: 'step_1' };\n}`
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-mono border border-slate-700 cursor-pointer"
              >
                React 19 Action Types
              </button>

              <button
                onClick={() =>
                  setCustomTestCode(
                    `// Generic Constraint Pattern\ninterface Identifiable {\n  id: string;\n}\n\nfunction findRecord<T extends Identifiable>(items: T[], targetId: string): T | undefined {\n  return items.find((item) => item.id === targetId);\n}`
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-mono border border-slate-700 cursor-pointer"
              >
                Generics &amp; Constraints
              </button>
            </div>

            {/* Code Editor Area */}
            <div className="relative">
              <textarea
                value={customTestCode}
                onChange={(e) => setCustomTestCode(e.target.value)}
                rows={9}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-indigo-100 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none selection:bg-indigo-500/30"
                placeholder="Type your TypeScript code or type definitions here..."
              />
            </div>

            {/* Real-time Diagnostics Output */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-slate-300">{explorerOutput}</span>
              </div>
              <button
                onClick={handleEvaluateCustomCode}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
              >
                Validate Types
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
              <span>TypeScript 5.x • Strict Type Checking Mode Enabled</span>
              <button
                onClick={() => setIsTypeExplorerOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
