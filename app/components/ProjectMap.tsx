'use client';

import { useMemo, useState } from 'react';

type Project = {
  id: string;
  title: string;
  client_name?: string | null;
  client_public?: boolean | null;
  year?: number | null;
  category?: string | null;
  description?: string | null;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;
  images?: string[] | null;
};

// A simplified outline of Israel, drawn as a schematic rather than a survey.
const OUTLINE: [number, number][] = [
  [35.10, 33.09], [35.32, 33.07], [35.58, 33.28], [35.80, 33.30], [35.84, 33.00], [35.78, 32.75],
  [35.64, 32.68], [35.57, 32.70], [35.55, 32.45], [35.55, 32.10], [35.55, 31.77], [35.47, 31.55],
  [35.43, 31.20], [35.40, 30.95], [35.18, 30.45], [35.12, 30.20], [35.03, 29.90], [34.98, 29.56],
  [34.89, 29.49], [34.84, 29.75], [34.63, 30.35], [34.45, 30.85], [34.27, 31.22], [34.55, 31.53],
  [34.57, 31.62], [34.64, 31.80], [34.70, 31.95], [34.76, 32.08], [34.82, 32.25], [34.87, 32.42],
  [34.93, 32.60], [34.97, 32.78], [35.02, 32.83], [35.07, 32.92], [35.10, 33.09],
];
const LNG_MIN = 34.2, LNG_MAX = 35.9, LAT_MIN = 29.4, LAT_MAX = 33.3;
const W = 380, H = 620;
const toXY = (lng: number, lat: number): [number, number] => [
  ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * W,
  ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H,
];

const REGIONS = ['צפון', 'מרכז', 'ירושלים', 'דרום'] as const;
type Region = (typeof REGIONS)[number];

/** Coarse regions from coordinates, good enough to filter a project list. */
function regionOf(lat: number, lng: number): Region {
  if (lat >= 32.6) return 'צפון';
  if (lat < 31.6) return 'דרום';
  if (lat < 32.0 && lng >= 35.0) return 'ירושלים';
  return 'מרכז';
}

type CityGroup = { city: string; lat: number; lng: number; x: number; y: number; region: Region; items: Project[] };

function groupByCity(projects: Project[]): CityGroup[] {
  const map = new Map<string, Project[]>();
  projects.forEach((p) => {
    if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
    const key = p.city || p.title;
    map.set(key, [...(map.get(key) ?? []), p]);
  });
  const groups: CityGroup[] = [];
  map.forEach((items, city) => {
    const lat = items.reduce((s, p) => s + (p.lat as number), 0) / items.length;
    const lng = items.reduce((s, p) => s + (p.lng as number), 0) / items.length;
    const [x, y] = toXY(lng, lat);
    groups.push({ city, lat, lng, x, y, region: regionOf(lat, lng), items });
  });
  // Nudge neighbouring pins apart (Tel Aviv / Ramat Gan sit a few pixels away).
  for (let pass = 0; pass < 40; pass++) {
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const dx = groups[j].x - groups[i].x;
        const dy = groups[j].y - groups[i].y;
        const d = Math.hypot(dx, dy) || 0.01;
        const min = 17;
        if (d < min) {
          const push = (min - d) / 2;
          const ux = dx / d, uy = dy / d;
          groups[i].x -= ux * push; groups[i].y -= uy * push;
          groups[j].x += ux * push; groups[j].y += uy * push;
        }
      }
    }
  }
  return groups.sort((a, b) => b.items.length - a.items.length || a.city.localeCompare(b.city, 'he'));
}

function metaOf(p: Project) {
  const bits: string[] = [];
  if (p.client_public && p.client_name) bits.push(p.client_name);
  if (p.category) bits.push(p.category);
  if (p.year) bits.push(String(p.year));
  return bits.join(' · ');
}

/**
 * Where the work is: Israel as a schematic with one pin per city, a region
 * filter, a search box, and a live count. Hover or tap a pin (or a city in the
 * list) to see the projects built there.
 */
