# MindFlow — Productivity Mindmap

A beautiful, production-grade productivity mindmap web application built with Next.js 14, TypeScript, Tailwind CSS, and Zustand.

## Features

### 🧠 5 Powerful Modes

1. **Task/Project Board** (✓)
   - Workspace-centered mindmap with color-coded projects
   - Tasks with status (todo/doing/done), priority (urgent/high/normal/low), deadlines
   - Visual indicators: green checkmark (done), yellow (in-progress), red border (overdue)
   - Filters: show overdue, show urgent, filter by project

2. **Brain Dump** (🧠)
   - Rapid-capture text input: dump everything on your mind
   - Each line becomes a floating node
   - Auto-organize by topic using keyword matching
   - Drag nodes onto branches to organize

3. **Daily Planner** (📅)
   - Today's date as center node
   - 4 time-based branches: Morning, Afternoon, Evening, Someday
   - Estimated time per task
   - Real-time progress ring showing % tasks done
   - Drag-and-drop between time slots

4. **Goal Tracker** (🎯)
   - Big goal with target number as center
   - Sub-goals/streams as branches
   - Each node tracks current vs target value
   - Progress bars and visual node scaling
   - Milestone markers

5. **Knowledge Base** (📚)
   - "My Knowledge" as center
   - Topics/categories as branches
   - Notes nodes with full text editor
   - Tags for cross-referencing
   - Search highlighting

### 🎨 Interactive Mindmap Engine

- **Pan & Zoom**: Smooth mouse/touch-based navigation
- **Drag & Drop**: Move nodes freely; branches connect automatically
- **Color Coding**: 10 distinct node colors per category
- **Collapse/Expand**: Toggle branches with single click
- **Double-Click Edit**: Edit node text in-place
- **Right-Click Menu**: Add child, delete, change color, set deadline, mark complete
- **Bezier Curves**: Beautiful smooth connecting lines between nodes

### 🎯 UI/UX

- **Dark Mode Default**: Beautiful dark theme with light mode toggle
- **Sidebar**: Mode switcher, quick add input, global search (Ctrl+F), recent nodes, task filters & stats
- **Top Bar**: MindFlow branding, mode tabs, export/import JSON, dark/light toggle
- **Node Detail Panels**: Context-sensitive panels for editing task details, goal progress, notes, etc.
- **Task List Panel**: Compact task list with status toggle for Tasks mode
- **Auto-Save Indicator**: Shows save status in bottom-left
- **Mode Badge**: Current mode indicator in top-left
- **Responsive Design**: Touch-friendly on mobile, optimized desktop experience

### ⌨️ Keyboard Shortcuts

- **1-5**: Switch between modes (tasks, braindump, planner, goals, knowledge)
- **Tab**: Add child node (when node selected)
- **Enter**: Add sibling node
- **Delete/Cmd+Backspace**: Remove node
- **Double-click or F2**: Edit node label
- **Ctrl+F / Cmd+F**: Global search/highlight
- **Esc**: Cancel editing

### 💾 Data & Persistence

- **localStorage**: All data saved to `mindflow-data` key
- **Auto-Save**: Every 5 seconds (debounced)
- **Export**: Download all data as JSON file
- **Import**: Load data from JSON file
- **No Backend Required**: Pure client-side, no server needed
- **Zustand Persist Middleware**: Automatic localStorage sync

### 🎭 Beautiful Polish

- Smooth fade-in animations for UI elements
- Color gradients on primary buttons
- Glowing shadows on selected nodes
- Hover effects on interactive elements
- Modal-like overlays with backdrop blur
- Animated progress rings and bars
- Responsive grid backgrounds
- Dark/light mode with proper contrast

