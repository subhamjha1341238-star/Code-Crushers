import React, { useState, useEffect } from 'react';
import { X, Globe, ExternalLink, Search, Sparkles, BookOpen, CheckCircle, RefreshCw } from 'lucide-react';
import { GroundedKnowledgeResult } from '../server/geminiService.ts';

interface GroundedKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic: string;
}

export const GroundedKnowledgeModal: React.FC<GroundedKnowledgeModalProps> = ({
  isOpen,
  onClose,
  initialTopic,
}) => {
  const [topic, setTopic] = useState<string>(initialTopic);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GroundedKnowledgeResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTopic(initialTopic);
      performSearch(initialTopic);
    }
  }, [isOpen, initialTopic]);

  const performSearch = async (searchTopic: string) => {
    if (!searchTopic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/grounded-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: searchTopic }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.warn('Grounded search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(topic);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">Live Google Search Grounding</h3>
                <span className="text-[10px] font-mono uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  Gemini 3.8 Flash + googleSearch
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Fresh, authoritative documentation & real-world 2026 industry knowledge
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleFormSubmit} className="flex gap-2 mt-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Search modern docs, best practices, or syntax..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="px-5 py-2.5 rounded-xl font-medium text-xs bg-sky-600 hover:bg-sky-500 text-white transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Ground Search</span>
          </button>
        </form>

        {/* Body Result */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 flex flex-col gap-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
              <div className="text-sm font-medium">Grounding search via Google Web Index & Gemini...</div>
              <div className="text-xs text-slate-500 font-mono">Fetching latest 2026 specs and verified citations</div>
            </div>
          ) : result ? (
            <div className="flex flex-col gap-4 animate-fade-in">
              {/* Grounded Summary Card */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Live Grounded Knowledge Briefing
                  </span>
                </div>
                <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {result.summary}
                </div>
              </div>

              {/* Verified Sources & Citations */}
              {result.sources && result.sources.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                    <span>Authoritative Sources & Documentation Citations</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl bg-slate-950/40 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 truncate">
                            {src.title || 'Official Web Resource'}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                            {src.url}
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-sky-400 shrink-0 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Grounding Search Queries Used */}
              {result.searchQueries && result.searchQueries.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span className="text-slate-500 shrink-0">Search Queries:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.searchQueries.map((q, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800/60 border border-slate-700/40 text-slate-300 text-[11px]">
                        "{q}"
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm">
              Enter any topic above to fetch Google Search grounded learning insights.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
