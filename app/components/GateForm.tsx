'use client';

import { useState } from 'react';
import './GateForm.css';

/**
 * A one-time code screen shown in front of the whole site while it's not
 * yet public. On the correct code, the server sets a cookie and this
 * refreshes into the real homepage. The gate itself expires automatically
 * after a set number of successful entries (handled server-side) — after
 * that this component never renders again for anyone.
 */
export default function GateForm() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('checking');
    try {
      const res = await fetch('/api/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (json.ok) {
        window.location.reload();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="gate-wrap" dir="rtl">
      <div className="gate-card">
        <span className="gate-td">
          <span className="td-t2">T</span>
          <span className="td-d2">D</span>
        </span>
        <p className="gate-note">האתר עדיין בשלב תצוגה מקדימה. הזינו את הקוד שקיבלתם כדי להיכנס.</p>
        <form onSubmit={onSubmit}>
          <input
            className="gate-input"
            value={code}
            onChange={(e) => { setCode(e.target.value); setStatus('idle'); }}
            placeholder="קוד כניסה"
            autoFocus
          />
          <button className="btn gate-btn" type="submit" disabled={status === 'checking'}>
            {status === 'checking' ? 'בודק…' : 'כניסה'}
          </button>
        </form>
        {status === 'error' && <p className="gate-err">הקוד שגוי. אפשר לנסות שוב.</p>}
      </div>
    </div>
  );
}
