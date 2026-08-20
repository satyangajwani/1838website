import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StepDetails } from './step-details';

describe('StepDetails', () => {
  afterEach(cleanup);

  it('shows a PAN error on blur rather than while typing', () => {
    render(<StepDetails phone="9876543210" token="1838-verified-9876543210-token" onConfirmed={vi.fn()} />);
    const pan = screen.getByLabelText('PAN');

    fireEvent.change(pan, { target: { value: 'abc' } });
    expect(screen.queryByText('Enter a valid PAN.')).not.toBeInTheDocument();
    fireEvent.blur(pan);
    expect(screen.getByText('Enter a valid PAN.')).toBeVisible();
    expect(pan).toHaveAttribute('aria-describedby', 'pan-error');
  });

  it('focuses the rendered error when interest submission fails', async () => {
    render(<StepDetails phone="9876543210" token="1838-verified-9876543210-token" onConfirmed={vi.fn()} />);
    const values = {
      'First name': 'Asha',
      'Last name': 'Rao',
      'Email address': 'fail@example.com',
      'Alternate mobile': '9000000001',
      City: 'Mumbai',
      Pincode: '400001',
      PAN: 'ABCDE1234F',
      'Date of birth': '1990-01-01',
    };
    for (const [label, value] of Object.entries(values)) fireEvent.change(screen.getByLabelText(label), { target: { value } });
    fireEvent.click(screen.getByLabelText('I consent to the processing of my information.'));
    fireEvent.click(screen.getByRole('button', { name: 'Record my interest' }));

    const error = await screen.findByRole('alert');
    expect(error).toHaveTextContent('We could not submit your interest. Please try again.');
    expect(error).toHaveFocus();
  });
});
