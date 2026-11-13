'use client';

import { useEffect, useMemo, useState } from 'react';

type Project = {
  id: string;
  title: string;
  client_name?: string | null;
  client_public?: boolean | null;
  year?: number | null;
  area_sqm?: number | null;
  description?: string | null;
  category?: string | null;
  city?: string | null;
  images?: string[] | null;
};

function metaBits(p: Project, fallbackCategory: string) {
  const bits: string[] = [];
  bits.push(p.client_public && p.client_name ? p.client_name : p.category ?? fallbackCategory);
  if (p.city) bits.push(p.city);
  if (p.year) bits.push(String(p.year));
  if (p.area_sqm) bits.push(`${Number(p.area_sqm).toLocaleString('en-US')} מ"ר`);
  return bits;
}

/**
 * The portfolio as an index, the way a drawing register lists sheets: one
 * row per project, big type, and the photo of whichever row you point at
 * shown beside the list. On phones each row carries its own thumbnail.
 */
export default function ProjectIndex({
  projects,
  copy,
}: {
  projects: Project[];
  copy?: Record<string, string>;
}) {
  const t = (key: string, fallback: string) => (copy?.[key] ? copy[key] : fallback);
  const fallbackCategory = t('projects_default_category', 'פרויקט');

  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [projects]);

  const [filter, setFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Project | null>(null);
  const [hover, setHover] = useState(0);
  const shown = filter ? projects.filter((p) => p.category === filter) : projects;
  const current = shown[Math.min(hover, shown.length - 1)];

  useEffect(() => {
    if (!selected) return;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelected(null);
    }
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [selected]);

  if (projects.length === 0) {
    return <p className="empty">{t('projects_empty', 'הפרויקטים טרם הוזנו.')}</p>;
  }

  return (
    <>
      {categories.length > 1 && (
        <div className="pfilters" role="group" aria-label="סינון לפי תחום">
          <button
            className={filter === null ? 'pfilter on' : 'pfilter'}
            aria-pressed={filter === null}
            onClick={() => { setFilter(null); setHover(0); }}
          >
            {t('projects_filter_all', 'הכל')}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={filter === c ? 'pfilter on' : 'pfilter'}
              aria-pressed={filter === c}
              onClick={() => { setFilter(c); setHover(0); }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="pindex">
        <div className="pindex-list">
          {shown.map((p, i) => (
            <button
              key={p.id}
              className={i === hover ? 'prow on' : 'prow'}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onClick={() => setSelected(p)}
            >
              {p.images?.[0] && <img className="prow-thumb" src={p.images[0]} alt="" loading="lazy" />}
              <span className="prow-main">
                <span className="prow-title">{p.title}</span>
                <span className="prow-meta" style={{ display: 'block' }}>{metaBits(p, fallbackCategory).join(' · ')}</span>
              </span>
              <span className="prow-arrow" aria-hidden="true">↖</span>
            </button>
          ))}
        </div>

        <div className="pindex-preview" aria-hidden="true">
          {shown.map((p, i) =>
            p.images?.[0] ? (
              <img key={p.id} src={p.images[0]} alt="" className={i === hover ? 'on' : ''} loading="lazy" />
            ) : null
          )}
          {current && <div className="pindex-cap">{current.category ?? fallbackCategory}</div>}
        </div>
      </div>

      {selected && (
        <div className="pmodal-overlay" onClick={() => setSelected(null)}>
          <div className="pmodal" onClick={(e) => e.stopPropagation()} dir="rtl" role="dialog" aria-modal="true" aria-label={selected.title}>
            <button className="pmodal-close" aria-label="סגירה" onClick={() => setSelected(null)}>×</button>
            {selected.images?.[0] && (
              <div className="pmodal-media"><img src={selected.images[0]} alt={selected.title} /></div>
            )}
            <div className="pmodal-body">
              <div className="pmodal-meta">{metaBits(selected, fallbackCategory).join(' · ')}</div>
              <h3 className="pmodal-title">{selected.title}</h3>
              {selected.description && <p className="pmodal-desc">{selected.description}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
