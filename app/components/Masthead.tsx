import HeaderScroll from './HeaderScroll';
import SiteMenu from './SiteMenu';
import { makeT, aboutFilled } from '../../lib/site';

/** Top bar shared by the homepage and the about page. */
export default function Masthead({
  copy,
  phone,
  hasClients,
  current,
}: {
  copy: Record<string, string>;
  phone?: string | null;
  hasClients: boolean;
  current?: string;
}) {
  const t = makeT(copy);
  const hasAbout = aboutFilled(copy);
  const links: { id: string; href: string; label: string }[] = [
    ...(hasAbout ? [{ id: 'about', href: '/about', label: t('menu_about', 'מי אנחנו') }] : []),
    { id: 'sectors', href: '/#sectors', label: t('menu_sectors', 'תחומי פעילות') },
    ...(hasClients ? [{ id: 'clients', href: '/#clients', label: t('menu_clients', 'לקוחות') }] : []),
    { id: 'projects', href: '/#projects', label: t('menu_projects', 'פרויקטים') },
    { id: 'contact', href: '/#contact', label: t('menu_contact', 'יצירת קשר') },
  ];
  return (
    <>
      <HeaderScroll />
      <header className="masthead">
        <div className="masthead-in">
          <a className="header-mark" href="/" dir="ltr" aria-label="TALDAN, לעמוד הבית">
            <span className="header-td">
              <span className="td-t2">T</span>
              <span className="td-d2">D</span>
            </span>
            <span className="header-word">
              <span>TALDAN</span>
              <span>ENGINEERING</span>
            </span>
          </a>
          <nav className="mast-nav" aria-label="ניווט ראשי">
            {links.map((l) => (
              <a key={l.id} href={l.href} data-nav={l.id === 'about' ? undefined : l.id} aria-current={current === l.id ? 'page' : undefined}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mast-right">
            {phone && <a className="mast-phone" href={`tel:${phone}`}>{phone}</a>}
            <SiteMenu copy={copy} hasAbout={hasAbout} hasClients={hasClients} />
          </div>
        </div>
      </header>
    </>
  );
}
