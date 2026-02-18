'use client';

import React, { useState, useEffect } from 'react';
import { useMindFlowStore } from '@/lib/store';

export default function KnowledgePanel() {
  const { selectedNodeId, data, updateNode, getNodeById, activeMode } = useMindFlowStore();
  const darkMode = data.settings.darkMode;
  const node = selectedNodeId ? getNodeById(selectedNodeId) : null;

  const [noteText, setNoteText] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    setNoteText(node?.notes || '');
  }, [node?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!node || activeMode !== 'knowledge' || node.isRoot) return null;

  const addTag = (tag: string) => {
    const trimmed = tag.trim().replace(/^#/, '');
    if (!trimmed) return;
    const existing = node.tags || [];
    const tags = existing.includes(trimmed) ? existing : [...existing, trimmed];
    updateNode(node.id, { tags });
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    updateNode(node.id, { tags: (node.tags || []).filter((t) => t !== tag) });
  };

  return (
    <div className="absolute right-4 top-4 z-20 w-72" style={{ pointerEvents: 'all' }}>
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: darkMode ? 'rgba(10,12,20,0.97)' : 'rgba(255,255,255,0.97)',
          border: `2px solid ${node.color}44`,
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ background: `${node.color}15`, borderBottom: `1px solid ${node.color}22` }}
        >
          <span className="text-base">📝</span>
          <div className="font-bold text-sm truncate" style={{ color: node.color }}>{node.label}</div>
        </div>

        <div className="p-4 space-y-4">
          {/* Notes editor */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Notes</label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onBlur={() => updateNode(node.id, { notes: noteText })}
              placeholder="Write your notes here..."
              rows={6}
              className="w-full resize-none rounded-xl p-3 text-sm outline-none"
              style={{
                background: darkMode ? 'rgba(22,25,38,0.9)' : 'rgba(249,250,251,0.9)',
                border: `1px solid ${node.color}33`,
                color: darkMode ? '#e5e7eb' : '#111827',
                lineHeight: 1.6,
              }}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2 min-h-[24px]">
              {(node.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: `${node.color}22`, color: node.color }}
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="leading-none opacity-60 hover:opacity-100 transition-opacity font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tag (Enter)…"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addTag(tagInput);
                }
              }}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none"
              style={{
                background: darkMode ? 'rgba(22,25,38,0.9)' : 'rgba(249,250,251,0.9)',
                border: `1px solid ${darkMode ? 'rgba(75,85,99,0.3)' : 'rgba(209,213,219,0.5)'}`,
                color: darkMode ? '#e5e7eb' : '#111827',
              }}
            />
          </div>

          <button
            onClick={() => updateNode(node.id, { notes: noteText })}
            className="w-full py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${node.color}, ${node.color}cc)`,
              boxShadow: `0 4px 12px ${node.color}44`,
            }}
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}
