'use client';
import '../dashboard.css';

import { useEffect, useMemo, useState } from 'react';

/** All dashboard traffic goes through /api/admin — the browser never holds a
 *  database credential, and password checks happen server-side. */
async function api(body: any) {
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? 'failed');
  return json.data;
}

type Row = Record<string, any>;
type Data = {
  profile: Row | null;
  services: Row[];
  projects: Row[];
  partners: Row[];
  meta: Row | null;
  inquiries: Row[];
  site_copy: Row[];
};

const TABS = [
  ['profile', 'פרטי החברה'],
  ['site_copy', 'טקסטים באתר'],
  ['projects', 'פרויקטים'],
  ['services', 'תחומי פעילות'],
  ['partners', 'לקוחות'],
  ['meta', 'כותרות וגוגל'],
  ['inquiries', 'פניות'],
] as const;

export default function Dashboard() {
  const [pass, setPass] = useState('');
  const [authed, setAuthed] = useState(false);
  const [loginErr, setLoginErr] = useState('');
  const [data, setData] = useState<Data | null>(null);
  const [tab, setTab] = useState<string>('profile');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('taldan_pass');
    if (saved) {
      setPass(saved);
      load(saved).then((ok) => setAuthed(ok));
    }
  }, []);

  async function load(p: string) {
    try {
      const d = await api({ password: p, op: 'read' });
      setData(d as Data);
      return true;
    } catch {
      return false;
    }
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginErr('');
    const ok = await load(pass);
    if (ok) {
      sessionStorage.setItem('taldan_pass', pass);
      setAuthed(true);
    } else {
      setLoginErr('הסיסמה שגויה.');
    }
  }

  function logout() {
    sessionStorage.removeItem('taldan_pass');
    setAuthed(false);
    setData(null);
    setPass('');
  }

  async function save(table: string, row: Row) {
    setMsg('');
    const clean: Row = {};
    Object.entries(row).forEach(([k, v]) => {
      if (k === 'updated_at' || k === 'created_at') return;
      clean[k] = v === '' ? null : v;
    });
    try {
      const d = await api({ password: pass, op: 'save', table, row: clean });
      setData(d as Data);
      setMsg('נשמר.');
      setTimeout(() => setMsg(''), 2500);
    } catch (e: any) {
      setMsg('שגיאה: ' + e.message);
    }
  }

  async function remove(table: string, id: string) {
    if (!confirm('למחוק? הפעולה לא הפיכה.')) return;
    try {
      const d = await api({ password: pass, op: 'delete', table, id });
      setData(d as Data);
    } catch (e: any) {
      setMsg('שגיאה: ' + e.message);
    }
  }

  async function saveCopy(updates: Record<string, string>) {
    setMsg('');
    try {
      const d = await api({ password: pass, op: 'save_copy', updates });
      setData(d as Data);
      setMsg('נשמר.');
      setTimeout(() => setMsg(''), 2500);
    } catch (e: any) {
      setMsg('שגיאה: ' + e.message);
    }
  }

  if (!authed) {
    return (
      <div className="dlogin">
        <h1>ניהול תוכן</h1>
        <p className="dnote">האתר של טלדן: עריכת טקסטים, תמונות ופרויקטים.</p>
        <form onSubmit={login}>
          <div className="drow" style={{ gridTemplateColumns: '1fr' }}>
            <input
              type="password" value={pass} onChange={(e) => setPass(e.target.value)}
              placeholder="סיסמה" autoFocus
            />
          </div>
          <button className="dbtn" type="submit" style={{ width: '100%', marginTop: 8 }}>כניסה</button>
          {loginErr && <p className="derr" style={{ marginTop: 10 }}>{loginErr}</p>}
        </form>
      </div>
    );
  }

  if (!data) return <div className="dash">טוען…</div>;

  return (
    <div className="dash">
      <div className="dash-h">
        <h1>ניהול תוכן, טלדן</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {msg && <span className={msg.startsWith('שגיאה') ? 'derr' : 'dsaved'}>{msg}</span>}
          <a className="dbtn ghost" href="/" target="_blank" rel="noopener">צפייה באתר</a>
          <button className="dbtn ghost" onClick={logout}>יציאה</button>
        </div>
      </div>

      <div className="dash-tabs">
        {TABS.map(([k, label]) => (
          <button key={k} className={tab === k ? 'dash-tab on' : 'dash-tab'} onClick={() => setTab(k)}>
            {label}
            {k === 'inquiries' && data.inquiries.length > 0 ? ` (${data.inquiries.length})` : ''}
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileTab profile={data.profile} onSave={(r) => save('company_profile', r)} />}
      {tab === 'site_copy' && <SiteCopyTab siteCopy={data.site_copy} onSave={saveCopy} />}
      {tab === 'meta' && <MetaTab meta={data.meta} onSave={(r) => save('page_meta', r)} />}

      {tab === 'projects' && (
        <ListTab
          rows={data.projects}
          table="projects"
          blank={{ title: '', category: '', client_name: '', client_public: false, year: '', area_sqm: '', city: '', lat: '', lng: '', description: '', images: '[]', is_featured: false, sort_order: 0 }}
          fields={[
            ['title', 'שם הפרויקט', 'text'],
            ['category', 'תחום (לסינון באתר)', 'text'],
            ['client_name', 'לקוח', 'text'],
            ['client_public', 'להציג את שם הלקוח', 'bool'],
            ['year', 'שנה', 'number'],
            ['area_sqm', 'שטח במ"ר', 'number'],
            ['city', 'עיר (למפה)', 'text'],
            ['lat', 'קו רוחב (למפה)', 'number'],
            ['lng', 'קו אורך (למפה)', 'number'],
            ['description', 'תיאור', 'textarea'],
            ['images', 'תמונות (נתיב לכל שורה)', 'images'],
            ['is_featured', 'להציג בעמוד הבית', 'bool'],
            ['sort_order', 'סדר', 'number'],
          ]}
          titleOf={(r) => r.title || 'פרויקט חדש'}
          onSave={save}
          onDelete={remove}
        />
      )}

      {tab === 'services' && (
        <ListTab
          rows={data.services}
          table="services"
          blank={{ name: '', description: '', sort_order: 0 }}
          fields={[
            ['name', 'שם התחום', 'text'],
            ['description', 'תיאור', 'textarea'],
            ['sort_order', 'סדר', 'number'],
          ]}
          titleOf={(r) => r.name || 'תחום חדש'}
          onSave={save}
          onDelete={remove}
        />
      )}

      {tab === 'partners' && (
        <ListTab
          rows={data.partners}
          table="partners"
          blank={{ name: '', logo_url: '', sort_order: 0 }}
          fields={[
            ['name', 'שם הלקוח', 'text'],
            ['logo_url', 'נתיב הלוגו', 'image'],
            ['sort_order', 'סדר', 'number'],
          ]}
          titleOf={(r) => r.name || 'לקוח חדש'}
          onSave={save}
          onDelete={remove}
        />
      )}

      {tab === 'inquiries' && (
        <div>
          <p className="dnote">פניות שהתקבלו דרך טופס יצירת הקשר באתר.</p>
          {data.inquiries.length === 0 && <p className="dnote">אין פניות עדיין.</p>}
          {data.inquiries.map((i) => (
            <div className="dinq" key={i.id}>
              <div className="dinq-meta">
                {new Date(i.created_at).toLocaleString('he-IL')} · {i.phone}
                {i.email ? ` · ${i.email}` : ''}
              </div>
              <strong>{i.name}</strong>
              <p style={{ marginTop: 6 }}>{i.message}</p>
              <button className="dbtn danger" style={{ marginTop: 12 }}
                onClick={() => remove('inquiries', i.id)}>מחיקה</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- single-row tabs ---------- */

function ProfileTab({ profile, onSave }: { profile: Row | null; onSave: (r: Row) => void }) {
  const [r, setR] = useState<Row>(profile ?? {});
  useEffect(() => setR(profile ?? {}), [profile]);
  const F = (k: string, label: string, type = 'text') => (
    <div className="drow" key={k}>
      <label>{label}</label>
      {type === 'textarea'
        ? <textarea rows={5} value={r[k] ?? ''} onChange={(e) => setR({ ...r, [k]: e.target.value })} />
        : <input type={type} value={r[k] ?? ''} onChange={(e) => setR({ ...r, [k]: e.target.value })} />}
    </div>
  );
  return (
    <div className="dcard">
      <p className="dnote">
        הנתונים כאן מופיעים בראש עמוד הבית ובטבלת הפרטים בתחתיתו. שדה שנשאר ריק מוצג כקו במקום מספר.
      </p>
      {F('name', 'שם החברה')}
      {F('tagline', 'כותרת ראשית')}
      {F('about_text', 'טקסט אודות', 'textarea')}
      {F('founded_year', 'שנת הקמה', 'number')}
      {F('projects_count', 'מספר פרויקטים', 'number')}
      {F('total_sqm', 'סה"כ מ"ר שנבנו', 'number')}
      {F('classification', 'סיווג קבלני')}
      {F('phone', 'טלפון')}
      {F('whatsapp_phone', 'וואטסאפ')}
      {F('email', 'אימייל')}
      {F('address', 'כתובת')}
      <button className="dbtn" onClick={() => onSave(r)}>שמירה</button>
    </div>
  );
}

function MetaTab({ meta, onSave }: { meta: Row | null; onSave: (r: Row) => void }) {
  const [r, setR] = useState<Row>(meta ?? { page_slug: 'home' });
  useEffect(() => setR(meta ?? { page_slug: 'home' }), [meta]);
  return (
    <div className="dcard">
      <p className="dnote">
        הכותרת והתיאור שגוגל מציג בתוצאות החיפוש. כותרת עד 60 תווים, תיאור עד 155.
      </p>
      <div className="drow">
        <label>כותרת בגוגל</label>
        <input value={r.title ?? ''} onChange={(e) => setR({ ...r, title: e.target.value })} />
      </div>
      <div className="drow">
        <label>תיאור בגוגל</label>
        <textarea rows={3} value={r.meta_description ?? ''}
          onChange={(e) => setR({ ...r, meta_description: e.target.value })} />
      </div>
      <button className="dbtn" onClick={() => onSave({ ...r, page_slug: 'home' })}>שמירה</button>
    </div>
  );
}

/**
 * Every fixed piece of text on the live site — headings, buttons, form
 * labels, empty-state messages — grouped by the section they appear in.
 * Unlike the other tabs, this isn't a collection of rows with their own
 * identity; it's a fixed set of named slots, so there's no add/delete here,
 * just edit-and-save. Saving sends only this tab's values in one request.
 */
function SiteCopyTab({ siteCopy, onSave }: { siteCopy: Row[]; onSave: (updates: Record<string, string>) => void }) {
  const [vals, setVals] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Record<string, string> = {};
    (siteCopy ?? []).forEach((r) => { initial[r.key] = r.value ?? ''; });
    setVals(initial);
  }, [siteCopy]);

  const groups = useMemo(() => {
    const map: Record<string, Row[]> = {};
    (siteCopy ?? []).forEach((r) => {
      if (!map[r.group_name]) map[r.group_name] = [];
      map[r.group_name].push(r);
    });
    return map;
  }, [siteCopy]);

  return (
    <div>
      <p className="dnote">
        כל טקסט קבוע שמופיע באתר: כותרות, תת-כותרות, כפתורים, טופס יצירת הקשר והפוטר.
        השינויים כאן חלים על כל הטקסט בבת אחת, לא רק על פסקאות ספציפיות. שדה שנשאר ריק חוזר לברירת המחדל.
      </p>
      {Object.entries(groups).map(([group, rows]) => (
        <div className="dcard" key={group}>
          <div className="dcard-top">
            <span className="dcard-title">{group}</span>
          </div>
          {rows.map((r) => (
            <div className="drow" key={r.key}>
              <label>{r.label}</label>
              <textarea
                rows={(vals[r.key] ?? '').length > 60 ? 3 : 1}
                value={vals[r.key] ?? ''}
                onChange={(e) => setVals({ ...vals, [r.key]: e.target.value })}
              />
            </div>
          ))}
        </div>
      ))}
      <button className="dbtn" onClick={() => onSave(vals)}>שמירת כל הטקסטים</button>
    </div>
  );
}

/* ---------- repeating-row tabs ---------- */

function ListTab({
  rows, table, fields, blank, titleOf, onSave, onDelete,
}: {
  rows: Row[];
  table: string;
  fields: [string, string, string][];
  blank: Row;
  titleOf: (r: Row) => string;
  onSave: (t: string, r: Row) => void;
  onDelete: (t: string, id: string) => void;
}) {
  const [adding, setAdding] = useState<Row | null>(null);
  return (
    <div>
      <p className="dnote">
        לתמונות: הדביקו כתובת מלאה של תמונה. אפשר להעתיק כתובת של תמונה קיימת מהשדה
        שלמטה ולשנות בה רק את שם הקובץ, או להדביק כתובת של תמונה או סרטון מכל מקום באינטרנט.
      </p>

      {adding && (
        <Editor row={adding} fields={fields} title="פריט חדש"
          onChange={setAdding}
          onSave={() => { onSave(table, adding); setAdding(null); }}
          onCancel={() => setAdding(null)} />
      )}

      {!adding && (
        <button className="dbtn" style={{ marginBottom: 16 }} onClick={() => setAdding({ ...blank })}>
          הוספה
        </button>
      )}

      {rows.map((row) => (
        <EditorWrapper key={row.id} row={row} fields={fields} title={titleOf(row)}
          onSave={(r) => onSave(table, r)} onDelete={() => onDelete(table, row.id)} />
      ))}
    </div>
  );
}

function EditorWrapper({ row, fields, title, onSave, onDelete }: any) {
  const [r, setR] = useState<Row>(row);
  useEffect(() => setR(row), [row]);
  return <Editor row={r} fields={fields} title={title} onChange={setR}
    onSave={() => onSave(r)} onDelete={onDelete} />;
}

function Editor({ row, fields, title, onChange, onSave, onCancel, onDelete }: any) {
  const [newImgUrl, setNewImgUrl] = useState('');
  const imgs: string[] = (() => {
    try {
      const v = row.images;
      if (Array.isArray(v)) return v;
      if (typeof v === 'string' && v.trim()) return JSON.parse(v);
    } catch { /* not valid json yet — treated as empty until the user adds a URL */ }
    return [];
  })();

  return (
    <div className="dcard">
      <div className="dcard-top">
        <span className="dcard-title">{title}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="dbtn" onClick={onSave}>שמירה</button>
          {onCancel && <button className="dbtn ghost" onClick={onCancel}>ביטול</button>}
          {onDelete && <button className="dbtn danger" onClick={onDelete}>מחיקה</button>}
        </div>
      </div>

      {fields.map(([k, label, type]: [string, string, string]) => {
        if (type === 'bool') {
          return (
            <div className="drow" key={k}>
              <label>{label}</label>
              <div style={{ paddingTop: 9 }}>
                <input type="checkbox" checked={!!row[k]} style={{ width: 18, height: 18 }}
                  onChange={(e) => onChange({ ...row, [k]: e.target.checked })} />
              </div>
            </div>
          );
        }
        if (type === 'images') {
          return (
            <div className="drow" key={k}>
              <label>{label}</label>
              <div className="dimglist">
                {imgs.map((src, idx) => (
                  <div className="dimgrow" key={idx}>
                    {src && <img className="dimgrow-thumb" src={src} alt="" />}
                    <input
                      value={src}
                      onChange={(e) => {
                        const next = [...imgs];
                        next[idx] = e.target.value;
                        onChange({ ...row, images: next });
                      }}
                    />
                    <button
                      type="button"
                      className="dbtn danger"
                      onClick={() => onChange({ ...row, images: imgs.filter((_, i) => i !== idx) })}
                    >
                      הסרה
                    </button>
                  </div>
                ))}
                <div className="dimgrow dimgrow-add">
                  <input
                    value={newImgUrl}
                    onChange={(e) => setNewImgUrl(e.target.value)}
                    placeholder="הדביקו כאן כתובת תמונה"
                  />
                  <button
                    type="button"
                    className="dbtn"
                    onClick={() => {
                      const url = newImgUrl.trim();
                      if (!url) return;
                      onChange({ ...row, images: [...imgs, url] });
                      setNewImgUrl('');
                    }}
                  >
                    הוספה
                  </button>
                </div>
              </div>
            </div>
          );
        }
        if (type === 'image') {
          return (
            <div className="drow" key={k}>
              <label>{label}</label>
              <div>
                <input value={row[k] ?? ''} onChange={(e) => onChange({ ...row, [k]: e.target.value })} />
                {row[k] && <div className="dthumbs"><img src={row[k]} alt="" /></div>}
              </div>
            </div>
          );
        }
        return (
          <div className="drow" key={k}>
            <label>{label}</label>
            {type === 'textarea'
              ? <textarea rows={4} value={row[k] ?? ''} onChange={(e) => onChange({ ...row, [k]: e.target.value })} />
              : <input type={type} value={row[k] ?? ''} onChange={(e) => onChange({ ...row, [k]: e.target.value })} />}
          </div>
        );
      })}
    </div>
  );
}
