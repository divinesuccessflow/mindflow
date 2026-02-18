'use client';

import React, { useRef } from 'react';
import { useMindFlowStore } from '@/lib/store';
import { AppMode, MindFlowData } from '@/lib/types';

const MODES: { id: AppMode; label: string; icon: string }[] = [
  { id: 'tasks', label: 'Tasks', icon: '✓' },
  { id: 'braindump', label: 'Dump', icon: '🧠' },
  { id: 'planner', label: 'Planner', icon: '📅' },
  { id: 'goals', label: 'Goals', icon: '🎯' },
  { id: 'knowledge', label: 'Knowledge', icon: '📚' },
];

export default function TopBar() {
  const { activeMode, setActiveMode, exportData, importData, data, toggleDarkMode, toggleSidebar } = useMindFlowStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const darkMode = data.settings.darkMode;

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as MindFlowData;
        importData(parsed);
      } catch {
        alert('Invalid JSON file. Please use a MindFlow export.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const btnBase = `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150`;

  return (
    <header
      className="flex items-center justify-between px-4 h-14 shrink-0 z-30"
      style={{
        background: darkMode ? 'rgba(10,12,20,0.98)' : 'rgba(255,255,255,0.98)',
        borderBottom: `1px solid ${darkMode ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)'}`,
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: darkMode ? '#6b7280' : '#9ca3af', background: 'transparent' }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.background = darkMode ? 'rgba(75,85,99,0.2)' : 'rgba(243,244,246,0.8)')}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
        >
          ☰
        </button>

        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)' }}
          >
            M
          </div>
          <span
            className="font-black text-xl tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            MindFlow
          </span>
        </div>
      </div>

      {/* Center: Mode tabs */}
      <nav
        className="flex items-center gap-1 p-1 rounded-xl"
        style={{ background: darkMode ? 'rgba(22,25,38,0.9)' : 'rgba(243,244,246,0.9)' }}
      >
        {MODES.map((mode, i) => {
          const active = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background: active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                color: active ? '#fff' : darkMode ? '#9ca3af' : '#6b7280',
                boxShadow: active ? '0 2px 12px rgba(99,102,241,0.4)' : 'none',
                transform: active ? 'translateY(-1px)' : 'none',
              }}
              title={`${mode.label} (${i + 1})`}
            >
              <span>{mode.icon}</span>
              <span className="hidden md:inline">{mode.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={exportData}
          className={btnBase}
          style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
          title="Export JSON"
        >
          <span className="text-base">↑</span>
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className={btnBase}
          style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
          title="Import JSON"
        >
          <span className="text-base">↓</span>
          <span className="hidden sm:inline">Import</span>
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

        <div className="w-px h-6 mx-1" style={{ background: darkMode ? 'rgba(75,85,99,0.4)' : 'rgba(229,231,235,0.8)' }} />

        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{
            background: darkMode ? 'rgba(251,191,36,0.1)' : 'rgba(99,102,241,0.1)',
            color: darkMode ? '#fbbf24' : '#6366f1',
          }}
          title="Toggle dark/light mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}
