'use client';

import { useEffect, useState } from 'react';

/**
 * Hamburger trigger + full-screen site menu. Sits where the logo used to
 * sit; the logo moved to the opposite side. Same dark drafting palette as
 * the rest of the site, so opening it feels like part of the same system
 * rather than a bolted-on mobile nav.
 */
export default function SiteMenu({ copy }: { copy?: Record<string, string> }) {
  const [open, setOpen] = useState(false);
  const t = (key: string, fallback: string) => (copy?.[key] ? copy[key] : fallback);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        className="hamburger-btn"
        aria-label="תפריט"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={open ? 'sitemenu-overlay open' : 'sitemenu-overlay'} dir="rtl">
        <button className="sitemenu-close" aria-label="סגירה" onClick={() => setOpen(false)}>
          ×
        </button>
        <nav className="sitemenu-links">
          <a href="#clients" onClick={() => setOpen(false)}>{t('menu_clients', 'לקוחות')}</a>
          <a href="#sectors" onClick={() => setOpen(false)}>{t('menu_sectors', 'תחומי פעילות')}</a>
          <a href="#projects" onClick={() => setOpen(false)}>{t('menu_projects', 'פרויקטים')}</a>
          <a href="#contact" onClick={() => setOpen(false)}>{t('menu_contact', 'יצירת קשר')}</a>
        </nav>
        <div className="sitemenu-foot">{t('menu_brand_line', 'TALDAN T.D. ENGINEERING')}</div>
      </div>
    </>
  );
}
