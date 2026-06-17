'use client';

import React from 'react';
import { useAnalysis } from '@/context/AnalysisContext';
import { Calendar, Lightbulb, Columns3, Zap, Clock, Hash, Sparkles } from 'lucide-react';

const PILLAR_COLORS = [
  'from-purple-500/20 to-indigo-500/10 border-purple-500/30',
  'from-pink-500/20 to-rose-500/10 border-pink-500/30',
  'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
];

const PILLAR_ACCENT = ['text-purple-400', 'text-pink-400', 'text-blue-400'];

export default function StrategyPage() {
  const { data, step } = useAnalysis();

  if (step < 2 || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20 flex items-center justify-center mb-6">
          <Lightbulb size={40} className="text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Data Yet</h2>
        <p className="text-gray-400 max-w-md">Go to the <strong className="text-purple-400">Overview</strong> page and complete the analysis flow first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-1">Content Strategy</h1>
        <p className="text-gray-400">AI-generated content pillars, weekly plan, and quick wins to boost growth</p>
      </div>

      {/* Content Pillars */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Columns3 className="text-purple-400" size={20} />
          Content Pillars
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.plan?.content_pillars?.map((pillar: any, idx: number) => (
            <div key={idx} className={`bg-gradient-to-br ${PILLAR_COLORS[idx % 3]} border rounded-xl p-5 backdrop-blur-sm hover:scale-[1.02] transition-transform duration-200`}>
              <h3 className={`text-lg font-bold mb-2 ${PILLAR_ACCENT[idx % 3]}`}>{pillar.name}</h3>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">{pillar.description}</p>
              <div className="bg-black/30 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Why it works</p>
                <p className="text-xs text-gray-300 leading-relaxed">{pillar.why_it_works}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Post Ideas</p>
                <ul className="space-y-1.5">
                  {pillar.post_ideas?.map((idea: string, iidx: number) => (
                    <li key={iidx} className="text-xs text-gray-300 flex items-start gap-2">
                      <Sparkles size={12} className={`${PILLAR_ACCENT[idx % 3]} mt-0.5 shrink-0`} />
                      {idea}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Content Plan */}
      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/60 backdrop-blur-sm">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Calendar className="text-purple-400" size={20} />
          7-Day Content Plan
        </h2>
        <div className="space-y-3">
          {data.plan?.seven_day_plan?.map((day: any, idx: number) => {
            const pillarIdx = data.plan?.content_pillars?.findIndex((p: any) => p.name === day.pillar);
            const accentColor = PILLAR_ACCENT[(pillarIdx !== -1 ? pillarIdx : idx) % 3];
            return (
              <div key={idx} className="bg-black/30 p-5 rounded-xl border border-gray-800/40 hover:border-purple-500/30 transition-all duration-200 group">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${accentColor}`}>{day.day}</span>
                    <span className="text-xs px-2.5 py-1 bg-gray-800/80 rounded-full text-gray-300 font-medium border border-gray-700/50">
                      {day.pillar}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock size={12} />
                    Best post time: <span className="text-gray-300 font-medium capitalize">{day.best_post_time}</span>
                  </div>
                </div>
                
                <p className="text-base font-semibold text-white mb-1 group-hover:text-purple-200 transition-colors">"{day.hook_line}"</p>
                <p className="text-sm text-gray-400 mb-1">{day.reel_concept}</p>
                <p className="text-xs text-gray-500 mb-3 italic">{day.caption_angle}</p>
                
                <div className="flex gap-2 flex-wrap">
                  {day.hashtags?.map((tag: string, tid: number) => (
                    <span key={tid} className="text-xs px-2 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full text-pink-400 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Wins */}
      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/60 backdrop-blur-sm">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Zap className="text-yellow-400" size={20} />
          Quick Wins
        </h2>
        <p className="text-sm text-gray-400 mb-5">Easy improvements you can make right now to boost performance</p>
        <div className="space-y-3">
          {data.plan?.quick_wins?.map((win: string, idx: number) => (
            <div key={idx} className="flex items-start gap-3 bg-black/30 border border-gray-800/40 rounded-xl p-4 hover:border-yellow-500/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-sm font-bold text-yellow-400">{idx + 1}</span>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">{win}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
