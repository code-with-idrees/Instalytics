'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnalysisProvider } from '@/context/AnalysisContext';
import { LayoutDashboard, BarChart3, Lightbulb } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/performance', label: 'Performance', icon: BarChart3 },
  { href: '/dashboard/strategy', label: 'Content Strategy', icon: Lightbulb },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-950/80 border-r border-gray-800/60 backdrop-blur-xl flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800/60">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent">
          Instalytics
        </h1>
        <p className="text-xs text-gray-500 mt-1">AI-Powered Instagram Analytics</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
                }`}
            >
              <Icon
                size={20}
                className={`transition-all duration-200 ${isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-purple-400'}`}
              />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800/60">
        <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-900/30 to-pink-900/20 border border-purple-800/30">
          <p className="text-xs text-gray-400">Powered by</p>
          <p className="text-sm font-semibold text-purple-300">Gemini AI Agents</p>
        </div>
      </div>
    </aside>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnalysisProvider>
      <div className="min-h-screen bg-[#0f0c29] text-white">
        <Sidebar />
        {/* Main content area offset by sidebar width */}
        <main className="ml-64 min-h-screen relative overflow-hidden">
          {/* Decorative background blurs */}
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative z-10 p-8">
            {children}
          </div>
        </main>
      </div>
    </AnalysisProvider>
  );
}
