import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Maximize2, RefreshCw, AlertCircle } from 'lucide-react';

interface MermaidViewerProps {
  chart: string;
  className?: string;
  title?: string;
}

let mermaidInitialized = false;

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart, className = '', title }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        themeVariables: {
          darkMode: true,
          background: 'transparent',
          primaryColor: '#6366f1',
          primaryTextColor: '#f8fafc',
          primaryBorderColor: '#818cf8',
          lineColor: '#94a3b8',
          secondaryColor: '#ec4899',
          tertiaryColor: '#1e293b',
        },
      });
      mermaidInitialized = true;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      if (!chart.trim()) return;
      setIsRendering(true);
      setError(null);

      // Clean diagram text
      let cleaned = chart.trim();
      cleaned = cleaned.replace(/^```mermaid\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

      // Ensure valid diagram prefix if missing
      if (!cleaned.startsWith('graph ') && !cleaned.startsWith('flowchart ')) {
        cleaned = `flowchart TD\n${cleaned}`;
      }

      const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

      try {
        const { svg } = await mermaid.render(id, cleaned);
        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err: any) {
        console.warn('Mermaid render error:', err);
        // Fallback: render a clean fallback diagram
        try {
          const fallbackId = `mermaid-fb-${Math.random().toString(36).substring(2, 9)}`;
          const fallbackChart = `flowchart TD
            A["1. Core Concept"] --> B["2. Hands-on Drill"]
            B --> C["3. Pattern Mastery"]
            C --> D["4. Capstone Project"]`;
          const { svg } = await mermaid.render(fallbackId, fallbackChart);
          if (isMounted) {
            setSvgContent(svg);
            setError('Showing standard roadmap due to diagram syntax adjustment.');
          }
        } catch {
          if (isMounted) {
            setError('Could not render diagram.');
          }
        }
      } finally {
        if (isMounted) {
          setIsRendering(false);
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  return (
    <div className={`relative flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{title}</h4>
          </div>
          <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded-full">
            Mermaid.js Real-Time
          </span>
        </div>
      )}

      <div className="relative p-4 flex items-center justify-center min-h-[180px] overflow-x-auto">
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 z-10 backdrop-blur-[2px]">
            <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
          </div>
        )}

        {svgContent ? (
          <div
            ref={containerRef}
            className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:drop-shadow-md"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="text-xs text-slate-500 font-mono">Generating roadmap graph...</div>
        )}

        {error && (
          <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-800/50 text-amber-300 text-[11px] flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
