import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Masthead } from './masthead';

describe('Masthead', () => {
  afterEach(cleanup);

  it('renders the Reserve wordmark as live centered copy between the partner lockups', () => {
    const { container } = render(<Masthead />);
    const masthead = container.querySelector('.masthead');
    const wordmark = container.querySelector('.reserve-wordmark');

    expect(masthead?.children).toHaveLength(3);
    expect(masthead?.children[1]).toBe(wordmark);
    expect(wordmark).toHaveTextContent(/^1838RESERVE$/);
    expect(wordmark?.querySelector('.reserve-wordmark-year')).toHaveTextContent('1838');
    expect(wordmark?.querySelector('.reserve-wordmark-name')).toHaveTextContent('RESERVE');
  });
});
