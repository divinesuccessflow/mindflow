export type NodeStatus = 'todo' | 'doing' | 'done';
export type NodePriority = 'urgent' | 'high' | 'normal' | 'low';
export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'someday';
export type AppMode = 'tasks' | 'braindump' | 'planner' | 'goals' | 'knowledge';

export interface Position {
  x: number;
  y: number;
}

export interface MindNode {
  id: string;
  parentId: string | null;
  label: string;
  color: string;
  position: Position;
  collapsed: boolean;
  // Task/Project fields
  status?: NodeStatus;
  priority?: NodePriority;
  deadline?: string;
  // Planner fields
  estimatedTime?: number;
  timeSlot?: TimeSlot;
  completed?: boolean;
  // Goal tracker fields
  targetValue?: number;
  currentValue?: number;
  // Knowledge base fields
  notes?: string;
  tags?: string[];
  // Brain dump
  isDumped?: boolean;
  // Metadata
  createdAt: string;
  updatedAt: string;
  isRoot?: boolean;
}

export interface ModeData {
  nodes: MindNode[];
}

export interface AppSettings {
  darkMode: boolean;
  workspaceName: string;
  autoSave: boolean;
}

export interface MindFlowData {
  tasks: ModeData;
  braindump: ModeData;
  planner: ModeData;
  goals: ModeData;
  knowledge: ModeData;
  settings: AppSettings;
  recentNodeIds: string[];
  version: string;
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  nodeId: string | null;
}

export const DEFAULT_COLORS = [
  '#6366f1',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#84cc16',
];

export const PRIORITY_COLORS: Record<NodePriority, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  normal: '#6366f1',
  low: '#6b7280',
};

export const STATUS_COLORS: Record<NodeStatus, string> = {
  todo: '#6b7280',
  doing: '#f59e0b',
  done: '#10b981',
};
