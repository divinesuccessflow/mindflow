import { useEffect, useRef, useState } from 'react';
import { useMindFlowStore } from './store';

export function useAutoSave() {
  const data = useMindFlowStore((s) => s.data);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!data.settings.autoSave) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setIsSaving(true);
      // Zustand persist handles actual storage; we just show the indicator
      setTimeout(() => {
        setLastSaved(new Date());
        setIsSaving(false);
      }, 400);
    }, 5000);
    return () => clearTimeout(timer.current);
  }, [data]);

  return { lastSaved, isSaving };
}
