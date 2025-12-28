"use client";
import React, { useRef, useState, useEffect } from 'react';

interface Props {
  initialLeft?: number; // percent
  left: React.ReactNode;
  right: React.ReactNode;
}

export default function ResizableSplit({ initialLeft = 40, left, right }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [leftPercent, setLeftPercent] = useState<number>(initialLeft);
  const draggingRef = useRef(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(10, Math.min(90, (x / rect.width) * 100));
      setLeftPercent(pct);
    };
    const onUp = () => (draggingRef.current = false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="flex-1 flex h-full overflow-hidden relative">
      <div style={{ width: `${leftPercent}%` }} className="min-w-[200px] max-w-[90%] overflow-hidden">
        {left}
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        onMouseDown={() => (draggingRef.current = true)}
        className="w-2 cursor-col-resize bg-transparent hover:bg-white/5 transition-colors"
      />

      <div style={{ width: `${100 - leftPercent}%` }} className="flex-1 overflow-hidden">
        {right}
      </div>
    </div>
  );
}
