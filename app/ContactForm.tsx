'use client';

import { useState } from 'react';

export default function ContactForm({ copy, types = [] }: { copy?: Record<string, string>; types?: string[] }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const t = (key: string, fallback: string) => (copy?.[key] ? copy[key] : fallback);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      message: (() => {
        const type = (form.elements.namedItem('ptype') as HTMLSelectElement | null)?.value;
        const msg = (form.elements.namedItem('message') as HTMLTextAreaElement).value;
        return type ? `סוג הפרויקט: ${type}\n\n${msg}` : msg;
      })(),
    };
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('failed');
      setStatus('sent');
      form.reset();
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="cform">
        <div className="cform-ok-title">{t('form_success_title', 'הפנייה נקלטה')}</div>
        <p>
          {t('form_success_body', 'קיבלנו את הפרטים ונחזור אליכם. אם זה דחוף, אפשר להתקשר ישירות.')}
        </p>
      </div>
    );
  }

  return (
    <form className="cform" onSubmit={onSubmit}>
      <div className="cfield">
        <label className="cfield-label" htmlFor="f-name">{t('form_label_name', 'שם')}</label>
        <input id="f-name" name="name" placeholder={t('form_placeholder_name', 'שם מלא')} required />
      </div>
      <div className="cfield">
        <label className="cfield-label" htmlFor="f-phone">{t('form_label_phone', 'טלפון')}</label>
        <input id="f-phone" name="phone" placeholder={t('form_placeholder_phone', '050-0000000')} required />
      </div>
      <div className="cfield">
        <label className="cfield-label" htmlFor="f-email">{t('form_label_email', 'אימייל')}</label>
        <input id="f-email" name="email" type="email" placeholder={t('form_placeholder_email', 'לא חובה')} />
      </div>
      {types.length > 0 && (
        <div className="cfield">
          <label className="cfield-label" htmlFor="f-type">{t('form_label_type', 'סוג הפרויקט')}</label>
          <select id="f-type" name="ptype" defaultValue="">
            <option value="">{t('form_placeholder_type', 'בחרו תחום (לא חובה)')}</option>
            {types.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
      )}
      <div className="cfield">
        <label className="cfield-label" htmlFor="f-msg">{t('form_label_message', 'הפרויקט')}</label>
        <textarea id="f-msg" name="message" rows={4} placeholder={t('form_placeholder_message', 'סוג המבנה, מיקום, היקף משוער')} required />
      </div>
      <button className="btn btn-dark cform-submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? t('form_submit_sending', 'שולח…') : t('form_submit', 'שליחת פנייה')}
      </button>
      {copy?.form_note?.trim() && <p className="cform-note">{copy.form_note}</p>}
      {status === 'error' && (
        <p className="cform-note err" role="alert">
          {t('form_error', 'השליחה לא עברה. אפשר לנסות שוב או להתקשר.')}
        </p>
      )}
    </form>
  );
}
