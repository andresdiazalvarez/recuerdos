import { useRef, type PointerEvent, type KeyboardEvent } from 'react';
import { HOLD_MS } from './model';
// Open native selectors synchronously on pointer/key release, preserving user activation.
export function usePress(short: () => void, long: () => void) {
  const start = useRef<{ time: number; x: number; y: number; moved: boolean } | null>(null);
  const handled = useRef(false);
  return {
    onPointerDown: (e: PointerEvent) => { if (e.button !== 0) return; e.stopPropagation(); handled.current = false; start.current = { time: performance.now(), x: e.clientX, y: e.clientY, moved: false }; e.currentTarget.setPointerCapture(e.pointerId); },
    onPointerMove: (e: PointerEvent) => { const s = start.current; if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 9) s.moved = true; },
    onPointerUp: (e: PointerEvent) => { e.stopPropagation(); const s = start.current; start.current = null; handled.current = true; if (s && !s.moved) (performance.now() - s.time >= HOLD_MS ? long : short)(); },
    onPointerCancel: () => { start.current = null; handled.current = true; },
    onContextMenu: (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); },
    onClick: (e: React.MouseEvent) => { e.stopPropagation(); if (!handled.current && e.detail === 0) short(); handled.current = false; },
    onKeyDown: (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) { start.current = { time: performance.now(), x: 0, y: 0, moved: false }; handled.current = true; } } },
    onKeyUp: (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); const s = start.current; start.current = null; if (s) (performance.now() - s.time >= HOLD_MS ? long : short)(); } },
  };
}
