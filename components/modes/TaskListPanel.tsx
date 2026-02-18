'use client';

import React, { useState } from 'react';
import { useMindFlowStore } from '@/lib/store';
import { MindNode, NodePriority } from '@/lib/types';
import { isOverdue, formatDeadline } from '@/lib/utils';

const PRIORITY_COLOR: Record<NodePriority, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  normal: '#6366f1',
  low: '#6b7280',
};

export default function TaskListPanel() {
  const { data, updateNode, setSelectedNode, deleteNode, activeMode } = useMindFlowStore();
  const [open, setOpen] = useState(false);
  const darkMode = data.settings.darkMode;

  if (activeMode !== 'tasks') return null;

  const allTasks = data.tasks.nodes.filter((n) => !n.isRoot && n.status);
  const projects = data.tasks.nodes.filter((n) => !n.isRoot && !n.parentId?.includes('root') && data.tasks.nodes.find((r) => r.isRoot)?.id === n.parentId);

  // Sort: urgent first, then by overdue
  const sorted = [...allTasks].sort((a, b) => {
    const ap = a.priority === 'urgent' ? 4 : a.priority === 'high' ? 3 : a.priority === 'normal' ? 2 : 1;
    const bp = b.priority === 'urgent' ? 4 : b.priority === 'high' ? 3 : b.priority === 'normal' ? 2 : 1;
    const aOv = isOverdue(a.deadline) ? 1 : 0;
    const bOv = isOverdue(b.deadline) ? 1 : 0;
    return (bOv - aOv) || (bp - ap);
  });

  const done = sorted.filter((n) => n.status === 'done').length;
  const pct = sorted.length ? Math.round((done / sorted.length) * 100) : 0;

  return (
    <div className="absolute bottom-6 right-6 z-20" style={{ pointerEvents: 'all' }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all hover:scale-105 active:scale-95 mb-2 ml-auto"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
        }}
      >
        <span>📋</span>
        <span>Task List</span>
        {sorted.filter((n) => isOverdue(n.deadline) && n.status !== 'done').length > 0 && (
          <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-black">
            {sorted.filter((n) => isOverdue(n.deadline) && n.status !== 'done').length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="rounded-2xl overflow-hidden shadow-2xl animate-fade-in"
          style={{
            width: 320,
            maxHeight: 480,
            background: darkMode ? 'rgba(10,12,20,0.97)' : 'rgba(255,255,255,0.97)',
            border: `1px solid ${darkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)'}`,
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))', borderBottom: '1px solid rgba(99,102,241,0.15)' }}
          >
            <div>
              <div className="font-bold text-sm" style={{ color: '#818cf8' }}>All Tasks</div>
              <div className="text-xs text-gray-400">{done}/{sorted.length} done · {pct}% complete</div>
            </div>
            {/* Mini progress bar */}
            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(75,85,99,0.3)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6366f1, #10b981)', transition: 'width 0.5s ease' }}
              />
            </div>
          </div>

          {/* Task list */}
          <div className="overflow-y-auto flex-1">
            {sorted.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No tasks yet. Right-click the canvas to add one.
              </div>
            ) : (
              sorted.map((task) => {
                const od = isOverdue(task.deadline) && task.status !== 'done';
                return (
                  <div
                    key={task.id}
                    className="px-4 py-2.5 border-b flex items-start gap-3 cursor-pointer transition-colors"
                    style={{
                      borderColor: darkMode ? 'rgba(75,85,99,0.12)' : 'rgba(229,231,235,0.4)',
                      background: od ? 'rgba(239,68,68,0.04)' : 'transparent',
                    }}
                    onClick={() => { setSelectedNode(task.id); }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = darkMode ? 'rgba(75,85,99,0.1)' : 'rgba(243,244,246,0.8)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = od ? 'rgba(239,68,68,0.04)' : 'transparent')}
                  >
                    {/* Status toggle */}
                    <button
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all hover:scale-110"
                      style={{
                        borderColor: task.status === 'done' ? '#10b981' : task.status === 'doing' ? '#f59e0b' : '#6b7280',
                        background: task.status === 'done' ? '#10b981' : 'transparent',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateNode(task.id, { status: task.status === 'done' ? 'todo' : 'done' });
                      }}
                    >
                      {task.status === 'done' && <span className="text-white text-[8px] font-black">✓</span>}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-medium truncate"
                        style={{
                          color: task.status === 'done' ? '#6b7280' : darkMode ? '#e5e7eb' : '#111827',
                          textDecoration: task.status === 'done' ? 'line-through' : 'none',
                        }}
                      >
                        {task.label}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.priority && (
                          <span
                            className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                            style={{
                              background: `${PRIORITY_COLOR[task.priority]}22`,
                              color: PRIORITY_COLOR[task.priority],
                            }}
                          >
                            {task.priority}
                          </span>
                        )}
                        {task.deadline && (
                          <span className="text-[10px]" style={{ color: od ? '#f87171' : '#6b7280' }}>
                            {formatDeadline(task.deadline)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Color dot */}
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: task.color }} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
