'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMindFlowStore } from '@/lib/store';
import { MindNode } from '@/lib/types';
import { isOverdue } from '@/lib/utils';
import MindMapNode from './MindMapNode';
import ContextMenu from './ContextMenu';

interface Transform {
  x: number;
  y: number;
  scale: number;
}

export default function MindMapCanvas() {
  const {
    getNodes,
    activeMode,
    selectedNodeId,
    setSelectedNode,
    contextMenu,
    setContextMenu,
    searchQuery,
    data,
    filterState,
    addNode,
  } = useMindFlowStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>(() => ({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 700,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
    scale: 1,
  }));
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });
  const touchDist = useRef(0);

  const nodes = getNodes();

  // Center view when mode changes
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    setTransform({ x: w / 2, y: h / 2, scale: 1 });
  }, [activeMode]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target === canvasRef.current || target.dataset.canvas) {
        isPanning.current = true;
        lastPan.current = { x: e.clientX, y: e.clientY };
        setSelectedNode(null);
        setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
      }
    },
    [setSelectedNode, setContextMenu]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPan.current.x;
    const dy = e.clientY - lastPan.current.y;
    lastPan.current = { x: e.clientX, y: e.clientY };
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setTransform((t) => {
      const ns = Math.max(0.15, Math.min(3, t.scale * factor));
      const ratio = ns / t.scale;
      return { x: mx - (mx - t.x) * ratio, y: my - (my - t.y) * ratio, scale: ns };
    });
  }, []);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target === canvasRef.current || target.dataset.canvas) {
        e.preventDefault();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, nodeId: null });
      }
    },
    [setContextMenu]
  );

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDist.current = Math.hypot(dx, dy);
    } else {
      isPanning.current = true;
      lastPan.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const ratio = newDist / touchDist.current;
      touchDist.current = newDist;
      const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      setTransform((t) => {
        const ns = Math.max(0.15, Math.min(3, t.scale * ratio));
        const r = ns / t.scale;
        return { x: mx - (mx - t.x) * r, y: my - (my - t.y) * r, scale: ns };
      });
    } else if (isPanning.current) {
      const dx = e.touches[0].clientX - lastPan.current.x;
      const dy = e.touches[0].clientY - lastPan.current.y;
      lastPan.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isPanning.current = false;
  }, []);

  // Filter logic
  const filteredNodes = React.useMemo(() => {
    if (activeMode !== 'tasks') return nodes;
    const { showOverdue, showUrgent, projectId } = filterState;
    if (!showOverdue && !showUrgent && !projectId) return nodes;

    return nodes.filter((node) => {
      if (node.isRoot) return true;
      if (!node.parentId) return true; // project-level always show

      if (showOverdue && !isOverdue(node.deadline)) return false;
      if (showUrgent && node.priority !== 'urgent') return false;
      return true;
    });
  }, [nodes, activeMode, filterState]);

  // Render SVG edges
  const renderEdges = () => {
    const edges: JSX.Element[] = [];
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    for (const node of filteredNodes) {
      if (!node.parentId) continue;
      const parent = nodeMap.get(node.parentId);
      if (!parent || parent.collapsed) continue;

      const x1 = parent.position.x;
      const y1 = parent.position.y;
      const x2 = node.position.x;
      const y2 = node.position.y;
      const midX = (x1 + x2) / 2;
      const d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

      const highlighted = !!searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());
      const od = isOverdue(node.deadline) && node.status !== 'done';
      const stroke = highlighted ? '#f59e0b' : od ? '#ef4444' : node.color;
      const isSelected = selectedNodeId === node.id;

      edges.push(
        <path
          key={`e-${node.id}`}
          d={d}
          stroke={stroke}
          strokeWidth={isSelected ? 3 : 2}
          strokeOpacity={isSelected ? 0.9 : 0.5}
          fill="none"
          strokeLinecap="round"
          style={{
            filter: isSelected ? `drop-shadow(0 0 4px ${stroke})` : 'none',
            transition: 'all 0.2s ease',
          }}
        />
      );
    }
    return edges;
  };

  const darkMode = data.settings.darkMode;

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden"
      style={{ cursor: isPanning.current ? 'grabbing' : 'grab', userSelect: 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      data-canvas="true"
    >
      {/* Dot-grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        data-canvas="true"
        style={{
          backgroundImage: `radial-gradient(circle, ${darkMode ? '#2d3148' : '#c7d2fe'} 1.5px, transparent 1.5px)`,
          backgroundSize: `${32 * transform.scale}px ${32 * transform.scale}px`,
          backgroundPosition: `${transform.x % (32 * transform.scale)}px ${transform.y % (32 * transform.scale)}px`,
          opacity: 0.4,
        }}
      />

      {/* Canvas transform layer */}
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
          position: 'absolute',
          inset: 0,
          width: 1,
          height: 1,
        }}
      >
        {/* Edges SVG */}
        <svg
          style={{
            position: 'absolute',
            left: -8000,
            top: -8000,
            width: 16000,
            height: 16000,
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          {renderEdges()}
        </svg>

        {/* Nodes */}
        {filteredNodes
          .filter((n) => {
            // Hide children of collapsed parents
            if (!n.parentId) return true;
            const checkCollapsed = (nodeId: string): boolean => {
              const parent = nodes.find((x) => x.id === nodeId);
              if (!parent) return false;
              if (parent.collapsed) return true;
              if (parent.parentId) return checkCollapsed(parent.parentId);
              return false;
            };
            return !checkCollapsed(n.parentId);
          })
          .map((node) => (
            <MindMapNode
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              isHighlighted={!!searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase())}
              transform={transform}
            />
          ))}
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
        {[
          { label: '+', action: () => setTransform((t) => ({ ...t, scale: Math.min(3, t.scale * 1.25) })) },
          { label: '−', action: () => setTransform((t) => ({ ...t, scale: Math.max(0.15, t.scale * 0.8) })) },
          {
            label: '⌂',
            action: () => setTransform({ x: window.innerWidth / 2, y: window.innerHeight / 2, scale: 1 }),
          },
        ].map(({ label, action }) => (
          <button
            key={label}
            onClick={action}
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base transition-all hover:scale-105 active:scale-95 shadow-lg"
            style={{
              background: darkMode ? 'rgba(22,25,38,0.9)' : 'rgba(255,255,255,0.9)',
              border: `1px solid ${darkMode ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)'}`,
              color: darkMode ? '#818cf8' : '#6366f1',
              backdropFilter: 'blur(8px)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Scale badge */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs z-10"
        style={{
          background: darkMode ? 'rgba(22,25,38,0.8)' : 'rgba(255,255,255,0.8)',
          border: `1px solid ${darkMode ? 'rgba(75,85,99,0.3)' : 'rgba(229,231,235,0.5)'}`,
          color: darkMode ? '#6b7280' : '#9ca3af',
          backdropFilter: 'blur(8px)',
        }}
      >
        {Math.round(transform.scale * 100)}%
      </div>

      {/* Context menu */}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          onClose={() => setContextMenu({ visible: false, x: 0, y: 0, nodeId: null })}
        />
      )}
    </div>
  );
}
