'use client';

import React, { useState } from 'react';
import { useAnalysis } from '@/context/AnalysisContext';
import { Activity, Zap, AlertCircle, LayoutList, TrendingUp, Eye, Heart, MessageCircle, Hash, Search, ArrowRight, Video } from 'lucide-react';

export default function OverviewPage() {
  const { data, loading, error, step, handle, fetchReels, generatePlan } = useAnalysis();
  const [inputHandle, setInputHandle] = useState('');

  const onFetchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputHandle.trim()) {
      fetchReels(inputHandle);
    }
  };

  // Compute summary stats from reels data
  const totalPlays = data?.reels?.reduce((sum: number, r: any) => sum + (r.plays || 0), 0) || 0;
  const totalLikes = data?.reels?.reduce((sum: number, r: any) => sum + (r.like_count || 0), 0) || 0;
  const totalComments = data?.reels?.reduce((sum: number, r: any) => sum + (r.comments_count || 0), 0) || 0;
  const totalReach = data?.reels?.reduce((sum: number, r: any) => sum + (r.reach || 0), 0) || 0;
  const reelCount = data?.reels?.length || 0;

  const statCards = [
    { label: 'Total Plays', value: totalPlays.toLocaleString(), icon: Eye, color: 'from-purple-500 to-indigo-600' },
    { label: 'Total Likes', value: totalLikes.toLocaleString(), icon: Heart, color: 'from-pink-500 to-rose-600' },
    { label: 'Total Comments', value: totalComments.toLocaleString(), icon: MessageCircle, color: 'from-blue-500 to-cyan-600' },
    { label: 'Total Reach', value: totalReach.toLocaleString(), icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <div className="space-y-8 max-w-5xl relative z-10">
      
      {/* Step 0: Initial State (Enter Handle) */}
      {step === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
            <Search size={40} className="text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent drop-shadow-sm mb-4">
            Instalytics Dashboard
          </h1>
          <p className="text-gray-400 text-lg max-w-lg mb-8">Enter your Instagram handle to fetch your recent reels and generate AI-powered insights.</p>
          
          <form onSubmit={onFetchSubmit} className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">@</span>
              <input
                type="text"
                placeholder="instagram_handle"
                value={inputHandle}
                onChange={(e) => setInputHandle(e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-gray-900/60 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all backdrop-blur-md"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputHandle.trim()}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/25 active:scale-95 font-semibold"
            >
              {loading ? <Zap size={20} className="animate-spin" /> : <Activity size={20} />}
              {loading ? 'Fetching...' : 'Fetch Reels'}
            </button>
          </form>

          {error && (
            <div className="mt-6 bg-red-900/50 border border-red-500 text-red-200 px-6 py-4 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Reels Fetched, Waiting to Generate Plan */}
      {step === 1 && data && (
        <div className="space-y-8 fade-slide-up-delay">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-900/40 border border-gray-800/60 p-8 rounded-2xl backdrop-blur-md shadow-2xl">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Video className="text-emerald-400" size={24} />
                </span>
                Data Fetched!
              </h2>
              <p className="text-gray-400">Successfully retrieved {data.reels.length} reels for <span className="text-purple-400 font-semibold">@{handle}</span></p>
            </div>
            
            <button
              onClick={generatePlan}
              disabled={loading}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl disabled:opacity-50 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-purple-500/25 active:scale-95 border border-white/10"
            >
              {loading ? <Zap size={24} className="animate-spin text-white" /> : <Activity size={24} className="text-white group-hover:scale-110 transition-transform" />}
              <span className="font-semibold text-white text-lg">{loading ? 'AI is analyzing...' : 'Generate Content Plan'}</span>
              {!loading && <ArrowRight size={20} className="text-white group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>

          <h3 className="text-xl font-bold border-b border-gray-800 pb-3 mb-4 flex items-center gap-2">
            <LayoutList className="text-purple-400" size={20} />
            Raw Reels Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.reels.map((reel: any) => (
              <div key={reel.id} className="bg-black/40 border border-gray-800/60 rounded-xl p-5 hover:border-purple-500/30 transition-colors">
                <p className="text-sm text-gray-200 mb-4 line-clamp-3 leading-relaxed">{reel.caption}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5 bg-gray-900 px-2.5 py-1.5 rounded-lg"><Eye size={14} className="text-purple-400" />{reel.plays?.toLocaleString()} plays</span>
                  <span className="flex items-center gap-1.5 bg-gray-900 px-2.5 py-1.5 rounded-lg"><Heart size={14} className="text-pink-400" />{reel.like_count?.toLocaleString()} likes</span>
                  <span className="flex items-center gap-1.5 bg-gray-900 px-2.5 py-1.5 rounded-lg"><MessageCircle size={14} className="text-blue-400" />{reel.comments_count?.toLocaleString()} comments</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Full Overview */}
      {step === 2 && data && (
        <div className="fade-slide-up-delay">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-white mb-1">Overview: <span className="text-purple-400">@{handle}</span></h1>
              <p className="text-gray-400">AI analysis complete. Here's your bird's-eye view.</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-gray-900/50 border border-gray-800/60 rounded-xl p-5 backdrop-blur-sm hover:border-gray-700 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</span>
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon size={16} className="text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Top Patterns + Niche Keywords */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Patterns */}
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/60 backdrop-blur-sm">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <LayoutList className="text-pink-500" size={20} />
                Top Patterns
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Niche Detected', value: data.analysis?.detected_niche, highlight: true },
                  { label: 'Avg Caption Length', value: data.analysis?.top_patterns?.avg_caption_length },
                  { label: 'Best Posting Time', value: data.analysis?.top_patterns?.best_posting_time },
                  { label: 'Content Tone', value: data.analysis?.top_patterns?.tone },
                  { label: 'Hashtag Range', value: data.analysis?.top_patterns?.hashtag_count_range },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-800/40 last:border-0">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className={`text-sm font-semibold capitalize ${item.highlight ? 'text-purple-400' : 'text-gray-200'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Niche Keywords & Reels Summary */}
            <div className="space-y-6">
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/60 backdrop-blur-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Hash className="text-purple-400" size={20} />
                  Niche Keywords
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.analysis?.niche_keywords?.map((keyword: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-purple-500/15 border border-purple-500/30 rounded-full text-sm text-purple-300 font-medium">
                      {keyword}
                    </span>
                  ))}
                  {data.analysis?.top_patterns?.common_keywords?.map((keyword: string, idx: number) => (
                    <span key={`ck-${idx}`} className="px-3 py-1.5 bg-pink-500/15 border border-pink-500/30 rounded-full text-sm text-pink-300 font-medium">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/60 backdrop-blur-sm">
                <h2 className="text-lg font-bold mb-3">Reels Analyzed</h2>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">{reelCount}</span>
                  <span className="text-gray-500 text-sm mb-2">reels processed by AI</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Top Performers', count: data.analysis?.performance_labels?.filter((p: any) => p.label === 'TOP_PERFORMER').length || 0, color: 'text-emerald-400' },
                    { label: 'Average', count: data.analysis?.performance_labels?.filter((p: any) => p.label === 'AVERAGE').length || 0, color: 'text-yellow-400' },
                    { label: 'Underperformers', count: data.analysis?.performance_labels?.filter((p: any) => p.label === 'UNDERPERFORMER').length || 0, color: 'text-red-400' },
                  ].map((cat, idx) => (
                    <div key={idx} className="text-center p-3 bg-black/30 rounded-lg border border-gray-800/40">
                      <p className={`text-2xl font-bold ${cat.color}`}>{cat.count}</p>
                      <p className="text-xs text-gray-500 mt-1">{cat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
