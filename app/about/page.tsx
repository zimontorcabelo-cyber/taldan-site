import { notFound } from 'next/navigation';
import Reveal from '../components/Reveal';
import Masthead from '../components/Masthead';
import Footer from '../components/Footer';
import GateForm from '../components/GateForm';
import { getData, makeT, isGated, aboutFilled } from '../../lib/site';

export const revalidate = 60;

export async function generateMetadata() {
  const { copy, profile } = await getData();
  const t = makeT(copy);
  return { title: `${t('about_eyebrow', 'מי אנחנו')} | ${profile?.name ?? 'טלדן ט.ד. הנדסה ובניין'}` };
}

export default async function AboutPage() {
  if (await isGated()) return <GateForm />;

  const { profile, partners, copy } = await getData();
  if (!aboutFilled(copy)) notFound();

  const t = makeT(copy);
  const name = profile?.name ?? 'טלדן ט.ד. הנדסה ובניין בע"מ';
  const paragraphs = t('about_body').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const founder = {
    name: t('about_founder_name'),
    role: t('about_founder_role'),
    text: t('about_founder_text'),
    photo: t('about_founder_photo'),
  };
  const team = [1, 2, 3, 4]
    .map((i) => ({ name: t(`about_team_${i}_name`), role: t(`about_team_${i}_role`), photo: t(`about_team_${i}_photo`) }))
    .filter((m) => m.name);

  return (
    <>
      <Reveal />
      <Masthead copy={copy} phone={profile?.phone} hasClients={partners.some((p: any) => p.logo_url)} current="about" />
      <div className="site">
        <section className="page-hero holes on-dark">
          <div className="wrap">
            <div className="eyebrow">{t('about_eyebrow', 'מי אנחנו')}</div>
            <h1 className="page-title">{t('about_title', 'החברה והאנשים שמאחוריה')}</h1>
          </div>
        </section>

        {paragraphs.length > 0 && (
          <section className="band band-paper">
            <div className="wrap">
              <div className="about-body rev">
                {paragraphs.map((p, i) => (
                  <p key={i} className={i === 0 ? 'lead' : undefined}>{p}</p>
                ))}
              </div>
            </div>
          </section>
        )}

        {founder.text && (
          <section className="band">
            <div className="wrap">
              <div className="founder rev">
                {founder.photo && <img className="founder-photo" src={founder.photo} alt={founder.name} loading="lazy" />}
                <div>
                  {founder.name && <h2 className="founder-name">{founder.name}</h2>}
                  {founder.role && <div className="founder-role">{founder.role}</div>}
                  <p className="founder-text">{founder.text}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {team.length > 0 && (
          <section className="band band-paper">
            <div className="wrap">
              <div className="team rev">
                {team.map((m) => (
                  <div className="member" key={m.name}>
                    {m.photo && <img src={m.photo} alt={m.name} loading="lazy" />}
                    <div className="member-name">{m.name}</div>
                    {m.role && <div className="member-role">{m.role}</div>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="band band-dark holes on-dark about-cta">
          <div className="wrap">
            <h2 className="head-title">{t('contact_title', 'יש פרויקט על השולחן?')}</h2>
            <a className="btn" href="/#contact">{t('hero_button', 'פנייה בנושא פרויקט')}</a>
          </div>
        </section>

        <Footer copy={copy} profile={profile} name={name} />
      </div>
    </>
  );
}
