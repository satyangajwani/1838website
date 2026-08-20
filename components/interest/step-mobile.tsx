'use client';

import { useState } from 'react';
import { sendOtp } from '@/lib/api/adapter';
import { phoneError } from '@/lib/validation/phone';

export function StepMobile({ onSent, phone, setPhone }: { onSent: () => void; phone: string; setPhone: (phone: string) => void }) {
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const issue = phoneError(phone);
    if (issue) return setError(issue);
    setBusy(true);
    setError(undefined);
    try { await sendOtp(phone); onSent(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to send a code.'); }
    finally { setBusy(false); }
  };

  return <form data-step="mobile" onSubmit={submit}>
    <h2 id="interest-title">Your mobile number</h2>
    <label htmlFor="mobile">Aadhaar linked number</label>
    <div className="phone-field"><span aria-hidden="true">+91</span><input autoFocus id="mobile" type="tel" autoComplete="tel-national" maxLength={10} value={phone} onChange={(event) => { setPhone(event.target.value.replace(/\D/g, '')); setError(undefined); }} onBlur={() => setError(phoneError(phone))} aria-describedby={error ? 'phone-error' : undefined} aria-invalid={Boolean(error)} /></div>
    {error && <p id="phone-error" role="alert">{error}</p>}
    <button disabled={busy}>{busy ? 'Sending…' : 'Continue'}</button>
  </form>;
}
