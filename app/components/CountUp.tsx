'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number into place once it scrolls into view. By default counts
 * up from 0 to `value`. Pass `from` to start somewhere else, e.g. counting
 * down from the current year to a founding year.
 *
 * The first render (server HTML, no-JS, crawlers) always shows the real
 * final value; the count-in only plays after hydration.
 */
export default function CountUp({
  value,
  from = 0,
  duration = 1100,
}: {
  value: number;
  from?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Years (1900-2100) must not get thousands separators: "2007", not "2,007".
  const isYear = value >= 1900 && value <= 2100;
  const fmt = (n: number) => (isYear ? String(Math.round(n)) : Math.round(n).toLocaleString('en-US'));
  const [display, setDisplay] = useState(fmt(value));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    setDisplay(fmt(from));

    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        function tick(now: number) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(fmt(from + (value - from) * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        }
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, from, duration]);

  return <span ref={ref}>{display}</span>;
}
