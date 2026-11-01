'use client';

import { useEffect, useState } from 'react';

/**
 * Opening beat: a perspective "grid floor" drifts under an orange glow,
 * the TD mark drops into place letter by letter, then a fill-bar completes
 * before the site is revealed. Runs once per browser session and is
 * skipped entirely under prefers-reduced-motion.
 */
export default function IntroSplash() {
  const [phase, setPhase] = useState<'hidden' | 'hold' | 'fading'>('hidden');

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seen = sessionStorage.getItem('taldan_intro_seen');
    if (reduce || seen) return;

    sessionStorage.setItem('taldan_intro_seen', '1');
    document.body.style.overflow = 'hidden';
    setPhase('hold');

    const holdTimer = setTimeout(() => setPhase('fading'), 2200);
    const cleanupTimer = setTimeout(() => {
      document.body.style.overflow = '';
    }, 2200 + 700);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(cleanupTimer);
      document.body.style.overflow = '';
    };
  }, []);

  if (phase === 'hidden') return null;

  return (
    <div className={phase === 'fading' ? 'intro-splash fading' : 'intro-splash'} aria-hidden="true" dir="ltr">
      <div className="loader-floor" />
      <div className="loader-glow" />
      <div className="intro-inner">
        <div className="loader-kicker">TALDAN ENGINEERING</div>
        <span className="td-mark">
          <span className="td-t drop-letter" style={{ animationDelay: '.1s' }}>T</span>
          <span className="td-d drop-letter" style={{ animationDelay: '.22s' }}>D</span>
        </span>
        <div className="since-tag">SINCE 2007</div>
        <div className="loader-bar"><i /></div>
      </div>
    </div>
  );
}
