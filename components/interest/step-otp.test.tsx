import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StepOtp } from './step-otp';

describe('StepOtp', () => {
  afterEach(() => vi.useRealTimers());

  it('counts the polite resend status down', () => {
    vi.useFakeTimers();
    render(<StepOtp phone="9876543210" onVerified={vi.fn()} onChangeNumber={vi.fn()} />);

    const status = screen.getByText('Resend available in 30s');
    expect(status).toHaveAttribute('aria-live', 'polite');
    act(() => vi.advanceTimersByTime(1000));
    expect(status).toHaveTextContent('Resend available in 29s');
  });
});