export default function ProjectMap({ projects, copy }: { projects: Project[]; copy?: Record<string, string> }) {
  const t = (key: string, fallback: string) => (copy?.[key]?.trim() ? copy[key] : fallback);

  const groups = useMemo(() => groupByCity(projects), [projects]);
  const total = groups.reduce((s, g) => s + g.items.length, 0);

  const [region, setRegion] = useState<Region | null>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const visible = groups
    .map((g) => {
      if (region && g.region !== region) return null;
      if (!q) return g;
      const cityHit = g.city.toLowerCase().includes(q);
      const items = cityHit ? g.items : g.items.filter((p) => p.title.toLowerCase().includes(q));
      return items.length ? { ...g, items } : null;
    })
    .filter(Boolean) as CityGroup[];
  const visibleKeys = new Set(visible.map((g) => g.city));
  const shownCount = visible.reduce((s, g) => s + g.items.length, 0);
  const activeGroup = visible.find((g) => g.city === active) ?? null;

  const pathD =
    OUTLINE.map(([lng, lat], i) => {
      const [x, y] = toXY(lng, lat);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ') + 'Z';

  if (groups.length === 0) return null;

  return (
    <div className="pmap">
      <div className="pmap-tools">
        <input
          className="pmap-search"
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(null); }}
          placeholder={t('map_search_placeholder', 'חיפוש עיר או פרויקט')}
          aria-label={t('map_search_placeholder', 'חיפוש עיר או פרויקט')}
        />
        <div className="pmap-chips" role="group" aria-label="סינון לפי אזור">
          <button className={region === null ? 'pmap-chip on' : 'pmap-chip'} aria-pressed={region === null} onClick={() => { setRegion(null); setActive(null); }}>
            {t('map_filter_all', 'כל הארץ')}
          </button>
          {REGIONS.filter((r) => groups.some((g) => g.region === r)).map((r) => (
            <button key={r} className={region === r ? 'pmap-chip on' : 'pmap-chip'} aria-pressed={region === r} onClick={() => { setRegion(r); setActive(null); }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="pmap-grid">
        <div className="pmap-stage">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="מפת ישראל עם מיקומי הפרויקטים">
            <defs>
              <pattern id="pmap-dots" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="11" cy="11" r="1.4" fill="rgba(242,235,221,.16)" />
              </pattern>
            </defs>
            <path d={pathD} fill="url(#pmap-dots)" stroke="rgba(242,235,221,.55)" strokeWidth="1.5" strokeLinejoin="round" />
            {groups.map((g) => {
              const on = visibleKeys.has(g.city);
              const isActive = active === g.city;
              const r = 5 + Math.min(g.items.length, 6) * 1.2;
              return (
                <g
                  key={g.city}
                  className={'pmap-pin' + (on ? '' : ' off') + (isActive ? ' active' : '')}
                  transform={`translate(${g.x.toFixed(1)} ${g.y.toFixed(1)})`}
                  tabIndex={on ? 0 : -1}
                  role="button"
                  aria-label={`${g.city}, ${g.items.length}`}
                  onMouseEnter={() => on && setActive(g.city)}
                  onFocus={() => on && setActive(g.city)}
                  onClick={() => on && setActive(g.city)}
                  onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && on) { e.preventDefault(); setActive(g.city); } }}
                >
                  <circle className="pmap-halo" r={r + 7} />
                  <circle className="pmap-dot" r={r} />
                  {g.items.length > 1 && <text className="pmap-num" y="4" textAnchor="middle">{g.items.length}</text>}
                  {isActive && (
                    <text className="pmap-label" x="0" y={-r - 12} textAnchor="middle">
                      {g.city}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <div className="pmap-count" aria-live="polite">
            <b>{shownCount}/{total}</b>
            <span>{t('map_count_label', 'פרויקטים')}</span>
          </div>
          {copy?.map_hint && <div className="pmap-hint">{copy.map_hint}</div>}
        </div>

        <div className="pmap-list">
          {visible.length === 0 && <p className="pmap-empty">{t('map_empty', 'אין פרויקטים שמתאימים לחיפוש.')}</p>}
          {visible.map((g) => {
            const open = active === g.city;
            return (
              <div key={g.city} className={open ? 'pmap-city open' : 'pmap-city'}>
                <button
                  className="pmap-city-btn"
                  aria-expanded={open}
                  onMouseEnter={() => setActive(g.city)}
                  onClick={() => setActive(open ? null : g.city)}
                >
                  <span className="pmap-city-name">{g.city}</span>
                  <span className="pmap-city-n">{g.items.length}</span>
                </button>
                {open && (
                  <ul className="pmap-projects">
                    {g.items.map((p) => (
                      <li key={p.id}>
                        {p.images?.[0] && <img src={p.images[0]} alt="" loading="lazy" />}
                        <div>
                          <div className="pmap-p-title">{p.title}</div>
                          <div className="pmap-p-meta">{metaOf(p)}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
