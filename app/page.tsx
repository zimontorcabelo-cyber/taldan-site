import { cookies } from 'next/headers';
import { supabase } from '../lib/supabase';
import ContactForm from './ContactForm';
import Reveal from './components/Reveal';
import Dimension from './components/Dimension';
import HeaderScroll from './components/HeaderScroll';
import SiteMenu from './components/SiteMenu';
import ProjectsGrid from './components/ProjectsGrid';
import LogosCarousel from './components/LogosCarousel';
import IsraelMap from './components/IsraelMap';
import Timeline from './components/Timeline';
import IntroSplash from './components/IntroSplash';
import GateForm from './components/GateForm';
import { gateCookieValid } from '../lib/gate';

export const revalidate = 60;

const REFS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

async function getData() {
  const { data, error } = await supabase.rpc('taldan_get_homepage');
  if (error) {
    console.error('homepage fetch failed', error);
    return { profile: null, services: [], projects: [], partners: [], meta: null, copy: {} };
  }
  return {
    profile: data?.profile ?? null,
    services: data?.services ?? [],
    projects: data?.projects ?? [],
    partners: data?.partners ?? [],
    meta: data?.meta ?? null,
    copy: data?.copy ?? {},
  };
}

export async function generateMetadata() {
  const { meta, profile } = await getData();
  return {
    title: meta?.title ?? profile?.name ?? 'טלדן ט.ד. הנדסה ובניין',
    description: meta?.meta_description ?? profile?.about_text ?? undefined,
  };
}

