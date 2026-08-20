import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConsentModal } from './consent-modal';

describe('ConsentModal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
    delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
  });

  it('wraps Tab inside the consent dialog and restores the consent checkbox on close', () => {
    Object.defineProperties(HTMLDialogElement.prototype, {
      showModal: { configurable: true, value: function showModal(this: HTMLDialogElement) { this.setAttribute('open', ''); } },
      close: { configurable: true, value: function close(this: HTMLDialogElement) { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); } },
    });
    const restoreFocus = { current: null as HTMLInputElement | null };
    render(<><input ref={(node) => { restoreFocus.current = node; }} aria-label="Consent" /><ConsentModal restoreFocus={restoreFocus} /></>);

    fireEvent.click(screen.getByRole('button', { name: 'Read data-sharing terms' }));
    const close = screen.getByRole('button', { name: /^Close$/ });
    Object.defineProperty(close, 'offsetParent', { configurable: true, value: close.parentElement });
    close.focus();
    const tab = createEvent.keyDown(document, { key: 'Tab', bubbles: true, cancelable: true });
    fireEvent(document, tab);

    expect(tab.defaultPrevented).toBe(true);
    expect(close).toHaveFocus();
    fireEvent.click(close);
    expect(screen.getByLabelText('Consent')).toHaveFocus();
  });
});
