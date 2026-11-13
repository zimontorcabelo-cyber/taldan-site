'use client';

import { useEffect, useState } from 'react';

/**
 * Opening beat: the TD mark rises out of the tie-hole grid while a bronze
 * bar fills, then the site is revealed. Once per browser session, skipped
 * under prefers-reduced-motion.
 */
export default function IntroSplash() {
  const [phase, setPhase] = useState<'hidden' | 'hold' | 'fading'>('hidden');

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let seen: string | null = null;
    try { seen = sessionStorage.getItem('taldan_intro_seen'); } catch {}
    if (reduce || seen) return;
    try { sessionStorage.setItem('taldan_intro_seen', '1'); } catch {}

    document.body.style.overflow = 'hidden';
    setPhase('hold');
    const holdTimer = setTimeout(() => setPhase('fading'), 2300);
    const cleanupTimer = setTimeout(() => {
      document.body.style.overflow = '';
      setPhase('hidden');
    }, 3200);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(cleanupTimer);
      document.body.style.overflow = '';
    };
  }, []);

  if (phase === 'hidden') return null;

  return (
    <div className={phase === 'fading' ? 'splash fading' : 'splash'} aria-hidden="true">
      <div className="splash-in">
        <div className="splash-td"><span>T</span><span>D</span></div>
        <div className="splash-since">SINCE 2007</div>
        <div className="splash-bar"><i /></div>
      </div>
    </div>
  );
}
