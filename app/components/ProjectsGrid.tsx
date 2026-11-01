'use client';

import { useEffect, useMemo, useState } from 'react';
import TiltImage from './TiltImage';

// Grid references, as on a drawing: letters locate, they don't sequence —
// reused here so every project badge reads as part of the same drafting
// system as the sector list above it.
const REFS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

type Project = {
  id: string;
  title: string;
  client_name?: string | null;
  client_public?: boolean | null;
  year?: number | null;
  area_sqm?: number | null;
  description?: string | null;
  category?: string | null;
  images?: string[] | null;
};

function metaLine(p: Project, defaultCategory: string) {
  const bits: string[] = [];
  bits.push(p.client_public && p.client_name ? p.client_name : p.category ?? defaultCategory);
  if (p.year) bits.push(String(p.year));
  if (p.area_sqm) bits.push(`${Number(p.area_sqm).toLocaleString('en-US')} מ"ר`);
  return bits;
}

export default function ProjectsGrid({
  projects,
  copy,
}: {
  projects: Project[];
  copy?: Record<string, string>;
}) {
  const t = (key: string, fallback: string) => (copy?.[key] ? copy[key] : fallback);
  const defaultCategory = t('projects_default_category', 'פרויקט');

  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [projects]);

  const [active, setActive] = useState<string | null>(null);
  const [selected, setSelected] = useState<Project | null>(null);
  const shown = active ? projects.filter((p) => p.category === active) : projects;

  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : '';
    if (!selected) return;
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
        <div className="pgrid-filters" role="tablist" aria-label="סינון לפי תחום">
          <button
            className={active === null ? 'pgrid-filter on' : 'pgrid-filter'}
            onClick={() => setActive(null)}
          >
            {t('projects_filter_all', '+ הכל')}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={active === c ? 'pgrid-filter on' : 'pgrid-filter'}
              onClick={() => setActive(c)}
            >
              + {c}
            </button>
          ))}
        </div>
      )}

      <div className="pstack">
        {shown.map((p, i) => (
          <article
            className="pstack-card"
            key={p.id}
            style={{ zIndex: i + 1 }}
            role="button"
            tabIndex={0}
            onClick={() => setSelected(p)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelected(p);
              }
            }}
          >
            <span className="pstack-wm" aria-hidden="true">{REFS[i % REFS.length]}</span>
            {p.images?.[0] && (
              <div className="pstack-media">
                <TiltImage src={p.images[0]} alt={p.title} />
              </div>
            )}
            <div className="pstack-body">
              <div className="pstack-meta">
                <span className="pstack-badge">{REFS[i % REFS.length]}</span>
                <span>{metaLine(p, defaultCategory).join(' · ')}</span>
              </div>
              <h3 className="pstack-title">{p.title}</h3>
              <span className="pstack-cta">{t('projects_cta', 'לפרטי הפרויקט ↗')}</span>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <div className="pmodal-overlay" onClick={() => setSelected(null)}>
          <div className="pmodal" onClick={(e) => e.stopPropagation()} dir="rtl">
            <button className="pmodal-close" aria-label="סגירה" onClick={() => setSelected(null)}>
              ×
            </button>
            {selected.images?.[0] && (
              <div className="pmodal-media">
                <TiltImage src={selected.images[0]} alt={selected.title} />
              </div>
            )}
            <div className="pmodal-body">
              <div className="pstack-meta">
                <span>{metaLine(selected, defaultCategory).join(' · ')}</span>
              </div>
              <h2 className="pmodal-title">{selected.title}</h2>
              {selected.description && <p className="pmodal-desc">{selected.description}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
