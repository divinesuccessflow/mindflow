'use client';

import React, { useState, useEffect } from 'react';
import { useMindFlowStore } from '@/lib/store';
import { NodePriority, NodeStatus, DEFAULT_COLORS } from '@/lib/types';
import { formatDeadline, isOverdue } from '@/lib/utils';

const STATUSES: { v: NodeStatus; label: string; color: string }[] = [
  { v: 'todo', label: 'Todo', color: '#6b7280' },
  { v: 'doing', label: 'Doing', color: '#f59e0b' },
  { v: 'done', label: 'Done', color: '#10b981' },
];

const PRIORITIES: { v: NodePriority; label: string; color: string }[] = [
  { v: 'urgent', label: '🔴 Urgent', color: '#ef4444' },
  { v: 'high', label: '🟠 High', color: '#f97316' },
  { v: 'normal', label: '🔵 Normal', color: '#6366f1' },
  { v: 'low', label: '⚪ Low', color: '#6b7280' },
];

export default function NodeDetailPanel() {
  const { selectedNodeId, data, updateNode, deleteNode, addNode, getNodeById, setSelectedNode, activeMode } = useMindFlowStore();
  const darkMode = data.settings.darkMode;
  const node = selectedNodeId ? getNodeById(selectedNodeId) : null;

  const [label, setLabel] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (node) {
      setLabel(node.label);
      setDeadline(node.deadline ? node.deadline.split('T')[0] : '');
    }
  }, [node?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!node) return null;
  const overdue = isOverdue(node.deadline) && node.status !== 'done';

  return (
    <div className="absolute right-4 top-4 z-20 w-72" style={{ pointerEvents: 'all' }}>
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: darkMode ? 'rgba(13,15,24,0.97)' : 'rgba(255,255,255,0.97)',
          border: `2px solid ${node.color}44`,
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: `${node.color}15`, borderBottom: `1px solid ${node.color}22` }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: node.color, boxShadow: `0 0 8px ${node.color}` }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: node.color }}>
              {node.isRoot ? 'Workspace' : activeMode === 'tasks' ? 'Task' : 'Node'}
            </span>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Label */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Label</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={() => label.trim() && updateNode(node.id, { label: label.trim() })}
              onKeyDown={(e) => e.key === 'Enter' && label.trim() && updateNode(node.id, { label: label.trim() })}
              className="w-full px-3 py-2 rounded-xl text-sm font-medium outline-none"
              style={{
                background: darkMode ? 'rgba(30,32,44,0.8)' : 'rgba(249,250,251,0.8)',
                border: `1px solid ${node.color}44`,
                color: darkMode ? '#f3f4f6' : '#111827',
              }}
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => updateNode(node.id, { color: c })}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110 active:scale-95"
                  style={{
                    background: c,
                    outline: node.color === c ? `3px solid ${c}` : 'none',
                    outlineOffset: 2,
                    boxShadow: node.color === c ? `0 0 10px ${c}88` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Task-specific */}
          {activeMode === 'tasks' && !node.isRoot && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Status</label>
                <div className="flex gap-1.5">
                  {STATUSES.map((s) => (
                    <button
                      key={s.v}
                      onClick={() => updateNode(node.id, { status: s.v })}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: node.status === s.v ? s.color : `${s.color}22`,
                        color: node.status === s.v ? '#fff' : s.color,
                        border: `1px solid ${s.color}44`,
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Priority</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.v}
                      onClick={() => updateNode(node.id, { priority: p.v })}
                      className="py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: node.priority === p.v ? p.color : `${p.color}22`,
                        color: node.priority === p.v ? '#fff' : p.color,
                        border: `1px solid ${p.color}44`,
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider block mb-1.5"
                  style={{ color: overdue ? '#f87171' : '#6b7280' }}
                >
                  Deadline {overdue && '⚠ Overdue!'}
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => {
                    setDeadline(e.target.value);
                    if (e.target.value) updateNode(node.id, { deadline: new Date(e.target.value + 'T23:59:59').toISOString() });
                  }}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{
                    background: darkMode ? 'rgba(30,32,44,0.8)' : 'rgba(249,250,251,0.8)',
                    border: `1px solid ${overdue ? '#ef4444' : node.color}44`,
                    color: darkMode ? '#f3f4f6' : '#111827',
                  }}
                />
                {node.deadline && (
                  <p className="text-xs mt-1" style={{ color: overdue ? '#f87171' : '#6b7280' }}>
                    {formatDeadline(node.deadline)}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Goal-specific */}
          {activeMode === 'goals' && !node.isRoot && (
            <div className="flex gap-2">
              {[
                { label: 'Current', key: 'currentValue' as const },
                { label: 'Target', key: 'targetValue' as const },
              ].map((field) => (
                <div key={field.key} className="flex-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">{field.label}</label>
                  <input
                    type="number"
                    defaultValue={node[field.key] || 0}
                    onBlur={(e) => updateNode(node.id, { [field.key]: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded-xl text-sm outline-none"
                    style={{
                      background: darkMode ? 'rgba(30,32,44,0.8)' : 'rgba(249,250,251,0.8)',
                      border: `1px solid ${node.color}44`,
                      color: darkMode ? '#f3f4f6' : '#111827',
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Planner-specific */}
          {activeMode === 'planner' && !node.isRoot && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Estimated Time (min)</label>
                <input
                  type="number"
                  defaultValue={node.estimatedTime || 0}
                  onBlur={(e) => updateNode(node.id, { estimatedTime: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{
                    background: darkMode ? 'rgba(30,32,44,0.8)' : 'rgba(249,250,251,0.8)',
                    border: `1px solid ${node.color}44`,
                    color: darkMode ? '#f3f4f6' : '#111827',
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateNode(node.id, { completed: true })}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ background: node.completed ? '#10b981' : `${node.color}33`, color: node.completed ? '#fff' : node.color }}
                >
                  ✓ Complete
                </button>
                <button
                  onClick={() => updateNode(node.id, { completed: false })}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: !node.completed ? '#6b728033' : 'transparent', color: '#6b7280', border: '1px solid #6b728044' }}
                >
                  Reset
                </button>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t" style={{ borderColor: darkMode ? 'rgba(75,85,99,0.2)' : 'rgba(229,231,235,0.5)' }}>
            <button
              onClick={() => addNode(node.id)}
              className="flex-1 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-80"
              style={{ background: `linear-gradient(135deg, ${node.color}, ${node.color}bb)` }}
            >
              + Add Child
            </button>
            {!node.isRoot && (
              <button
                onClick={() => { deleteNode(node.id); setSelectedNode(null); }}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-red-500/10"
                style={{ color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
