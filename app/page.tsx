import ContactForm from './ContactForm';
import Reveal from './components/Reveal';
import Dimension from './components/Dimension';
import Masthead from './components/Masthead';
import Footer from './components/Footer';
import ProjectIndex from './components/ProjectIndex';
import ProjectMap from './components/ProjectMap';
import LevelGauge from './components/LevelGauge';
import Timeline from './components/Timeline';
import IntroSplash from './components/IntroSplash';
import GateForm from './components/GateForm';
import { getData, makeT, isGated, aboutFilled } from '../lib/site';

export const revalidate = 60;

export async function generateMetadata() {
  const { meta, profile } = await getData();
  return {
    title: meta?.title ?? profile?.name ?? 'טלדן ט.ד. הנדסה ובניין',
    description: meta?.meta_description ?? profile?.about_text ?? undefined,
  };
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

export default async function Home() {
  // Pre-launch gate: reading the cookie makes this route render per visitor.
  if (await isGated()) return <GateForm />;

  const { profile, services, projects, partners, copy } = await getData();
  const name = profile?.name ?? 'טלדן ט.ד. הנדסה ובניין בע"מ';
  const currentYear = new Date().getFullYear();
  // Every string routes through t(): site_copy rows, editable in the dashboard.
  const t = makeT(copy);
  const logos = partners.filter((p: any) => p.logo_url);
  const anyDated = projects.some((p: any) => typeof p.year === 'number');
  const hasMap = projects.some((p: any) => typeof p.lat === 'number' && typeof p.lng === 'number');

  // Sections whose content comes from the client appear only once it is filled in.
  const segments = range(4)
    .map((i) => ({ title: t(`segment_${i}_title`), text: t(`segment_${i}_text`) }))
    .filter((x) => x.title && x.text);
  const trust = range(6)
    .map((i) => ({ title: t(`trust_${i}_title`), text: t(`trust_${i}_text`) }))
    .filter((x) => x.title);
  const hasAbout = aboutFilled(copy);
  const aboutTeaser = t('about_teaser') || (t('about_body').split(/\n\s*\n/)[0] ?? '');

  return (
    <>
      <IntroSplash />
      <Reveal />
      <LevelGauge />
      <Masthead copy={copy} phone={profile?.phone} hasClients={logos.length > 0} />

      <div className="site">
        {/* ---------- hero ---------- */}
        <section className="hero holes">
          <div className="hero-photo" aria-hidden="true" />
          <div className="hero-scrim" aria-hidden="true" />
          <div className="wrap hero-in">
            <div className="hero-copy">
              <div className="eyebrow">
                {profile?.classification ? `סיווג ${profile.classification}` : t('hero_eyebrow_fallback', 'קבלן ראשי')} · {t('hero_eyebrow_suffix', 'הנדסה ובניין')}
              </div>
              <h1 className="hero-title">
                {t('hero_title_p1', 'בונים מבנים שאנשים')} <em>{t('hero_title_em', 'נכנסים אליהם כל יום')}</em>.
              </h1>
              <div className="hero-foot">
                <p className="hero-lead">
                  {t('hero_lead', profile?.about_text ?? 'מרכזים רפואיים, סניפי בנק ומבנים ציבוריים. פרויקטים שבהם לוח הזמנים, התקן והבטיחות אינם ניתנים למשא ומתן.')}
                </p>
                <div className="hero-cta">
                  <a className="btn" href="#contact">{t('hero_button', 'פנייה בנושא פרויקט')}</a>
                  <a className="btn btn-ghost" href="#projects">{t('hero_button_secondary', 'הפרויקטים שלנו')}</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- figures ---------- */}
        <section className="facts holes">
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
        </section>

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

        {/* ---------- about teaser (only once someone wrote it) ---------- */}
        {hasAbout && aboutTeaser && (
          <section className="band band-paper" id="about">
            <div className="wrap about-teaser">
              <div className="head rev">
                <div className="eyebrow">{t('about_eyebrow', 'מי אנחנו')}</div>
                <h2 className="head-title">{t('about_title', 'החברה והאנשים שמאחוריה')}</h2>
              </div>
              <div className="about-teaser-body rev">
                <p>{aboutTeaser}</p>
                <a className="textlink" href="/about">{t('about_link_label', 'לסיפור המלא')}</a>
              </div>
            </div>
          </section>
        )}

        {/* ---------- sectors ---------- */}
        <section className="band" id="sectors">
          <div className="wrap">
            <div className="head rev">
              <div className="eyebrow">{t('sectors_eyebrow', 'תחומי פעילות')}</div>
              <h2 className="head-title">{t('sectors_title', 'איפה אנחנו עובדים')}</h2>
              <p className="head-sub">
                {t('sectors_sub', 'כל תחום כאן דורש עמידה בתקנים אחרים, לוחות זמנים אחרים וגורמי פיקוח אחרים.')}
              </p>
            </div>
            <div className="sectors rev">
              {services.length > 0 ? (
                services.map((s: any) => (
                  <div className="sector" key={s.id}>
                    <div className="sector-name">{s.name}</div>
                    {s.description && <p className="sector-desc">{s.description}</p>}
                  </div>
                ))
              ) : (
                <p className="empty">{t('sectors_empty', 'תחומי הפעילות טרם הוזנו.')}</p>
              )}
            </div>
          </div>
        </section>

        {/* ---------- who we work with (only filled cards) ---------- */}
        {segments.length > 0 && (
          <section className="band band-dark holes on-dark" id="segments">
            <div className="wrap">
              <div className="head rev">
                <div className="eyebrow">{t('segments_eyebrow', 'סוגי לקוחות')}</div>
                <h2 className="head-title">{t('segments_title', 'לכל לקוח יש דרישות אחרות')}</h2>
                {t('segments_sub') && <p className="head-sub">{t('segments_sub')}</p>}
              </div>
              <div className="segments">
                {segments.map((s, i) => (
                  <article className="segment rev" key={s.title} style={{ ['--d' as any]: `${i * 80}ms` }}>
                    <h3 className="segment-title">{s.title}</h3>
                    <p className="segment-text">{s.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------- clients ---------- */}
        {logos.length > 0 && (
          <section className="band band-paper" id="clients">
            <div className="wrap">
              <div className="head rev">
                <div className="eyebrow">{t('clients_eyebrow', 'לקוחות')}</div>
                <h2 className="head-title">{t('clients_title', 'מבין הלקוחות שלנו')}</h2>
                <p className="head-sub">{t('clients_sub', 'חברות שביצענו עבורן פרויקטים.')}</p>
              </div>
              <div className="logowall rev">
                {logos.map((p: any) => (
                  <div className="logocell" key={p.id}>
                    <img src={p.logo_url} alt={p.name} title={p.name} loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------- credentials (only filled items) ---------- */}
        {trust.length > 0 && (
          <section className="band band-dark holes on-dark" id="trust">
            <div className="wrap">
              <div className="head rev">
                <div className="eyebrow">{t('trust_eyebrow', 'אישורים ותקנים')}</div>
                <h2 className="head-title">{t('trust_title', 'מה עומד מאחורי העבודה')}</h2>
                {t('trust_sub') && <p className="head-sub">{t('trust_sub')}</p>}
              </div>
              <div className="trustgrid rev">
                {trust.map((x) => (
                  <div className="trustcell" key={x.title}>
                    <div className="trust-title">{x.title}</div>
                    {x.text && <p className="trust-text">{x.text}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------- timeline: only once projects carry years ---------- */}
        {anyDated && (
          <section className="band band-dark holes on-dark" id="timeline">
            <div className="wrap">
              <div className="head rev">
                <div className="eyebrow">{t('timeline_eyebrow', 'מאז ההקמה')}</div>
                <h2 className="head-title">{t('timeline_title', 'מסלול החברה לאורך השנים')}</h2>
                <p className="head-sub">
                  {profile?.founded_year ?? 2007}–{currentYear}, {t('timeline_sub_suffix', 'פרויקט אחרי פרויקט.')}
                </p>
              </div>
            </div>
            <Timeline foundedYear={profile?.founded_year ?? 2007} currentYear={currentYear} projects={projects} />
          </section>
        )}

        {/* ---------- projects ---------- */}
        <section className="band band-ground" id="projects">
          <div className="wrap">
            <div className="head rev">
              <div className="eyebrow">{t('projects_eyebrow', 'תיק עבודות')}</div>
              <h2 className="head-title">{t('projects_title', 'כל הפרויקטים')}</h2>
              <p className="head-sub">
                {t('projects_sub', 'לקוח, שנה והיקף, כדי שאפשר יהיה להעריך את העבודה ולא רק לראות אותה. אפשר לסנן לפי תחום.')}
              </p>
            </div>
            <ProjectIndex projects={projects} copy={copy} />
          </div>
        </section>

        {/* ---------- where ---------- */}
        {hasMap && (
          <section className="cities holes on-dark" id="map">
            <div className="wrap">
              <div className="head rev">
                <div className="eyebrow">{t('map_eyebrow', 'על המפה')}</div>
                <h2 className="head-title">{t('map_title', 'בונים את ישראל')}</h2>
                <p className="head-sub">
                  {t('map_sub', 'כנראה כבר ביקרתם בפרויקטים שלנו. לדוגמה, הבוטיקים של נספרסו בישראל.')}
                </p>
              </div>
              <ProjectMap projects={projects} copy={copy} />
            </div>
          </section>
        )}

        {/* ---------- contact ---------- */}
        <section className="contact band-dark holes on-dark" id="contact">
          <div className="wrap">
            <div className="head rev">
              <div className="eyebrow">{t('contact_eyebrow', 'יצירת קשר')}</div>
              <h2 className="head-title">{t('contact_title', 'יש פרויקט על השולחן?')}</h2>
              <p className="head-sub">
                {t('contact_sub', 'כתבו מה סוג המבנה, איפה הוא ומה ההיקף המשוער ונחזור עם תשובה עניינית.')}
              </p>
            </div>
            <div className="contact-grid rev">
              <ContactForm copy={copy} types={services.map((s: any) => s.name).filter(Boolean)} />
              <div>
                {profile?.phone && (
                  <div className="cdirect-row">
                    <div className="cdirect-k">{t('contact_label_phone', 'טלפון')}</div>
                    <div className="cdirect-v"><a href={`tel:${profile.phone}`} dir="ltr">{profile.phone}</a></div>
                  </div>
                )}
                {profile?.email && (
                  <div className="cdirect-row">
                    <div className="cdirect-k">{t('contact_label_email', 'אימייל')}</div>
                    <div className="cdirect-v"><a href={`mailto:${profile.email}`} dir="ltr">{profile.email}</a></div>
                  </div>
                )}
                {profile?.address && (
                  <div className="cdirect-row">
                    <div className="cdirect-k">{t('contact_label_address', 'משרד')}</div>
                    <div className="cdirect-v small">{profile.address}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <Footer copy={copy} profile={profile} name={name} />
      </div>
    </>
  );
}
