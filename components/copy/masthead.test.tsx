import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Masthead } from './masthead';

describe('Masthead', () => {
  afterEach(cleanup);

  it('renders one partner band above the live Reserve wordmark', () => {
    const { container } = render(<Masthead />);
    const masthead = container.querySelector('.masthead');
    const band = container.querySelector('.masthead-band');
    const wordmark = container.querySelector('.reserve-wordmark');

    expect(masthead?.children).toHaveLength(2);
    expect(masthead?.children[0]).toBe(band);
    expect(masthead?.children[1]).toBe(wordmark);
    // Both partner marks live inside the band so flex centering aligns their midlines.
    expect(band?.querySelector('.toi-lockup img')).toHaveAttribute('alt', 'The Times of India');
    expect(band?.querySelector('.icici-lockup')).toHaveAttribute('alt', 'ICICI Bank');
    expect(wordmark).toHaveTextContent(/^1838RESERVE$/);
    expect(wordmark?.querySelector('.reserve-wordmark-year')).toHaveTextContent('1838');
    expect(wordmark?.querySelector('.reserve-wordmark-name')).toHaveTextContent('RESERVE');
  });
});