export default async function Home() {
  // Pre-launch access gate: while enabled, anyone without the cookie sees
  // the code screen instead of the real homepage. The gate turns itself off
  // in the database after its third successful use, at which point this
  // check always passes and the gate never shows again for anyone. Reading
  // cookies() here forces this route to render fresh on every request
  // rather than being served from the static ISR cache, which is what lets
  // the check actually run per-visitor.
  const cookieStore = cookies();
  const unlocked = gateCookieValid(cookieStore.get('taldan_gate')?.value);
  if (!unlocked) {
    const { data: gateEnabled } = await supabase.rpc('taldan_gate_status');
    if (gateEnabled) {
      return <GateForm />;
    }
  }

  const { profile, services, projects, partners, copy } = await getData();
  const name = profile?.name ?? 'טלדן ט.ד. הנדסה ובניין בע"מ';
  const currentYear = new Date().getFullYear();

  // Every hardcoded string on the page routes through this — `copy` comes
  // from the site_copy table, editable in the dashboard. A missing key (or
  // an empty edit) falls back to the text baked in here, so the page never
  // breaks while content is still being filled in.
  const t = (key: string, fallback: string) => (copy?.[key] ? copy[key] : fallback);

  return (
    <>
      <IntroSplash />
      <Reveal />
      <div className="railline" aria-hidden="true" />

      <HeaderScroll />
      <header className="masthead">
        <div className="masthead-in">
          <SiteMenu copy={copy} />
          <div className="header-mark" dir="ltr">
            <span className="header-td">
              <span className="td-t2">T</span>
              <span className="td-d2">D</span>
            </span>
            <span className="header-word">
              <span>TALDAN</span>
              <span>ENGINEERING</span>
            </span>
          </div>
        </div>
      </header>

      <div className="sheet">
        {/* ---------- hero ---------- */}
        <section className="hero">
          <div className="hero-photo" aria-hidden="true" />
          <div className="hero-scrim" aria-hidden="true" />
          <div className="scan-grid" aria-hidden="true" />
          <div className="scan-line" aria-hidden="true" />
          <span className="gridref" aria-hidden="true">A</span>
          <div className="wrap">
            <div className="hero-copy">
              <div className="eyebrow">
                {profile?.classification ? `סיווג ${profile.classification}` : t('hero_eyebrow_fallback', 'קבלן ראשי')} · {t('hero_eyebrow_suffix', 'הנדסה ובניין')}
              </div>
              <h1 className="hero-title">
                {t('hero_title_p1', 'בונים מבנים שאנשים')} <em>{t('hero_title_em', 'נכנסים אליהם כל יום')}</em>.
              </h1>
              <p className="hero-lead">
                {t('hero_lead', profile?.about_text ?? 'מרכזים רפואיים, סניפי בנק ומבנים ציבוריים. פרויקטים שבהם לוח הזמנים, התקן והבטיחות אינם ניתנים למשא ומתן.')}
              </p>
              <a className="btn" href="#contact"><span>{t('hero_button', 'פנייה בנושא פרויקט')}</span></a>

              <div className="scalebar" aria-hidden="true">
                <span className="scalebar-seg fill" />
                <span className="scalebar-seg" />
                <span className="scalebar-seg fill" />
                <span className="scalebar-seg" />
                <span className="scalebar-note">{t('scalebar_note', '0 — 20 M')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- figures, as dimension callouts ---------- */}
        <div className="wrap">
          <div className="dims">
            <Dimension value={profile?.founded_year} label={t('stat_founded_label', 'שנת הקמה')} countFrom={currentYear} />
            <Dimension value={profile?.projects_count} label={t('stat_projects_label', 'פרויקטים שהושלמו')} />
            <Dimension
              value={profile?.total_sqm ? Number(profile.total_sqm).toLocaleString('en-US') : null}
              label={t('stat_sqm_label', 'מ"ר שנבנו')}
            />
            <Dimension value={profile?.classification} label={t('stat_classification_label', 'סיווג קבלני')} />
          </div>
        </div>

        {/* ---------- clients ---------- */}
        <div className="tickerband" aria-hidden="true">
          <div className="ticker-track">
            {[...Array(2)].flatMap((_, rep) =>
              (services.length > 0 ? services : [{ id: 'a' }, { id: 'b' }, { id: 'c' }]).map((s: any, i: number) => (
                <span className="ticker-item" key={`${rep}-${s.id ?? i}`}>
                  {s.name ?? name}
                </span>
              ))
            )}
          </div>
        </div>

        {partners.length > 0 && (
          <section className="band" id="clients">
            <span className="gridref" aria-hidden="true">B</span>
            <div className="wrap">
              <div className="head rev">
                <div className="eyebrow">{t('clients_eyebrow', 'לקוחות')}</div>
                <h2 className="head-title">{t('clients_title', 'מבין הלקוחות שלנו')}</h2>
                <p className="head-sub">
                  {t('clients_sub', 'חברות שביצענו עבורן פרויקטים. אפשר לגרור ולסובב.')}
                </p>
              </div>
              <LogosCarousel partners={partners} />
            </div>
          </section>
        )}

        {/* ---------- sectors ---------- */}
        <section className="band" id="sectors">
          <span className="gridref" aria-hidden="true">C</span>
          <div className="wrap">
            <div className="head rev">
              <div className="eyebrow">{t('sectors_eyebrow', 'תחומי פעילות')}</div>
              <h2 className="head-title">{t('sectors_title', 'איפה אנחנו עובדים')}</h2>
              <p className="head-sub">
                {t('sectors_sub', 'כל תחום כאן דורש עמידה בתקנים אחרים, לוחות זמנים אחרים וגורמי פיקוח אחרים.')}
              </p>
            </div>

            <div className="sectors">
              {services.length > 0 ? (
                services.map((s: any, i: number) => (
                  <div className="sector rev" key={s.id} style={{ ['--d' as any]: `${i * 70}ms` }}>
                    <span className="sector-ref">{REFS[i % REFS.length]}</span>
                    <div>
                      <div className="sector-name">{s.name}</div>
                      {s.description && <p className="sector-desc">{s.description}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty">{t('sectors_empty', 'תחומי הפעילות טרם הוזנו.')}</p>
              )}
            </div>
          </div>
        </section>

        {/* ---------- timeline: since founding ---------- */}
        <section className="band band-dark" id="timeline">
          <span className="gridref" aria-hidden="true">D</span>
          <div className="wrap">
            <div className="head rev">
              <div className="eyebrow">{t('timeline_eyebrow', 'מאז ההקמה')}</div>
              <h2 className="head-title">{t('timeline_title', 'מסלול החברה לאורך השנים')}</h2>
              <p className="head-sub">
                {profile?.founded_year ?? 2007}–{currentYear}, {t('timeline_sub_suffix', 'פרויקט אחרי פרויקט.')}
              </p>
            </div>
          </div>
          <Timeline
            foundedYear={profile?.founded_year ?? 2007}
            currentYear={currentYear}
            projects={projects}
          />
        </section>

        {/* ---------- projects: filterable portfolio grid ---------- */}
        <section className="band" id="projects">
          <span className="gridref" aria-hidden="true">E</span>
          <div className="wrap">
            <div className="head rev">
              <div className="eyebrow">{t('projects_eyebrow', 'תיק עבודות')}</div>
              <h2 className="head-title">{t('projects_title', 'כל הפרויקטים')}</h2>
              <p className="head-sub">
                {t('projects_sub', 'לקוח, שנה והיקף, כדי שאפשר יהיה להעריך את העבודה ולא רק לראות אותה. אפשר לסנן לפי תחום.')}
              </p>
            </div>

            <ProjectsGrid projects={projects} copy={copy} />

            <div className="ilmap-head rev">
              <div className="eyebrow">{t('map_eyebrow', 'על המפה')}</div>
              <h3 className="head-title">{t('map_title', 'בונים את ישראל')}</h3>
              <p className="head-sub">
                {t('map_sub', 'כנראה כבר ביקרתם בפרויקטים שלנו. לדוגמה, הבוטיקים של נספרסו בישראל.')}
              </p>
            </div>
            <IsraelMap projects={projects} copy={copy} />
          </div>
        </section>

        {/* ---------- contact ---------- */}
        <section className="band" id="contact">
          <span className="gridref" aria-hidden="true">F</span>
          <div className="wrap">
            <div className="head rev">
              <div className="eyebrow">{t('contact_eyebrow', 'יצירת קשר')}</div>
              <h2 className="head-title">{t('contact_title', 'יש פרויקט על השולחן?')}</h2>
              <p className="head-sub">
                {t('contact_sub', 'כתבו מה סוג המבנה, איפה הוא ומה ההיקף המשוער ונחזור עם תשובה עניינית.')}
              </p>
            </div>

            <div className="contact-grid rev">
              <ContactForm copy={copy} />
              <div>
                {profile?.phone && (
                  <div className="cdirect-row">
                    <div className="cdirect-k">{t('contact_label_phone', 'טלפון')}</div>
                    <div className="cdirect-v"><a href={`tel:${profile.phone}`}>{profile.phone}</a></div>
                  </div>
                )}
                {profile?.email && (
                  <div className="cdirect-row">
                    <div className="cdirect-k">{t('contact_label_email', 'אימייל')}</div>
                    <div className="cdirect-v"><a href={`mailto:${profile.email}`}>{profile.email}</a></div>
                  </div>
                )}
                {profile?.address && (
                  <div className="cdirect-row">
                    <div className="cdirect-k">{t('contact_label_address', 'משרד')}</div>
                    <div className="cdirect-v">{profile.address}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ---------- title block ---------- */}
      <footer className="titleblock">
        <div className="tb-grid">
          <div className="tb-cell">
            <div className="tb-k">{t('footer_company_label', 'חברה')}</div>
            <div className="tb-v">{name}</div>
          </div>
          <div className="tb-cell">
            <div className="tb-k">{t('footer_address_label', 'משרד')}</div>
            <div className="tb-v">{profile?.address ?? '––'}</div>
          </div>
          <div className="tb-cell">
            <div className="tb-k">{t('footer_phone_label', 'טלפון')}</div>
            <div className="tb-v">{profile?.phone ?? '––'}</div>
          </div>
          <div className="tb-cell">
            <div className="tb-k">{t('footer_email_label', 'אימייל')}</div>
            <div className="tb-v">{profile?.email ?? '––'}</div>
          </div>
        </div>
        <div className="tb-foot">
          <span>{t('footer_brand_line', 'TALDAN T.D. ENGINEERING & CONSTRUCTION')}</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </>
  );
}
