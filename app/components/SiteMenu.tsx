'use client';

import { useEffect, useState } from 'react';

/** Menu trigger + full-screen menu with the tie-hole grid behind huge links. */
export default function SiteMenu({ copy, hasAbout, hasClients = true }: { copy?: Record<string, string>; hasAbout?: boolean; hasClients?: boolean }) {
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
        <span className="bars" aria-hidden="true"><i /><i /><i /></span>
        <span>{t('menu_label', 'תפריט')}</span>
      </button>

      <div className={open ? 'sitemenu-overlay open' : 'sitemenu-overlay'} dir="rtl">
        <button className="sitemenu-close" aria-label="סגירה" onClick={() => setOpen(false)}>
          ×
        </button>
        <nav className="sitemenu-links">
          {hasAbout && <a href="/about" onClick={() => setOpen(false)}>{t('menu_about', 'מי אנחנו')}</a>}
          <a href="/#sectors" onClick={() => setOpen(false)}>{t('menu_sectors', 'תחומי פעילות')}</a>
          {hasClients && <a href="/#clients" onClick={() => setOpen(false)}>{t('menu_clients', 'לקוחות')}</a>}
          <a href="/#projects" onClick={() => setOpen(false)}>{t('menu_projects', 'פרויקטים')}</a>
          <a href="/#contact" onClick={() => setOpen(false)}>{t('menu_contact', 'יצירת קשר')}</a>
        </nav>
        <div className="sitemenu-foot">{t('menu_brand_line', 'TALDAN T.D. ENGINEERING')}</div>
      </div>
    </>
  );
}
