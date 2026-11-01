'use client';

import { useState } from 'react';

type Project = {
  id: string;
  title: string;
  client_name?: string | null;
  client_public?: boolean | null;
  category?: string | null;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;
};

// A simplified silhouette of Israel — drawn as a technical schematic rather
// than a precise cartographic boundary, to match the drafting-document
// language used throughout the rest of the site.
const OUTLINE: [number, number][] = [
  [35.11, 33.09], [35.80, 33.15], [35.65, 32.83], [35.50, 32.47],
  [35.55, 31.85], [35.45, 31.35], [35.15, 30.60], [34.95, 29.55],
  [34.92, 30.03], [34.27, 31.22], [34.55, 31.67], [34.64, 31.80],
  [34.77, 32.08], [34.85, 32.33], [34.87, 32.50], [34.99, 32.82],
  [35.11, 33.09],
];

const LNG_MIN = 34.2, LNG_MAX = 35.9, LAT_MIN = 29.4, LAT_MAX = 33.3;
const W = 380, H = 620;

function project(lng: number, lat: number): [number, number] {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H;
  return [x, y];
}

// Deterministic small offset so tightly-clustered pins (several projects in
// the same metro area) separate into a visible cluster instead of one dot.
function jitter(id: string): [number, number] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const jx = ((h % 1000) / 1000 - 0.5) * 16;
  const jy = (((Math.floor(h / 1000)) % 1000) / 1000 - 0.5) * 16;
  return [jx, jy];
}

export default function IsraelMap({
  projects,
  copy,
}: {
  projects: Project[];
  copy?: Record<string, string>;
}) {
  const t = (key: string, fallback: string) => (copy?.[key] ? copy[key] : fallback);
  const [active, setActive] = useState<Project | null>(null);

  const points = projects.filter(
    (p) => typeof p.lat === 'number' && typeof p.lng === 'number'
  );

  const pathD =
    OUTLINE.map(([lng, lat], i) => {
      const [x, y] = project(lng, lat);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ') + ' Z';

  return (
    <div className="ilmap-wrap">
      <svg
        className="ilmap-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="מפת ישראל עם מיקומי הפרויקטים"
      >
        <defs>
          <pattern id="ilmap-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M 22 0 L 0 0 0 22" fill="none" stroke="var(--line)" strokeWidth="1" />
          </pattern>
          <radialGradient id="ilmap-glow" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="rgba(226,112,60,.16)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <path d={pathD} fill="url(#ilmap-glow)" />
        <path d={pathD} fill="url(#ilmap-grid)" className="ilmap-outline" />

        {points.map((p) => {
          const [bx, by] = project(p.lng as number, p.lat as number);
          const [jx, jy] = jitter(p.id);
          const x = bx + jx;
          const y = by + jy;
          const isActive = active?.id === p.id;
          return (
            <g
              key={p.id}
              transform={`translate(${x} ${y})`}
              className={isActive ? 'ilmap-pin on' : 'ilmap-pin'}
              onMouseEnter={() => setActive(p)}
              onFocus={() => setActive(p)}
              onClick={() => setActive(p)}
              tabIndex={0}
              role="button"
              aria-label={p.title}
            >
              <circle r="10" className="ilmap-pin-ring" />
              <circle r="3.4" className="ilmap-pin-dot" />
            </g>
          );
        })}
      </svg>

      <div className="ilmap-label" aria-live="polite">
        {active ? (
          <>
            <span className="ilmap-label-title">{active.title}</span>
            <span className="ilmap-label-meta">
              {active.client_public && active.client_name ? active.client_name : active.category}
              {active.city ? ` · ${active.city}` : ''}
            </span>
          </>
        ) : (
          <span className="ilmap-label-hint">{t('map_hint', 'ריחפו מעל נקודה כדי לראות פרויקט')}</span>
        )}
      </div>
    </div>
  );
}
