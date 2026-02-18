'use client';

import { useEffect } from 'react';
import { useMindFlowStore } from '@/lib/store';
import { AppMode } from '@/lib/types';

export default function KeyboardShortcuts() {
  const { selectedNodeId, addNode, deleteNode, setActiveMode, getNodeById, setEditingNode } = useMindFlowStore();

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable;

      // Ctrl+F: search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
        input?.focus();
        return;
      }

      if (inInput) return;

      // Mode switch: 1–5
      const modes: Record<string, AppMode> = { '1': 'tasks', '2': 'braindump', '3': 'planner', '4': 'goals', '5': 'knowledge' };
      if (modes[e.key] && !e.ctrlKey && !e.metaKey) {
        setActiveMode(modes[e.key]);
        return;
      }

      if (!selectedNodeId) return;
      const node = getNodeById(selectedNodeId);
      if (!node) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        addNode(selectedNodeId);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        addNode(node.parentId);
      } else if (e.key === 'Delete' || (e.key === 'Backspace' && e.metaKey)) {
        if (!node.isRoot) deleteNode(selectedNodeId);
      } else if (e.key === 'F2' || e.key === 'e') {
        e.preventDefault();
        setEditingNode(selectedNodeId);
      }
    };

    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [selectedNodeId, addNode, deleteNode, setActiveMode, getNodeById, setEditingNode]);

  return null;
}
