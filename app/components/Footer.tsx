import { makeT } from '../../lib/site';

export default function Footer({ copy, profile, name }: { copy: Record<string, string>; profile: any; name: string }) {
  const t = makeT(copy);
  return (
    <footer className="titleblock">
      <div className="wrap">
        <div className="tb-grid">
          <div>
            <div className="tb-k">{t('footer_company_label', 'חברה')}</div>
            <div className="tb-v">{name}</div>
          </div>
          <div>
            <div className="tb-k">{t('footer_address_label', 'משרד')}</div>
            <div className="tb-v">{profile?.address ?? '––'}</div>
          </div>
          <div>
            <div className="tb-k">{t('footer_phone_label', 'טלפון')}</div>
            <div className="tb-v"><bdi dir="ltr">{profile?.phone ?? '––'}</bdi></div>
          </div>
          <div>
            <div className="tb-k">{t('footer_email_label', 'אימייל')}</div>
            <div className="tb-v"><bdi dir="ltr">{profile?.email ?? '––'}</bdi></div>
          </div>
        </div>
      </div>
      <div className="foot-word" aria-hidden="true">TALDAN</div>
      <div className="wrap">
        <div className="tb-foot">
          <span>{t('footer_brand_line', 'TALDAN T.D. ENGINEERING & CONSTRUCTION')}</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
