'use client';
import { useEffect, useRef, useState } from 'react';
export function OtpInput({ onComplete, error }: { onComplete: (code: string) => void; error?: string }) {
  const [value, setValue] = useState(''); const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const update = (raw: string) => { const code = raw.replace(/\D/g, '').slice(0, 6); window.clearTimeout(timer.current); setValue(code); if (code.length === 6) timer.current = window.setTimeout(() => onComplete(code), 180); };
  return <div><div className="otp-input-wrap"><div className="otp-slots" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <span key={index}>{value[index] ?? ''}</span>)}</div><input autoFocus className="otp-real" aria-label="Six digit verification code" aria-describedby={error ? 'otp-error' : undefined} aria-invalid={Boolean(error)} value={value} onChange={(event) => update(event.target.value)} onPaste={(event) => { event.preventDefault(); update(event.clipboardData.getData('text')); }} type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" /></div>{error && <p id="otp-error" role="alert">{error}</p>}</div>;
}
