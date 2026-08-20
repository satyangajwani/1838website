'use client';

import { useEffect, useRef, useState } from 'react';
import { LazyMotion, domAnimation } from 'motion/react';
import { StepMobile } from './step-mobile';
import { StepOtp } from './step-otp';
import { StepDetails } from './step-details';
import { StepConfirmed } from './step-confirmed';

export function InterestSheet() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [step, setStep] = useState<'mobile' | 'otp' | 'details' | 'confirmed'>('mobile');
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [reference, setReference] = useState('');

  const open = () => dialog.current?.showModal();
  const close = () => dialog.current?.close();

  useEffect(() => {
    const current = dialog.current;
    if (!current) return;
    if ('closedBy' in HTMLDialogElement.prototype) {
      current.setAttribute('closedby', 'any');
      return;
    }
    const closeFromBackdrop = (event: MouseEvent) => {
      if (event.target === current) current.close();
    };
    current.addEventListener('click', closeFromBackdrop);
    return () => current.removeEventListener('click', closeFromBackdrop);
  }, []);

  useEffect(() => {
    const current = dialog.current;
    if (!current) return;
    const focusable = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';
    const trapTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !current.open) return;
      const activeDialog = document.activeElement instanceof Element ? document.activeElement.closest('dialog') : null;
      if (activeDialog && activeDialog !== current) return;
      const controls = [...current.querySelectorAll<HTMLElement>(focusable)].filter((control) => control.offsetParent !== null);
      if (!controls.length) return;
      const index = controls.indexOf(document.activeElement as HTMLElement);
      const next = event.shiftKey
        ? controls[index <= 0 ? controls.length - 1 : index - 1]
        : controls[index === -1 || index === controls.length - 1 ? 0 : index + 1];
      event.preventDefault();
      next.focus();
    };
    document.addEventListener('keydown', trapTab);
    return () => document.removeEventListener('keydown', trapTab);
  }, []);

  return <LazyMotion features={domAnimation} strict>
    <div className="cta-stack"><button ref={trigger} id="request-introduction" className="interest-trigger" onClick={open}>Request an Introduction</button><p className="cta-note">Card ownership by invitation only.</p></div>
    <dialog ref={dialog} className="interest-sheet" aria-labelledby="interest-title" aria-modal="true" data-interest-step={step} onClose={() => trigger.current?.focus()}>
      <button type="button" className="dialog-close" aria-label="Close request an introduction" onClick={close}>×</button>
      {step === 'mobile' && <StepMobile phone={phone} setPhone={setPhone} onSent={() => setStep('otp')} />}
      {step === 'otp' && <StepOtp phone={phone} onChangeNumber={() => setStep('mobile')} onVerified={(verified) => { setToken(verified); setStep('details'); }} />}
      {step === 'details' && <StepDetails phone={phone} token={token} onConfirmed={(value) => { setReference(value); setStep('confirmed'); }} />}
      {step === 'confirmed' && <StepConfirmed reference={reference} onClose={close} />}
    </dialog>
  </LazyMotion>;
}
