import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OtpInput } from './otp-input';

describe('OtpInput', () => {
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it('paints a complete pasted code into six slots and submits it', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn(); render(<OtpInput onComplete={onComplete} />);
    fireEvent.paste(screen.getByLabelText('Six digit verification code'), { clipboardData: { getData: () => '123456' } });
    expect(screen.getByText('1')).toBeVisible(); expect(screen.getByText('6')).toBeVisible();
    vi.advanceTimersByTime(180); expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('keeps a partial paste without submitting it', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn(); render(<OtpInput onComplete={onComplete} />);
    fireEvent.paste(screen.getByLabelText('Six digit verification code'), { clipboardData: { getData: () => '123' } });
    expect(screen.getByText('1')).toBeVisible(); expect(screen.getByText('3')).toBeVisible();
    vi.advanceTimersByTime(300);
    expect(onComplete).not.toHaveBeenCalled();
  });
});
