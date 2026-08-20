'use client';

import { useEffect, useRef, useState } from 'react';
import { submitInterest } from '@/lib/api/adapter';
import { validateApplicant } from '@/lib/validation/applicant';
import { ConsentModal } from './consent-modal';

const fields = [
  ['firstName', 'First name', 'given-name'],
  ['lastName', 'Last name', 'family-name'],
  ['email', 'Email address', 'email'],
  ['alternateMobile', 'Alternate mobile', 'tel-national'],
  ['city', 'City', 'address-level2'],
  ['pincode', 'Pincode', 'postal-code'],
  ['pan', 'PAN', ''],
  ['dob', 'Date of birth', 'bday'],
] as const;

export function StepDetails({ phone, token, onConfirmed }: { phone: string; token: string; onConfirmed: (reference: string) => void }) {
  const [error, setError] = useState<string>();
  const [panError, setPanError] = useState<string>();
  const [errorFocusRequest, setErrorFocusRequest] = useState(0);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (errorFocusRequest) errorRef.current?.focus();
  }, [errorFocusRequest]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const alternateMobile = String(data.get('alternateMobile'));
    const issue = validateApplicant({ primaryMobile: phone, alternateMobile }).alternateMobile;
    if (issue) return setError(issue);
    if (!data.get('consent')) return setError('Please confirm your consent before continuing.');
    setError(undefined);
    try {
      const result = await submitInterest({
        verificationToken: token,
        firstName: String(data.get('firstName')),
        lastName: String(data.get('lastName')),
        email: String(data.get('email')),
        alternateMobile,
        city: String(data.get('city')),
        pincode: String(data.get('pincode')),
        pan: String(data.get('pan')).toUpperCase(),
        dob: String(data.get('dob')),
        employmentStatus: String(data.get('employmentStatus')) as 'employed' | 'self-employed' | 'retired' | 'other',
        incomeRange: String(data.get('incomeRange')),
        existingIciciRelationship: data.get('existingIciciRelationship') === 'yes',
        consent: true,
      });
      onConfirmed(result.referenceNumber);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to submit your interest.');
      setErrorFocusRequest((request) => request + 1);
    }
  };

  return <form className="details-form" data-step="details" onSubmit={submit}>
    <h2 id="interest-title">A few particulars</h2>
    {fields.map(([name, label, autoComplete]) => <label key={name} htmlFor={`applicant-${name}`}>
      {label}
      <input id={`applicant-${name}`} name={name} required type={name === 'email' ? 'email' : name === 'dob' ? 'date' : 'text'} autoComplete={autoComplete} pattern={name === 'pan' ? '[A-Z]{5}[0-9]{4}[A-Z]' : name === 'pincode' ? '\\d{6}' : undefined} aria-describedby={name === 'pan' && panError ? 'pan-error' : undefined} aria-invalid={name === 'pan' ? Boolean(panError) : undefined} onBlur={(event) => { if (name !== 'pan') return; const value = event.currentTarget.value.toUpperCase(); event.currentTarget.value = value; setPanError(/^[A-Z]{5}\d{4}[A-Z]$/.test(value) ? undefined : 'Enter a valid PAN.'); }} />
      {name === 'pan' && panError && <span id="pan-error" role="alert">{panError}</span>}
    </label>)}
    <label htmlFor="employment-status">Employment status<select id="employment-status" name="employmentStatus"><option value="employed">Employed</option><option value="self-employed">Self-employed</option><option value="retired">Retired</option><option value="other">Other</option></select></label>
    <label htmlFor="income-range">Annual income range<select id="income-range" name="incomeRange"><option>₹25L+</option><option>₹50L+</option><option>₹1Cr+</option></select></label>
    <fieldset><legend>Existing relationship with ICICI Bank?</legend><label><input type="radio" name="existingIciciRelationship" value="yes" /> Yes</label><label><input type="radio" name="existingIciciRelationship" value="no" defaultChecked /> No</label></fieldset>
    <label className="consent-row" htmlFor="interest-consent"><input ref={consentRef} id="interest-consent" type="checkbox" name="consent" /> I consent to the processing of my information.</label>
    <ConsentModal restoreFocus={consentRef} />
    {error && <p id="details-error" ref={errorRef} role="alert" tabIndex={-1}>{error}</p>}
    <button aria-describedby={error ? 'details-error' : undefined}>Record my interest</button>
  </form>;
}
