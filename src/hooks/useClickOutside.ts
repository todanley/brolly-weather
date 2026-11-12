import { useEffect, type RefObject } from 'react';

export function useClickOutside(ref: RefObject<HTMLElement>, onOutside: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onOutside();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [ref, onOutside, enabled]);
}
