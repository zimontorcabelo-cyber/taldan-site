'use client';

import { useEffect, useRef, useState } from 'react';

type Partner = { id: string; name: string; logo_url: string | null };

const CARD_HALF_WIDTH = 75;
const MAX_RADIUS_X = 230;
const RADIUS_RATIO = 130 / 230; // keep the same oval proportions at any size

/**
 * Each logo sits in its own oval card and always faces the viewer (it never
 * turns edge-on), moving along an elliptical path as the group rotates —
 * so cards read as separate floating pieces, not a connected ring. The path
 * radius is measured from the stage's own width so it can never overflow
 * the screen, however narrow.
 */
export default function LogosCarousel({ partners }: { partners: Partner[] }) {
  const items = partners.filter((p) => p.logo_url);
  const n = items.length;

  const stageRef = useRef<HTMLDivElement>(null);
  const [radiusX, setRadiusX] = useState(MAX_RADIUS_X);

  useEffect(() => {
    function measure() {
      const w = stageRef.current?.clientWidth ?? MAX_RADIUS_X * 2;
      const available = w / 2 - CARD_HALF_WIDTH - 12;
      setRadiusX(Math.max(70, Math.min(MAX_RADIUS_X, available)));
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const radiusZ = radiusX * RADIUS_RATIO;

  const [rotation, setRotation] = useState(0);
  const rotRef = useRef(0);
  const dragging = useRef(false);
  const hovering = useRef(false);
  const lastX = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    function tick() {
      if (!dragging.current && !hovering.current) {
        rotRef.current += 0.25;
        setRotation(rotRef.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    lastX.current = e.clientX;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    rotRef.current += dx * 0.5;
    setRotation(rotRef.current);
  }
  function onPointerUp() {
    dragging.current = false;
  }

  if (n === 0) return null;
  const angleStep = 360 / n;

  return (
    <div
      ref={stageRef}
      className="carousel3d-stage"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={() => {
        onPointerUp();
        hovering.current = false;
      }}
      onPointerEnter={() => {
        hovering.current = true;
      }}
      role="group"
      aria-label="לקוחות — ניתן לגרור כדי לסובב"
    >
      <div className="carousel3d-track">
        {items.map((p, i) => {
          const deg = rotation + i * angleStep;
          const rad = (deg * Math.PI) / 180;
          const x = radiusX * Math.sin(rad);
          const z = radiusZ * Math.cos(rad) - radiusZ; // 0 = front, negative = back
          const depth = (z + 2 * radiusZ) / (2 * radiusZ); // 1 front .. 0 back
          const scale = 0.6 + 0.4 * depth;
          const opacity = 0.35 + 0.65 * depth;

          return (
            <div
              key={p.id}
              className="carousel3d-item"
              style={{
                transform: `translate3d(${x}px, 0, ${z}px) scale(${scale})`,
                opacity,
                zIndex: Math.round(z),
              }}
            >
              <div className="carousel3d-face">
                <img src={p.logo_url!} alt={p.name} title={p.name} draggable={false} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
