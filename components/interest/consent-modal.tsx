'use client';

import { type RefObject, useEffect, useRef } from 'react';

export function ConsentModal({ restoreFocus }: { restoreFocus: RefObject<HTMLInputElement | null> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const current = dialog.current;
    if (!current) return;
    const focusable = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';
    const trapTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || (!current.open && !current.hasAttribute('open'))) return;
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
  return <>
    <button type="button" className="text-button" onClick={() => dialog.current?.showModal()}>Read data-sharing terms</button>
    <dialog ref={dialog} className="consent-dialog" aria-labelledby="consent-title" onClose={() => restoreFocus.current?.focus()}>
      <h2 id="consent-title">Data-sharing terms</h2>
      <p>Your information will be used to review your expression of interest.</p>
      <button type="button" onClick={() => dialog.current?.close()}>Close</button>
    </dialog>
  </>;
}
