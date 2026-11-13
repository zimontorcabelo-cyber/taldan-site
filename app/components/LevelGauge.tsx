'use client';

import { useEffect, useRef } from 'react';

/**
 * A surveyor's level gauge fixed to the screen edge. The marker climbs as
 * the page scrolls and the label reads as an elevation, so the whole page
 * behaves like a structure going up. Purely decorative.
 */
export default function LevelGauge() {
  const mark = useRef<HTMLDivElement>(null);
  const val = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    function update() {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (mark.current) {
        const y = 72 + p * (window.innerHeight - 72 - 40);
        mark.current.style.transform = `translateY(${y}px)`;
      }
      if (val.current) val.current.textContent = `+${(p * 38.4).toFixed(2)}`;
    }
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="gauge" aria-hidden="true">
      <div className="gauge-ticks" />
      <div className="gauge-mark" ref={mark}>
        <span className="gauge-val" ref={val}>+0.00</span>
      </div>
    </div>
  );
}
