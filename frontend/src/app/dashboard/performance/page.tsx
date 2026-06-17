'use client';

import React from 'react';
import { useAnalysis } from '@/context/AnalysisContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight, Eye, Heart, Share2, Bookmark } from 'lucide-react';

const LABEL_COLORS: Record<string, string> = {
  TOP_PERFORMER: '#10b981',
  AVERAGE: '#eab308',
  UNDERPERFORMER: '#ef4444',
};

const LABEL_BG: Record<string, string> = {
  TOP_PERFORMER: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  AVERAGE: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400',
  UNDERPERFORMER: 'bg-red-500/15 border-red-500/30 text-red-400',
};

export default function PerformancePage() {
  const { data, step } = useAnalysis();

  if (step < 2 || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20 flex items-center justify-center mb-6">
          <BarChart3 size={40} className="text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Data Yet</h2>
        <p className="text-gray-400 max-w-md">Go to the <strong className="text-purple-400">Overview</strong> page and complete the analysis flow first.</p>
      </div>
    );
  }

  // Build chart data with labels
  const chartData = data.reels.map((reel: any) => {
    const perfLabel = data.analysis?.performance_labels?.find((p: any) => p.id === reel.id);
    return {
      id: `Reel ${reel.id}`,
      plays: reel.plays,
      likes: reel.like_count,
      reach: reel.reach,
      label: perfLabel?.label || 'AVERAGE',
      caption: reel.caption?.slice(0, 60) + '...',
    };
  });

  const topPerformers = data.reels.filter((r: any) =>
    data.analysis?.performance_labels?.find((p: any) => p.id === r.id && p.label === 'TOP_PERFORMER')
  );
  const underperformers = data.reels.filter((r: any) =>
    data.analysis?.performance_labels?.find((p: any) => p.id === r.id && p.label === 'UNDERPERFORMER')
  );

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-1">Performance Analytics</h1>
        <p className="text-gray-400">Deep dive into your reels metrics and AI-labeled performance tiers</p>
      </div>

      {/* Plays Bar Chart */}
      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/60 backdrop-blur-sm">
        <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
          <BarChart3 className="text-purple-400" size={20} />
          Plays by Reel
        </h2>
        <p className="text-xs text-gray-500 mb-5">Color-coded by AI performance label: <span className="text-emerald-400">Top</span> · <span className="text-yellow-400">Average</span> · <span className="text-red-400">Under</span></p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="15%">
              <XAxis dataKey="id" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                labelStyle={{ color: '#9CA3AF', fontWeight: 600 }}
                formatter={(value: number) => [value.toLocaleString(), 'Plays']}
              />
              <Bar dataKey="plays" radius={[6, 6, 0, 0]}>
                {chartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={LABEL_COLORS[entry.label] || '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/60 backdrop-blur-sm">
        <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
          <TrendingUp className="text-emerald-400" size={20} />
          Top Performers
        </h2>
        <div className="space-y-3">
          {topPerformers.map((reel: any) => (
            <div key={reel.id} className="bg-black/30 border border-gray-800/40 rounded-xl p-5 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-gray-200 font-medium leading-relaxed max-w-2xl">{reel.caption?.split('\n')[0]}</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ml-4 ${LABEL_BG['TOP_PERFORMER']}`}>
                  <ArrowUpRight size={12} className="inline mr-1" />Top
                </span>
              </div>
              <div className="flex gap-6 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Eye size={14} />{reel.plays?.toLocaleString()} plays</span>
                <span className="flex items-center gap-1"><Heart size={14} />{reel.like_count?.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Share2 size={14} />{reel.shares?.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Bookmark size={14} />{reel.saved?.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Underperformers with Diagnoses */}
      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/60 backdrop-blur-sm">
        <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
          <TrendingDown className="text-red-400" size={20} />
          Underperformers & AI Diagnosis
        </h2>
        <div className="space-y-3">
          {underperformers.map((reel: any) => {
            const diagnosis = data.analysis?.underperformer_diagnoses?.find((d: any) => d.id === reel.id);
            return (
              <div key={reel.id} className="bg-black/30 border border-gray-800/40 rounded-xl p-5 hover:border-red-500/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm text-gray-200 font-medium leading-relaxed max-w-2xl">{reel.caption?.split('\n')[0]}</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ml-4 ${LABEL_BG['UNDERPERFORMER']}`}>
                    <TrendingDown size={12} className="inline mr-1" />Under
                  </span>
                </div>
                <div className="flex gap-6 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Eye size={14} />{reel.plays?.toLocaleString()} plays</span>
                  <span className="flex items-center gap-1"><Heart size={14} />{reel.like_count?.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Share2 size={14} />{reel.shares?.toLocaleString()}</span>
                </div>
                {diagnosis && (
                  <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-3 mt-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">
                          {diagnosis.reason?.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-gray-300">{diagnosis.improvement}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
