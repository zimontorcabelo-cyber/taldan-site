'use client';

import { useRef } from 'react';

/**
 * An image that tilts in 3D toward the cursor with a moving glare, framed by
 * technical corner registration marks (the crop-mark motif from a printed
 * drawing). Degrades gracefully on touch — no cursor means no tilt, the
 * static frame and corner marks still read fine on their own.
 */
export default function TiltImage({ src, alt }: { src: string; alt: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 14;
    const rotateX = (0.5 - py) * 10;
    if (innerRef.current) {
      innerRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.045)`;
    }
    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,.32), transparent 55%)`;
      glareRef.current.style.opacity = '1';
    }
  }

  function onLeave() {
    if (innerRef.current) innerRef.current.style.transform = '';
    if (glareRef.current) glareRef.current.style.opacity = '0';
  }

  return (
    <div className="tilt-frame" ref={wrapRef} onMouseMove={onMove} onMouseLeave={onLeave}>
      <span className="tilt-corner tc-tl" aria-hidden="true" />
      <span className="tilt-corner tc-tr" aria-hidden="true" />
      <span className="tilt-corner tc-bl" aria-hidden="true" />
      <span className="tilt-corner tc-br" aria-hidden="true" />
      <div className="tilt-inner" ref={innerRef}>
        <img src={src} alt={alt} loading="lazy" />
      </div>
      <div className="tilt-glare" ref={glareRef} aria-hidden="true" />
    </div>
  );
}
