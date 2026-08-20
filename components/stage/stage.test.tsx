import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Stage } from './stage';

describe('Stage', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  function setReducedMotion(reduced: boolean) {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: reduced,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  }

  it('keeps copy in the DOM and layers the supplied card over the supplied pedestal', () => {
    setReducedMotion(false);
    vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const { container } = render(<Stage><h1>For those who script India’s future</h1><p>The 1838 Reserve Credit Card · Visa Infinite Privilege · October 2026</p><p>Card ownership by invitation only.</p></Stage>);
    const stage = container.querySelector<HTMLElement>('[data-stage]')!;
    const wall = container.querySelector<HTMLElement>('[data-layer="wall"]');
    const cardStand = container.querySelector<HTMLElement>('[data-layer="card-stand"]');
    const pedestal = container.querySelector<HTMLElement>('[data-layer="pedestal"]');

    expect(wall).toBeInTheDocument();
    expect(cardStand).toBeInTheDocument();
    expect(pedestal).toBeInTheDocument();
    expect(container.querySelector('.stage-stand, .stage-contact-shadow, .stage-reflection')).not.toBeInTheDocument();
    expect(wall?.querySelector('img')).toHaveAttribute('data-lcp-stage-image');
    expect(cardStand?.querySelector('img')).toHaveAttribute('data-lcp-stage-image');
    expect(cardStand?.querySelector('img')).toHaveAttribute('data-baked-copy', 'excluded');

    stage.getBoundingClientRect = () => new DOMRect(0, 0, 1000, 700);
    fireEvent.pointerMove(stage, { clientX: 900, clientY: 100 });
    const layers = [...container.querySelectorAll<HTMLElement>('[data-depth]')];
    expect(container.querySelector('.stage-card-edge-light')).not.toBeInTheDocument();
    expect(cardStand?.querySelector('img')).toHaveAttribute('src', '/stage/card-on-stand-noname-1440.webp');
    expect(pedestal?.querySelector('img')).toHaveAttribute('src', '/stage/pedestal-only-1440.webp');
    expect(screen.getByRole('heading')).toHaveTextContent('For those who script India’s future');
    expect(new Set(layers.map((layer) => layer.style.transform)).size).toBeGreaterThan(1);
  });

  it('keeps ambience toggles in a compact, keyboard-operable controls popover', () => {
    setReducedMotion(false);
    vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    render(<Stage><h1>Headline</h1></Stage>);

    const controls = screen.getByRole('button', { name: 'Stage controls' });
    expect(screen.queryByRole('button', { name: 'Enable ambience' })).not.toBeInTheDocument();
    fireEvent.click(controls);
    expect(controls).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('group', { name: 'Stage ambience controls' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Enable ambience' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Pause visual ambience' })).toBeVisible();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(controls).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Enable ambience' })).not.toBeInTheDocument();
  });

  it('runs indefinite ambience until its compact pause control is pressed', () => {
    setReducedMotion(false);
    const requestFrame = vi.fn().mockReturnValue(7);
    const cancelFrame = vi.fn();
    vi.stubGlobal('requestAnimationFrame', requestFrame);
    vi.stubGlobal('cancelAnimationFrame', cancelFrame);

    const { container } = render(<Stage><h1>Headline</h1></Stage>);
    const stage = container.querySelector<HTMLElement>('[data-stage]')!;
    fireEvent.click(screen.getByRole('button', { name: 'Stage controls' }));
    const pause = screen.getByRole('button', { name: 'Pause visual ambience' });

    expect(stage).toHaveAttribute('data-ambience', 'running');
    expect(pause).toHaveAttribute('aria-pressed', 'false');
    expect(requestFrame).toHaveBeenCalledOnce();

    fireEvent.click(pause);

    expect(stage).toHaveAttribute('data-ambience', 'paused');
    expect(screen.getByRole('button', { name: 'Resume visual ambience' })).toHaveAttribute('aria-pressed', 'true');
    expect(cancelFrame).toHaveBeenCalledWith(7);
  });

  it('never starts drift or accepts steering under reduced motion', () => {
    setReducedMotion(true);
    const requestFrame = vi.fn().mockReturnValue(1);
    vi.stubGlobal('requestAnimationFrame', requestFrame);
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const { container } = render(<Stage><h1>Headline</h1></Stage>);
    const stage = container.querySelector<HTMLElement>('[data-stage]')!;
    const layers = [...container.querySelectorAll<HTMLElement>('[data-depth]')];

    expect(stage).toHaveAttribute('data-reduced-motion', 'true');
    expect(stage).toHaveAttribute('data-ambience', 'paused');
    fireEvent.click(screen.getByRole('button', { name: 'Stage controls' }));
    expect(screen.getByRole('button', { name: 'Visual ambience paused for reduced motion' })).toBeDisabled();
    expect(requestFrame).not.toHaveBeenCalled();

    stage.getBoundingClientRect = () => new DOMRect(0, 0, 1000, 700);
    fireEvent.pointerMove(stage, { clientX: 900, clientY: 100 });
    expect(layers.every((layer) => layer.style.transform === '')).toBe(true);
  });
});
