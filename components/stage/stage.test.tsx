import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Stage } from './stage';

describe('Stage', () => {
  it('keeps copy in the DOM and renders a grounded card without a plinth layer', () => {
    const { container } = render(<Stage><h1>For those who script India&apos;s future.</h1><p>Joining Fee ₹1,75,000 + GST</p><p>Artwork by Krishen Khanna</p><p>Issued by ICICI Bank</p></Stage>);
    const stage = container.querySelector<HTMLElement>('[data-stage]')!;
    const wall = container.querySelector<HTMLElement>('[data-layer="wall"]');
    const cardStand = container.querySelector<HTMLElement>('[data-layer="card-stand"]');
    const stand = container.querySelector<HTMLElement>('.stage-stand');
    const shadow = container.querySelector<HTMLElement>('.stage-contact-shadow');
    const reflection = container.querySelector<HTMLElement>('.stage-reflection');

    expect(wall).toBeInTheDocument();
    expect(cardStand).toBeInTheDocument();
    expect(stand).toBeInTheDocument();
    expect(shadow).toBeInTheDocument();
    expect(reflection).toBeInTheDocument();
    expect(container.querySelector('[data-layer="plinth"]')).not.toBeInTheDocument();
    expect(wall?.querySelector('img')).toHaveAttribute('data-lcp-stage-image');
    expect(cardStand?.querySelector('img')).toHaveAttribute('data-lcp-stage-image');
    expect(cardStand?.querySelector('img')).toHaveAttribute('data-baked-copy', 'excluded');

    stage.getBoundingClientRect = () => new DOMRect(0, 0, 1000, 700);
    fireEvent.pointerMove(stage, { clientX: 900, clientY: 100 });
    const layers = [...container.querySelectorAll<HTMLElement>('[data-depth]')];
    expect(screen.getByRole('heading')).toHaveTextContent("For those who script India's future.");
    expect(new Set(layers.map((layer) => layer.style.transform)).size).toBeGreaterThan(1);
  });
});
