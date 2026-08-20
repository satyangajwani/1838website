import { describe, expect, it } from 'vitest';
import { sendOtp, submitInterest, verifyOtp } from './adapter';

describe('interest adapter', () => {
  it('completes its stateless happy path', async () => {
    const sent = await sendOtp('9876543210');
    expect(sent.message).toMatch(/code/i);
    const verified = await verifyOtp('9876543210', '183838');
    const submitted = await submitInterest({
      verificationToken: verified.verificationToken,
      firstName: 'Aarav', lastName: 'Mehta', email: 'aarav@example.com', alternateMobile: '9123456780', city: 'Mumbai', pincode: '400001', pan: 'ABCDE1234F', dob: '1990-01-01', employmentStatus: 'employed', incomeRange: '₹25L+', existingIciciRelationship: false, consent: true,
    });
    expect(submitted.referenceNumber).toMatch(/^1838-[A-Z0-9]{8}$/);
  });

  it('returns a typed error for a reserved failed number', async () => {
    await expect(sendOtp('9000000000')).rejects.toMatchObject({ code: 'OTP_SEND_FAILED' });
  });
});
