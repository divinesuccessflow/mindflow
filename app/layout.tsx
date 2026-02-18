import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MindFlow — Productivity Mindmap',
  description: 'A beautiful productivity mindmap for tasks, goals, planning, and knowledge.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full dark">
      <body className="h-full overflow-hidden" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
