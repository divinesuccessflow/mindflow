import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  MindFlowData,
  MindNode,
  AppMode,
  AppSettings,
  ContextMenuState,
  DEFAULT_COLORS,
} from './types';

const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createNode = (overrides: Partial<MindNode> & { label: string; color: string }): MindNode => ({
  id: generateId(),
  parentId: null,
  position: { x: 0, y: 0 },
  collapsed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const getDefaultData = (): MindFlowData => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Tasks mode
  const tasksRoot = createNode({ label: 'My Workspace', color: '#6366f1', isRoot: true });
  const p1 = createNode({ label: 'Design System', color: '#ec4899', parentId: tasksRoot.id, position: { x: 320, y: -160 } });
  const p2 = createNode({ label: 'Backend API', color: '#10b981', parentId: tasksRoot.id, position: { x: 320, y: 160 } });
  const t1 = createNode({ label: 'Create color palette', color: '#ec4899', parentId: p1.id, position: { x: 620, y: -260 }, status: 'done' as const, priority: 'normal' as const });
  const t2 = createNode({ label: 'Design components', color: '#ec4899', parentId: p1.id, position: { x: 620, y: -160 }, status: 'doing' as const, priority: 'high' as const });
  const t3 = createNode({ label: 'Build auth endpoints', color: '#10b981', parentId: p2.id, position: { x: 620, y: 100 }, status: 'todo' as const, priority: 'urgent' as const, deadline: new Date(Date.now() - 86400000).toISOString() });
  const t4 = createNode({ label: 'Database schema', color: '#10b981', parentId: p2.id, position: { x: 620, y: 200 }, status: 'doing' as const, priority: 'high' as const });

  // Planner mode
  const planRoot = createNode({ label: today, color: '#f59e0b', isRoot: true });
  const morning = createNode({ label: 'Morning', color: '#f59e0b', parentId: planRoot.id, position: { x: -220, y: -200 } });
  const afternoon = createNode({ label: 'Afternoon', color: '#3b82f6', parentId: planRoot.id, position: { x: 220, y: -200 } });
  const evening = createNode({ label: 'Evening', color: '#8b5cf6', parentId: planRoot.id, position: { x: 220, y: 200 } });
  const someday = createNode({ label: 'Someday', color: '#6b7280', parentId: planRoot.id, position: { x: -220, y: 200 } });
  const pm1 = createNode({ label: 'Review PRs', color: '#f59e0b', parentId: morning.id, position: { x: -420, y: -280 }, estimatedTime: 30, completed: false });
  const pm2 = createNode({ label: 'Team standup', color: '#f59e0b', parentId: morning.id, position: { x: -420, y: -180 }, estimatedTime: 15, completed: true });

  // Goals mode
  const goalsRoot = createNode({ label: '2024 Goals', color: '#6366f1', isRoot: true });
  const g1 = createNode({ label: 'Revenue', color: '#10b981', parentId: goalsRoot.id, position: { x: 300, y: -200 }, targetValue: 100000, currentValue: 67000 });
  const g2 = createNode({ label: 'Fitness', color: '#ec4899', parentId: goalsRoot.id, position: { x: -300, y: -200 }, targetValue: 50, currentValue: 32 });
  const g3 = createNode({ label: 'Learning', color: '#f59e0b', parentId: goalsRoot.id, position: { x: 0, y: 280 }, targetValue: 24, currentValue: 18 });
  const g1a = createNode({ label: 'Q3: $42K', color: '#10b981', parentId: g1.id, position: { x: 540, y: -260 }, targetValue: 42000, currentValue: 42000 });
  const g1b = createNode({ label: 'Q4: $33K', color: '#10b981', parentId: g1.id, position: { x: 540, y: -160 }, targetValue: 33000, currentValue: 25000 });

  // Knowledge mode
  const knowledgeRoot = createNode({ label: 'My Knowledge', color: '#06b6d4', isRoot: true });
  const k1 = createNode({ label: 'Development', color: '#3b82f6', parentId: knowledgeRoot.id, position: { x: 300, y: -200 } });
  const k2 = createNode({ label: 'Product', color: '#ec4899', parentId: knowledgeRoot.id, position: { x: -300, y: -200 } });
  const k3 = createNode({ label: 'Business', color: '#10b981', parentId: knowledgeRoot.id, position: { x: 0, y: 280 } });
  const kn1 = createNode({ label: 'React Patterns', color: '#3b82f6', parentId: k1.id, position: { x: 560, y: -280 }, notes: 'Key React patterns: compound components, render props, custom hooks. Use composition over inheritance. Prefer controlled components for forms.', tags: ['react', 'frontend'] });
  const kn2 = createNode({ label: 'System Design', color: '#3b82f6', parentId: k1.id, position: { x: 560, y: -160 }, notes: 'CAP theorem, distributed systems, load balancing. Design for failure. Use caching layers. Horizontal scaling preferred.', tags: ['architecture', 'backend'] });

  return {
    tasks: { nodes: [tasksRoot, p1, p2, t1, t2, t3, t4] },
    braindump: { nodes: [] },
    planner: { nodes: [planRoot, morning, afternoon, evening, someday, pm1, pm2] },
    goals: { nodes: [goalsRoot, g1, g2, g3, g1a, g1b] },
    knowledge: { nodes: [knowledgeRoot, k1, k2, k3, kn1, kn2] },
    settings: {
      darkMode: true,
      workspaceName: 'My Workspace',
      autoSave: true,
    },
    recentNodeIds: [],
    version: '1.0.0',
  };
};

interface FilterState {
  showOverdue: boolean;
  showUrgent: boolean;
  projectId: string | null;
}

interface MindFlowStore {
  data: MindFlowData;
  activeMode: AppMode;
  selectedNodeId: string | null;
  editingNodeId: string | null;
  searchQuery: string;
  contextMenu: ContextMenuState;
  sidebarOpen: boolean;
  filterState: FilterState;

  setActiveMode: (mode: AppMode) => void;
  addNode: (parentId: string | null, overrides?: Partial<MindNode>) => string;
  updateNode: (id: string, updates: Partial<MindNode>) => void;
  deleteNode: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  setEditingNode: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  setContextMenu: (menu: ContextMenuState) => void;
  toggleSidebar: () => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  toggleDarkMode: () => void;
  setFilter: (filter: Partial<FilterState>) => void;
  exportData: () => void;
  importData: (data: MindFlowData) => void;
  addRecentNode: (id: string) => void;
  getNodes: () => MindNode[];
  getNodeById: (id: string) => MindNode | undefined;
  getChildren: (parentId: string) => MindNode[];
}

export const useMindFlowStore = create<MindFlowStore>()(
  persist(
    (set, get) => ({
      data: getDefaultData(),
      activeMode: 'tasks',
      selectedNodeId: null,
      editingNodeId: null,
      searchQuery: '',
      contextMenu: { visible: false, x: 0, y: 0, nodeId: null },
      sidebarOpen: true,
      filterState: { showOverdue: false, showUrgent: false, projectId: null },

      setActiveMode: (mode) => set({ activeMode: mode, selectedNodeId: null, editingNodeId: null }),

      addNode: (parentId, overrides = {}) => {
        const id = generateId();
        const mode = get().activeMode;
        const nodes = get().data[mode].nodes;
        const parent = parentId ? nodes.find((n) => n.id === parentId) : null;
        const color = overrides.color || parent?.color || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
        const siblings = nodes.filter((n) => n.parentId === parentId);
        const parentPos = parent?.position || { x: 0, y: 0 };
        const spread = siblings.length;

        const newNode: MindNode = {
          id,
          parentId,
          label: 'New Node',
          color,
          position: overrides.position || {
            x: parentPos.x + (parentId ? 240 : 0),
            y: parentPos.y + (spread * 80 - spread * 40),
          },
          collapsed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...overrides,
        };

        set((state) => ({
          data: {
            ...state.data,
            [mode]: { nodes: [...state.data[mode].nodes, newNode] },
          },
          selectedNodeId: id,
          editingNodeId: id,
        }));

        get().addRecentNode(id);
        return id;
      },

      updateNode: (id, updates) => {
        const mode = get().activeMode;
        set((state) => ({
          data: {
            ...state.data,
            [mode]: {
              nodes: state.data[mode].nodes.map((n) =>
                n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
              ),
            },
          },
        }));
      },

      deleteNode: (id) => {
        const mode = get().activeMode;
        const getAllDescIds = (nodeId: string, nodes: MindNode[]): string[] => {
          const children = nodes.filter((n) => n.parentId === nodeId);
          return [nodeId, ...children.flatMap((c) => getAllDescIds(c.id, nodes))];
        };

        set((state) => {
          const ids = getAllDescIds(id, state.data[mode].nodes);
          return {
            data: {
              ...state.data,
              [mode]: { nodes: state.data[mode].nodes.filter((n) => !ids.includes(n.id)) },
            },
            selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
          };
        });
      },

      setSelectedNode: (id) => set({ selectedNodeId: id }),
      setEditingNode: (id) => set({ editingNodeId: id }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setContextMenu: (menu) => set({ contextMenu: menu }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      updateSettings: (updates) =>
        set((state) => ({
          data: { ...state.data, settings: { ...state.data.settings, ...updates } },
        })),

      toggleDarkMode: () =>
        set((state) => ({
          data: { ...state.data, settings: { ...state.data.settings, darkMode: !state.data.settings.darkMode } },
        })),

      setFilter: (filter) =>
        set((state) => ({ filterState: { ...state.filterState, ...filter } })),

      exportData: () => {
        const json = JSON.stringify(get().data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mindflow-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },

      importData: (data) => set({ data }),

      addRecentNode: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            recentNodeIds: [id, ...state.data.recentNodeIds.filter((i) => i !== id)].slice(0, 10),
          },
        })),

      getNodes: () => get().data[get().activeMode].nodes,

      getNodeById: (id) => {
        const allModes: AppMode[] = ['tasks', 'braindump', 'planner', 'goals', 'knowledge'];
        for (const mode of allModes) {
          const node = get().data[mode].nodes.find((n) => n.id === id);
          if (node) return node;
        }
        return undefined;
      },

      getChildren: (parentId) => get().getNodes().filter((n) => n.parentId === parentId),
    }),
    {
      name: 'mindflow-data',
      version: 1,
    }
  )
);
