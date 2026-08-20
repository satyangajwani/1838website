import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FontGate } from './font-gate';

describe('FontGate', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute('data-reveal-complete');
    document.documentElement.classList.remove('fonts-ready');
  });

  it('marks the reveal complete only after the hero fade has ended', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => window.setTimeout(() => callback(0), 0));
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } });
    const { container } = render(<><div className="hero-copy" /><FontGate /></>);
    await vi.runAllTimersAsync();
    expect(document.documentElement).toHaveClass('fonts-ready');
    expect(document.documentElement).not.toHaveAttribute('data-reveal-complete');
    fireEvent.transitionEnd(container.querySelector('.hero-copy')!, { propertyName: 'opacity' });
    expect(document.documentElement).toHaveAttribute('data-reveal-complete', 'true');
  });

  it('marks the reveal complete when no opacity transition is running', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => window.setTimeout(() => callback(0), 0));
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } });
    const { container } = render(<><div className="hero-copy" /><FontGate /></>);
    Object.defineProperty(container.querySelector('.hero-copy')!, 'getAnimations', { configurable: true, value: () => [] });

    await vi.runAllTimersAsync();

    expect(document.documentElement).toHaveAttribute('data-reveal-complete', 'true');
  });
});
