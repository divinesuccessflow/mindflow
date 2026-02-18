import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MindNode } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isOverdue(deadline: string | undefined): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

export function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days}d`;
}

export function getProgressPercent(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

export function autoOrganize(nodes: MindNode[]): MindNode[] {
  const categories: Record<string, string[]> = {
    work: ['meeting', 'project', 'deadline', 'report', 'email', 'client', 'boss', 'team', 'sprint', 'review'],
    personal: ['gym', 'fitness', 'health', 'family', 'friend', 'dinner', 'vacation', 'buy', 'shopping'],
    learning: ['read', 'study', 'course', 'book', 'learn', 'research', 'tutorial', 'practice'],
    ideas: ['idea', 'concept', 'maybe', 'could', 'should', 'what if', 'explore', 'try'],
  };

  const categoryColors: Record<string, string> = {
    work: '#3b82f6',
    personal: '#ec4899',
    learning: '#f59e0b',
    ideas: '#8b5cf6',
    other: '#6b7280',
  };

  return nodes.map((node) => {
    const labelLower = node.label.toLowerCase();
    let assignedCategory = 'other';

    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some((kw) => labelLower.includes(kw))) {
        assignedCategory = cat;
        break;
      }
    }

    return { ...node, color: categoryColors[assignedCategory] };
  });
}

export function getCompletionPercent(nodes: MindNode[]): number {
  const tasks = nodes.filter((n) => !n.isRoot && n.completed !== undefined);
  if (tasks.length === 0) return 0;
  const done = tasks.filter((n) => n.completed === true).length;
  return Math.round((done / tasks.length) * 100);
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