## Installation & Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# Server runs on http://localhost:3000

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
mindmap-app/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main app component
│   └── globals.css         # Global styles & animations
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx      # Mode tabs, export/import
│   │   └── Sidebar.tsx     # Mode switcher, search, stats
│   ├── mindmap/
│   │   ├── MindMapCanvas.tsx   # Main canvas with pan/zoom
│   │   ├── MindMapNode.tsx     # Individual node component
│   │   ├── NodeDetailPanel.tsx # Node editor panel
│   │   ├── ContextMenu.tsx     # Right-click menu
│   │   └── KeyboardShortcuts.tsx # Global keyboard handler
│   └── modes/
│       ├── BrainDumpPanel.tsx  # Brain dump overlay
│       ├── PlannerPanel.tsx    # Daily planner progress ring
│       ├── GoalPanel.tsx       # Goal progress editor
│       ├── KnowledgePanel.tsx  # Notes & tags editor
│       └── TaskListPanel.tsx   # Task list with toggles
├── lib/
│   ├── types.ts            # TypeScript types
│   ├── store.ts            # Zustand store (state management)
│   ├── utils.ts            # Helper functions
│   └── useAutoSave.ts      # Auto-save hook
├── public/
│   └── favicon.ico
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── postcss.config.mjs
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand + Persist Middleware
- **Styling**: Tailwind CSS
- **Utilities**: clsx, tailwind-merge
- **Data**: JSON export/import, localStorage persistence
- **UI Patterns**: Custom components (no component library needed)

## Key Components

### MindMapCanvas
- Custom HTML5-based canvas with SVG edges
- Pan/zoom with mouse wheel and touch pinch
- Grid background with responsive dot pattern
- Efficient rendering of filtered nodes
- Bezier curve edges with smooth animations

### MindMapNode
- Draggable, selectable, editable nodes
- Status indicators (todo, doing, done)
- Priority badges (urgent)
- Goal-mode: nodes scale with progress
- Planner-mode: estimated time display
- Knowledge-mode: note preview and tags
- Collapse/expand toggle button

### Zustand Store
- Global app state management
- Per-mode node data (separate for each mode)
- Settings (dark mode, auto-save enabled)
- Recent node tracking
- Filter state (overdue, urgent, project)
- Auto-persists to localStorage

### Mode-Specific Panels
- **Brain Dump**: Textarea with auto-organize by keyword
- **Planner**: Circular progress ring showing % completion
- **Goals**: Node progress editor with visual ring
- **Knowledge**: Full-featured note editor with tags
- **Tasks**: Collapsible task list with quick status toggle

## Performance

- **First Load JS**: ~104 kB (gzipped ~35 kB)
- **Page Size**: ~16 kB (optimized)
- **Animations**: GPU-accelerated with CSS transforms
- **No External APIs**: Completely offline-capable
- **Responsive**: Touch-optimized for mobile, optimized for desktop

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile: iOS Safari 14+, Chrome Mobile

## Development Notes

- ESLint disabled during builds (configured in next.config.mjs)
- Zustand provides automatic localStorage persistence
- All node data persisted separately per mode
- Recent nodes tracked globally across all modes
- Auto-save is debounced to 5 seconds
- Dark mode toggle applies to full UI immediately

## Usage Examples

### Create a Task
1. Click "Tasks" mode (or press 1)
2. Click "Quick Add" in sidebar
3. Type task name, press Enter
4. Click on task node to edit details (status, priority, deadline)

### Use Brain Dump
1. Click "Brain Dump" mode (or press 2)
2. Type thoughts in the textarea
3. Click "Dump It" or press Shift+Enter
4. Drag nodes to organize onto project branches
5. Or click "Auto-Organize" to auto-group by topic

### Track Goals
1. Click "Goals" mode (or press 4)
2. Select a goal node
3. Update "Current" value in the right panel
4. Watch the node grow and progress ring fill

### Plan Your Day
1. Click "Planner" mode (or press 3)
2. Drag task nodes into Morning/Afternoon/Evening/Someday branches
3. Watch progress ring update in real-time
4. Set estimated time for each task

### Build Knowledge Base
1. Click "Knowledge" mode (or press 5)
2. Right-click to add topics
3. Add notes under topics
4. Click note to edit full text and add tags
5. Use search (Ctrl+F) to find notes by topic or tag

## Future Enhancement Ideas

- Undo/redo functionality
- Collaboration (WebSocket sync)
- Rich text editor for notes
- Image/file attachments
- Custom node templates
- Recurring tasks
- Pomodoro timer integration
- Calendar view for planner
- Analytics dashboard

## License

MIT

---

Built with ❤️ by Yashaswi using Next.js, TypeScript, and Tailwind CSS.
