'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useMindFlowStore } from '@/lib/store';
import { MindNode } from '@/lib/types';
import { isOverdue, formatDeadline, getProgressPercent } from '@/lib/utils';

interface Props {
  node: MindNode;
  isSelected: boolean;
  isHighlighted: boolean;
  transform: { x: number; y: number; scale: number };
}

export default function MindMapNode({ node, isSelected, isHighlighted, transform }: Props) {
  const {
    setSelectedNode,
    editingNodeId,
    setEditingNode,
    updateNode,
    addNode,
    setContextMenu,
    activeMode,
    getChildren,
    data,
  } = useMindFlowStore();

  const [editValue, setEditValue] = useState(node.label);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditing = editingNodeId === node.id;
  const darkMode = data.settings.darkMode;

  const children = getChildren(node.id);
  const hasChildren = children.length > 0;
  const overdue = isOverdue(node.deadline) && node.status !== 'done';
  const progress = node.targetValue ? getProgressPercent(node.currentValue || 0, node.targetValue) : null;

  useEffect(() => {
    setEditValue(node.label);
  }, [node.label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isEditing) return;
      e.stopPropagation();
      setSelectedNode(node.id);

      const startX = e.clientX;
      const startY = e.clientY;
      const origX = node.position.x;
      const origY = node.position.y;
      let moved = false;

      const onMove = (me: MouseEvent) => {
        const dx = (me.clientX - startX) / transform.scale;
        const dy = (me.clientY - startY) / transform.scale;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          moved = true;
          updateNode(node.id, { position: { x: origX + dx, y: origY + dy } });
        }
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [isEditing, node.id, node.position, transform.scale, setSelectedNode, updateNode]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingNode(node.id);
      setEditValue(node.label);
    },
    [node.id, node.label, setEditingNode]
  );

  const handleEditSubmit = useCallback(() => {
    if (editValue.trim()) updateNode(node.id, { label: editValue.trim() });
    setEditingNode(null);
  }, [editValue, node.id, updateNode, setEditingNode]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleEditSubmit();
      if (e.key === 'Escape') { setEditValue(node.label); setEditingNode(null); }
    },
    [handleEditSubmit, node.label, setEditingNode]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ visible: true, x: e.clientX, y: e.clientY, nodeId: node.id });
    },
    [node.id, setContextMenu]
  );

  const borderColor = isSelected
    ? node.color
    : isHighlighted
    ? '#f59e0b'
    : overdue
    ? '#ef4444'
    : node.status === 'done'
    ? '#10b981'
    : `${node.color}55`;

  const nodeScale = activeMode === 'goals' && progress !== null
    ? 1 + (progress / 100) * 0.3
    : 1;

  return (
    <div
      className="absolute flex flex-col items-center justify-center rounded-2xl cursor-pointer group transition-all duration-200"
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: `translate(-50%, -50%) scale(${nodeScale})`,
        transformOrigin: 'center',
        background: node.isRoot
          ? `linear-gradient(135deg, ${node.color}33, ${node.color}18)`
          : darkMode ? 'rgba(22, 25, 38, 0.96)' : 'rgba(255,255,255,0.96)',
        border: `2px solid ${borderColor}`,
        boxShadow: isSelected
          ? `0 0 0 3px ${node.color}44, 0 12px 40px ${node.color}22, 0 4px 16px rgba(0,0,0,0.4)`
          : `0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)`,
        backdropFilter: 'blur(12px)',
        padding: '10px 16px',
        minWidth: node.isRoot ? 160 : 130,
        zIndex: isSelected ? 20 : 10,
        willChange: 'transform',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Status dot */}
      {node.status && (
        <div
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center"
          style={{
            background: node.status === 'done' ? '#10b981' : node.status === 'doing' ? '#f59e0b' : '#6b7280',
            borderColor: darkMode ? '#0d0f17' : '#fff',
          }}
        >
          {node.status === 'done' && <span className="text-[7px] text-white font-bold">✓</span>}
        </div>
      )}

      {/* Urgent badge */}
      {node.priority === 'urgent' && node.status !== 'done' && (
        <div
          className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center"
          style={{ background: '#ef4444', borderColor: darkMode ? '#0d0f17' : '#fff' }}
        >
          <span className="text-[7px] text-white font-bold">!</span>
        </div>
      )}

      {/* Completed check (planner) */}
      {node.completed === true && (
        <div
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center"
          style={{ background: '#10b981', borderColor: darkMode ? '#0d0f17' : '#fff' }}
        >
          <span className="text-[9px] text-white">✓</span>
        </div>
      )}

      {/* Label */}
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleEditSubmit}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none text-center font-medium w-full text-sm"
          style={{ color: node.isRoot ? node.color : darkMode ? '#f3f4f6' : '#111827', minWidth: 80 }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          className="text-center font-medium leading-tight"
          style={{
            color: node.isRoot ? node.color : darkMode ? '#f3f4f6' : '#111827',
            fontSize: node.isRoot ? '0.95rem' : '0.82rem',
            fontWeight: node.isRoot ? 700 : 500,
            textDecoration: node.status === 'done' ? 'line-through' : 'none',
            opacity: node.status === 'done' ? 0.6 : 1,
          }}
        >
          {node.label}
        </div>
      )}

      {/* Goal progress bar */}
      {activeMode === 'goals' && node.targetValue && progress !== null && (
        <div className="w-full mt-2">
          <div className="flex justify-between mb-1" style={{ color: node.color, fontSize: 9 }}>
            <span>{(node.currentValue || 0).toLocaleString()}</span>
            <span>{node.targetValue.toLocaleString()}</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: darkMode ? 'rgba(75,85,99,0.4)' : 'rgba(229,231,235,0.6)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${node.color}, ${node.color}cc)`,
                boxShadow: `0 0 6px ${node.color}99`,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
          <div className="text-center mt-0.5" style={{ fontSize: 9, color: node.color }}>{progress}%</div>
        </div>
      )}

      {/* Deadline */}
      {node.deadline && node.status !== 'done' && (
        <div
          className="text-center mt-1 font-medium"
          style={{ fontSize: 10, color: overdue ? '#f87171' : '#9ca3af' }}
        >
          {formatDeadline(node.deadline)}
        </div>
      )}

      {/* Estimated time (planner) */}
      {activeMode === 'planner' && node.estimatedTime && (
        <div className="text-center mt-0.5" style={{ fontSize: 10, color: '#9ca3af' }}>
          {node.estimatedTime}min
        </div>
      )}

      {/* Tags (knowledge) */}
      {activeMode === 'knowledge' && node.tags && node.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center mt-1.5">
          {node.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded-full" style={{ fontSize: 9, background: `${node.color}22`, color: node.color }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Notes indicator (knowledge) */}
      {activeMode === 'knowledge' && node.notes && (
        <div className="mt-1" style={{ fontSize: 9, color: '#6b7280' }}>📝 Has notes</div>
      )}

      {/* Collapse toggle */}
      {hasChildren && (
        <button
          className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 z-30 text-xs font-bold border-2"
          style={{
            background: node.color,
            borderColor: darkMode ? '#0d0f17' : '#fff',
            boxShadow: `0 2px 8px ${node.color}66`,
          }}
          onClick={(e) => { e.stopPropagation(); updateNode(node.id, { collapsed: !node.collapsed }); }}
        >
          {node.collapsed ? '+' : '−'}
        </button>
      )}

      {/* Add child button on hover */}
      {isSelected && (
        <button
          className="absolute -right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center transition-all hover:scale-110 z-30 text-sm opacity-80 hover:opacity-100"
          style={{
            borderColor: node.color,
            color: node.color,
            background: darkMode ? '#0d0f17' : '#fff',
          }}
          onClick={(e) => { e.stopPropagation(); addNode(node.id); }}
          title="Add child (Tab)"
        >
          +
        </button>
      )}
    </div>
  );
}
