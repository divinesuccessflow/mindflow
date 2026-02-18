'use client';

import React, { useState, useCallback } from 'react';
import { useMindFlowStore } from '@/lib/store';
import { autoOrganize } from '@/lib/utils';

export default function BrainDumpPanel() {
  const { data, addNode, updateNode, getNodes } = useMindFlowStore();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const darkMode = data.settings.darkMode;
  const nodes = getNodes();
  const dumpedCount = nodes.filter((n) => !n.parentId).length;

  const handleDump = useCallback(() => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    setBusy(true);
    lines.forEach((line, i) => {
      setTimeout(() => {
        addNode(null, {
          label: line,
          isDumped: true,
          color: '#6b7280',
          position: {
            x: (Math.random() - 0.5) * 700,
            y: (Math.random() - 0.5) * 500,
          },
        });
      }, i * 80);
    });
    setTimeout(() => { setBusy(false); setText(''); }, lines.length * 80 + 300);
  }, [text, addNode]);

  const handleAutoOrganize = useCallback(() => {
    const dumped = nodes.filter((n) => !n.parentId && n.isDumped);
    const organized = autoOrganize(dumped);
    const groups: Record<string, typeof organized> = {};
    organized.forEach((n) => { (groups[n.color] = groups[n.color] || []).push(n); });

    Object.entries(groups).forEach(([, group], gi) => {
      const angle = (gi / Object.keys(groups).length) * Math.PI * 2;
      const r = 320;
      const cx = Math.cos(angle) * r;
      const cy = Math.sin(angle) * r;
      group.forEach((node, ni) => {
        const spread = (ni / (group.length || 1) - 0.5) * 160;
        updateNode(node.id, {
          color: node.color,
          position: { x: cx + spread, y: cy + Math.sin(ni) * 80 },
        });
      });
    });
  }, [nodes, updateNode]);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4" style={{ pointerEvents: 'none' }}>
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: darkMode ? 'rgba(10,12,20,0.96)' : 'rgba(255,255,255,0.96)',
          border: `1px solid ${darkMode ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.15)'}`,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          pointerEvents: 'all',
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
            borderBottom: `1px solid ${darkMode ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)'}`,
          }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'rgba(99,102,241,0.15)' }}
          >
            🧠
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: '#818cf8' }}>Brain Dump</div>
            <div className="text-xs" style={{ color: darkMode ? '#4b5563' : '#9ca3af' }}>
              Empty your mind. Organize later.
            </div>
          </div>
          {dumpedCount > 0 && (
            <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs font-semibold" style={{ color: '#818cf8' }}>{dumpedCount} on canvas</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <textarea
            placeholder={"Write whatever's on your mind...\n• One thought per line\n• Press Shift+Enter to dump\n• Don't filter, just write!"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); handleDump(); } }}
            rows={4}
            className="w-full resize-none rounded-xl p-3 text-sm outline-none"
            style={{
              background: darkMode ? 'rgba(22,25,38,0.9)' : 'rgba(249,250,251,0.9)',
              border: `1px solid ${darkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}`,
              color: darkMode ? '#e5e7eb' : '#111827',
              lineHeight: 1.7,
            }}
          />

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleDump}
              disabled={!text.trim() || busy}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
              }}
            >
              {busy ? '✨ Dumping...' : '→ Dump It (Shift+Enter)'}
            </button>
            <button
              onClick={handleAutoOrganize}
              disabled={dumpedCount === 0}
              className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80 active:scale-95 disabled:opacity-30"
              style={{
                background: darkMode ? 'rgba(22,25,38,0.9)' : 'rgba(243,244,246,0.9)',
                border: `1px solid ${darkMode ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)'}`,
                color: '#818cf8',
              }}
            >
              🤖 Auto-Group
            </button>
          </div>
        </div>

        <div
          className="px-4 pb-3 flex items-center gap-4 text-[11px]"
          style={{ borderTop: `1px solid ${darkMode ? 'rgba(75,85,99,0.15)' : 'rgba(229,231,235,0.5)'}`, paddingTop: 10, color: darkMode ? '#4b5563' : '#9ca3af' }}
        >
          <span>💡 Each line = 1 node</span>
          <span>🎯 Drag to organize</span>
          <span>🤖 Auto-groups by topic</span>
        </div>
      </div>
    </div>
  );
}
