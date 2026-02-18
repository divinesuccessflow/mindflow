'use client';

import React, { useEffect } from 'react';
import { useMindFlowStore } from '@/lib/store';
import { useAutoSave } from '@/lib/useAutoSave';
import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';
import MindMapCanvas from '@/components/mindmap/MindMapCanvas';
import NodeDetailPanel from '@/components/mindmap/NodeDetailPanel';
import KeyboardShortcuts from '@/components/mindmap/KeyboardShortcuts';
import BrainDumpPanel from '@/components/modes/BrainDumpPanel';
import PlannerPanel from '@/components/modes/PlannerPanel';
import GoalPanel from '@/components/modes/GoalPanel';
import KnowledgePanel from '@/components/modes/KnowledgePanel';
import TaskListPanel from '@/components/modes/TaskListPanel';

const MODE_LABELS: Record<string, string> = {
  tasks: '✓ Task Board',
  braindump: '🧠 Brain Dump',
  planner: '📅 Daily Planner',
  goals: '🎯 Goal Tracker',
  knowledge: '📚 Knowledge Base',
};

function SaveBadge() {
  const { isSaving, lastSaved } = useAutoSave();
  const darkMode = useMindFlowStore((s) => s.data.settings.darkMode);

  if (!isSaving && !lastSaved) return null;

  const timeAgo = lastSaved
    ? Math.round((Date.now() - lastSaved.getTime()) / 1000) < 10
      ? 'just now'
      : `${Math.round((Date.now() - lastSaved.getTime()) / 1000)}s ago`
    : '';

  return (
    <div
      className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs z-10"
      style={{
        background: darkMode ? 'rgba(10,12,20,0.9)' : 'rgba(255,255,255,0.9)',
        border: `1px solid ${darkMode ? 'rgba(75,85,99,0.25)' : 'rgba(229,231,235,0.6)'}`,
        backdropFilter: 'blur(8px)',
        color: darkMode ? '#6b7280' : '#9ca3af',
      }}
    >
      {isSaving ? (
        <>
          <div className="w-3 h-3 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span>Saving…</span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Saved {timeAgo}</span>
        </>
      )}
    </div>
  );
}

export default function Home() {
  const { data, activeMode, selectedNodeId } = useMindFlowStore();
  const darkMode = data.settings.darkMode;

  useEffect(() => {
    document.body.style.background = darkMode ? '#0a0c14' : '#f8fafc';
    document.body.style.color = darkMode ? '#f3f4f6' : '#111827';
  }, [darkMode]);

  const showNodePanel = (activeMode === 'tasks' || activeMode === 'planner') && selectedNodeId;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: darkMode ? '#0a0c14' : '#f8fafc' }}>
      <TopBar />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar />

        <main className="flex-1 relative overflow-hidden min-w-0">
          <MindMapCanvas />

          {/* Mode overlays */}
          {activeMode === 'braindump' && <BrainDumpPanel />}
          {activeMode === 'planner' && <PlannerPanel />}
          {activeMode === 'knowledge' && selectedNodeId && <KnowledgePanel />}
          {activeMode === 'goals' && selectedNodeId && <GoalPanel />}
          {showNodePanel && <NodeDetailPanel />}
          <TaskListPanel />

          {/* Save indicator */}
          <SaveBadge />

          {/* Mode badge */}
          <div
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold z-10 select-none"
            style={{
              background: darkMode ? 'rgba(10,12,20,0.85)' : 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(99,102,241,0.25)',
              color: '#818cf8',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 8px rgba(99,102,241,0.15)',
            }}
          >
            {MODE_LABELS[activeMode]}
          </div>
        </main>
      </div>

      <KeyboardShortcuts />
    </div>
  );
}
