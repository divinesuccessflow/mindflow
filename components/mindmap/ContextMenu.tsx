'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMindFlowStore } from '@/lib/store';
import { DEFAULT_COLORS } from '@/lib/types';

interface Props {
  x: number;
  y: number;
  nodeId: string | null;
  onClose: () => void;
}

export default function ContextMenu({ x, y, nodeId, onClose }: Props) {
  const { addNode, deleteNode, updateNode, getNodeById, setEditingNode, activeMode, data } = useMindFlowStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [sub, setSub] = useState<'color' | 'deadline' | null>(null);
  const [deadline, setDeadline] = useState('');
  const darkMode = data.settings.darkMode;
  const node = nodeId ? getNodeById(nodeId) : null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const ax = Math.min(x, window.innerWidth - 220);
  const ay = Math.min(y, window.innerHeight - 380);

  const bg = darkMode ? 'rgba(15,17,26,0.98)' : 'rgba(255,255,255,0.98)';
  const border = darkMode ? 'rgba(75,85,99,0.4)' : 'rgba(229,231,235,0.8)';
  const textNormal = darkMode ? '#d1d5db' : '#374151';
  const textHover = darkMode ? 'rgba(55,65,81,0.5)' : 'rgba(243,244,246,0.8)';

  const items = nodeId ? [
    { icon: '✏️', label: 'Rename', action: () => { setEditingNode(nodeId); onClose(); } },
    { icon: '➕', label: 'Add Child', action: () => { addNode(nodeId); onClose(); } },
    { icon: '🎨', label: 'Change Color…', action: () => setSub('color') },
    ...(activeMode === 'tasks' ? [
      { icon: '📅', label: 'Set Deadline…', action: () => setSub('deadline') },
      { type: 'sep' },
      { icon: '✅', label: 'Mark Done', action: () => { updateNode(nodeId, { status: 'done' }); onClose(); } },
      { icon: '🔄', label: 'Mark In Progress', action: () => { updateNode(nodeId, { status: 'doing' }); onClose(); } },
      { icon: '⭕', label: 'Mark Todo', action: () => { updateNode(nodeId, { status: 'todo' }); onClose(); } },
      { icon: '🔴', label: 'Set Urgent', action: () => { updateNode(nodeId, { priority: 'urgent' }); onClose(); } },
    ] : []),
    ...(activeMode === 'planner' ? [
      { icon: '✅', label: 'Mark Complete', action: () => { updateNode(nodeId, { completed: true }); onClose(); } },
      { icon: '⭕', label: 'Mark Incomplete', action: () => { updateNode(nodeId, { completed: false }); onClose(); } },
    ] : []),
    { type: 'sep' },
    { icon: '🗑️', label: 'Delete', danger: true, action: () => { deleteNode(nodeId); onClose(); } },
  ] : [
    { icon: '➕', label: 'Add Root Node', action: () => { addNode(null); onClose(); } },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 rounded-xl shadow-2xl overflow-hidden animate-fade-in"
      style={{ left: ax, top: ay, background: bg, border: `1px solid ${border}`, minWidth: 190, backdropFilter: 'blur(16px)' }}
    >
      {node && (
        <div
          className="px-3 py-2.5 border-b flex items-center gap-2"
          style={{ borderColor: border, background: `${node.color}11` }}
        >
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: node.color }} />
          <span className="text-xs font-semibold truncate" style={{ color: node.color }}>{node.label}</span>
        </div>
      )}

      {sub === 'color' && (
        <div className="p-3">
          <div className="text-xs text-gray-400 mb-2">Choose color</div>
          <div className="grid grid-cols-5 gap-2">
            {DEFAULT_COLORS.map((c) => (
              <button
                key={c}
                className="w-8 h-8 rounded-full transition-transform hover:scale-110 active:scale-95"
                style={{
                  background: c,
                  outline: node?.color === c ? `2px solid ${c}` : 'none',
                  outlineOffset: 2,
                }}
                onClick={() => { if (nodeId) { updateNode(nodeId, { color: c }); onClose(); } }}
              />
            ))}
          </div>
        </div>
      )}

      {sub === 'deadline' && (
        <div className="p-3">
          <div className="text-xs text-gray-400 mb-2">Set deadline</div>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            autoFocus
            className="w-full rounded-lg px-2 py-1.5 text-sm outline-none"
            style={{
              background: darkMode ? 'rgba(30,32,44,0.9)' : 'rgba(249,250,251,0.9)',
              border: `1px solid ${darkMode ? 'rgba(75,85,99,0.5)' : 'rgba(209,213,219,0.6)'}`,
              color: darkMode ? '#f3f4f6' : '#111827',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && deadline && nodeId) {
                updateNode(nodeId, { deadline: new Date(deadline + 'T23:59:59').toISOString() });
                onClose();
              }
            }}
          />
          <button
            className="w-full mt-2 py-1.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            onClick={() => {
              if (deadline && nodeId) {
                updateNode(nodeId, { deadline: new Date(deadline + 'T23:59:59').toISOString() });
                onClose();
              }
            }}
          >
            Set Deadline
          </button>
        </div>
      )}

      {!sub && (
        <div className="py-1">
          {items.map((item, i) => {
            if ('type' in item && item.type === 'sep') {
              return <div key={i} className="my-1 h-px mx-2" style={{ background: border }} />;
            }
            return (
              <button
                key={i}
                onClick={'action' in item ? item.action : undefined}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors"
                style={{ color: 'danger' in item && item.danger ? '#f87171' : textNormal }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'danger' in item && item.danger ? 'rgba(239,68,68,0.1)' : textHover;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
