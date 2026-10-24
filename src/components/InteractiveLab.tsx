import React, { useState } from 'react';
import { Play, RotateCcw, CheckCircle2, Sparkles, Terminal, Sliders, Code2, AlertTriangle, Cpu } from 'lucide-react';
import { LearningStep } from '../types/learning.ts';
import { InteractiveTypeScriptText } from './InteractiveTypeScriptText.tsx';

interface InteractiveLabProps {
  step: LearningStep;
  onRecordAction: (action: string, details?: string) => void;
  onSuccessExercise?: () => void;
}

export const InteractiveLab: React.FC<InteractiveLabProps> = ({
  step,
  onRecordAction,
  onSuccessExercise,
}) => {
  // Interactive lab parameters
  const [latencyMs, setLatencyMs] = useState<number>(120);
  const [simulateError, setSimulateError] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'console'>('preview');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionOutput, setExecutionOutput] = useState<Array<{ text: string; type: 'info' | 'success' | 'warn' | 'error' }>>([
    { text: `// Sandbox ready for ${step.title}`, type: 'info' },
    { text: `// Click 'Run Code Simulation' below to observe real-time execution`, type: 'info' },
  ]);
  const [hasRunSuccess, setHasRunSuccess] = useState<boolean>(false);
  const [counterState, setCounterState] = useState<number>(0);
  const [optimisticText, setOptimisticText] = useState<string>('Add Item to List');

  // Code template tailored to the step
  const [customCode, setCustomCode] = useState<string>(
    step.interactiveChallenge.starterCode ||
      `// React 19 Interactive Mental Model
async function updateAction(previousState, formData) {
  'use server';
  const name = formData.get("name");
  // Simulating server action with latency
  await delay(${latencyMs});
  if (${simulateError}) {
    throw new Error("Simulated Server Action Failure!");
  }
  return { success: true, item: name, updatedTimestamp: Date.now() };
}`
  );

  const handleRunSimulation = () => {
    setIsExecuting(true);
    setHasRunSuccess(false);
    onRecordAction('Interactive Sandbox: Run Clicked', `Latency: ${latencyMs}ms, Error: ${simulateError}`);

    setExecutionOutput([
      { text: `[1] Initiating build cycle for: ${step.title}...`, type: 'info' },
      { text: `[2] Mounting virtual sandbox environment...`, type: 'info' },
    ]);

    setTimeout(() => {
      if (simulateError) {
        setExecutionOutput((prev) => [
          ...prev,
          { text: `[3] Dispatched action with latency: ${latencyMs}ms`, type: 'info' },
          { text: `[4] ❌ Error Caught: "Simulated Server Action Failure!"`, type: 'error' },
          { text: `[5] React Error Boundary triggered gracefully. Telemetry logged.`, type: 'warn' },
        ]);
        setIsExecuting(false);
        onRecordAction('Interactive Sandbox: Execution Error Encountered', 'Simulated failure handled');
      } else {
        setCounterState((c) => c + 1);
        setExecutionOutput((prev) => [
          ...prev,
          { text: `[3] Action dispatched (Network latency: ${latencyMs}ms)`, type: 'info' },
          { text: `[4] Optimistic UI updated instant client view`, type: 'info' },
          { text: `[5] Server responded 200 OK. State merged cleanly!`, type: 'success' },
          { text: `[6] ✓ All test assertions passed (Render time: ${latencyMs + 18}ms)`, type: 'success' },
        ]);
        setIsExecuting(false);
        setHasRunSuccess(true);
        onRecordAction('Interactive Sandbox: Execution Passed', `Render: ${latencyMs + 18}ms`);
        if (onSuccessExercise) onSuccessExercise();
      }
    }, Math.max(300, latencyMs));
  };

  const handleReset = () => {
    setLatencyMs(120);
    setSimulateError(false);
    setCounterState(0);
    setHasRunSuccess(false);
    setExecutionOutput([
      { text: `// Sandbox reset to initial state`, type: 'info' },
    ]);
    onRecordAction('Interactive Sandbox: Reset', 'Default params restored');
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl">
      {/* Sandbox Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
              <span>Interactive Concept Playground</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Simulator
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Tweak parameters, run the simulation, and see immediate visual results.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors flex items-center gap-1 cursor-pointer"
            title="Reset sandbox"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handleRunSimulation}
            disabled={isExecuting}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Play className={`w-3.5 h-3.5 fill-white ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Simulating...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Controls & Parameters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
        {/* Slider: Latency */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Network Latency:
            </span>
            <span className="font-mono text-indigo-400 font-bold">{latencyMs}ms</span>
          </div>
          <input
            type="range"
            min="20"
            max="600"
            step="20"
            value={latencyMs}
            onChange={(e) => {
              setLatencyMs(Number(e.target.value));
              onRecordAction('Sandbox latency slider changed', `${e.target.value}ms`);
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Toggle: Error Simulation */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
            <AlertTriangle className={`w-3.5 h-3.5 ${simulateError ? 'text-rose-400' : 'text-slate-500'}`} />
            Simulate Server Failure:
          </span>
          <button
            onClick={() => {
              const next = !simulateError;
              setSimulateError(next);
              onRecordAction('Sandbox error toggle', next ? 'Enabled' : 'Disabled');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              simulateError
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {simulateError ? 'ON (Fails)' : 'OFF (Nominal)'}
          </button>
        </div>
      </div>

      {/* Split Interactive View: Code on Left / Visual Result on Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Code Snippet / Inspector */}
        <div className="flex flex-col rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Logic Specification</span>
            </span>
            <span className="text-[10px] text-slate-500">Live Parameters Linked</span>
          </div>

          <div className="p-3.5 font-mono text-xs leading-relaxed text-indigo-200/90 overflow-x-auto max-h-56">
            <pre className="text-slate-300">
              <span className="text-slate-500">// Real-time parameters active</span>{'\n'}
              <span className="text-indigo-400">const</span> latency = <span className="text-amber-300">{latencyMs}</span>;{'\n'}
              <span className="text-indigo-400">const</span> shouldFail = <span className="text-rose-400">{simulateError ? 'true' : 'false'}</span>;{'\n\n'}
              <span className="text-purple-400">async function</span> <span className="text-blue-400">executeMilestoneStep</span>() &#123;{'\n'}
              {'  '}<span className="text-emerald-400">'use action'</span>;{'\n'}
              {'  '}<span className="text-indigo-400">await</span> wait(latency);{'\n'}
              {simulateError ? (
                <span className="text-rose-300">{'  '}<span className="text-indigo-400">throw new</span> <span className="text-rose-400">Error</span>(<span className="text-amber-200">"Server Error"</span>);{'\n'}</span>
              ) : (
                <span className="text-emerald-300">{'  '}<span className="text-indigo-400">return</span> &#123; status: <span className="text-amber-200">"SUCCESS"</span>, count: <span className="text-amber-300">{counterState}</span> &#125;;{'\n'}</span>
              )}
              &#125;
            </pre>
          </div>
        </div>

        {/* Right: Interactive Result & Visual Output */}
        <div className="flex flex-col rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
          {/* Tabs: Preview vs Console */}
          <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/80 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Visual Sandbox UI
              </button>
              <button
                onClick={() => setActiveTab('console')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'console'
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Console Logs ({executionOutput.length})
              </button>
            </div>
            {hasRunSuccess && (
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>

          {/* View Tab Body */}
          <div className="p-4 flex-1 flex flex-col justify-center min-h-[170px]">
            {activeTab === 'preview' ? (
              <div className="flex flex-col gap-3">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Simulated State Count:</span>
                  <span className="font-mono text-base font-bold text-emerald-400">
                    {counterState}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={optimisticText}
                    onChange={(e) => setOptimisticText(e.target.value)}
                    placeholder="Enter state item name..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleRunSimulation}
                    disabled={isExecuting}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isExecuting ? 'Dispatching...' : 'Dispatch'}
                  </button>
                </div>

                {hasRunSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Experiment successful! State transition executed flawlessly.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="font-mono text-[11px] flex flex-col gap-1 max-h-48 overflow-y-auto">
                {executionOutput.map((out, idx) => (
                  <div
                    key={idx}
                    className={`${
                      out.type === 'error'
                        ? 'text-rose-400 font-bold'
                        : out.type === 'warn'
                        ? 'text-amber-400'
                        : out.type === 'success'
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {out.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive TypeScript Tokens Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] text-slate-400 font-semibold">
            Interactive TypeScript Syntax Tokens (Click to inspect type guarantees):
          </span>
        </div>
        <InteractiveTypeScriptText
          text="Inspect live tokens: `interface ActionState<T>` • `Promise<Response>` • `useActionState` • `Record<string, number>` • `readonly` • `useState<T>`"
          enableTypewriter={false}
          showInspectorButton={true}
        />
      </div>
    </div>
  );
};
