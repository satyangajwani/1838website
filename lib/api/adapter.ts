'use client';

import { InterestApiError, type Applicant } from './types';
import { mockSendOtp, mockSubmitInterest, mockVerifyOtp } from './mock';

const request = async <T,>(path: string, body: unknown): Promise<T> => {
  try {
    const response = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const payload = await response.json() as { error?: { code?: InterestApiError['code']; message?: string } };
    if (!response.ok) throw new InterestApiError(payload.error?.code ?? 'NETWORK_ERROR', payload.error?.message ?? 'Something went wrong.');
    return payload as T;
  } catch (error) {
    if (error instanceof InterestApiError) throw error;
    throw new InterestApiError('NETWORK_ERROR', 'Unable to connect. Please try again.');
  }
};

// Production swap: replace these relative mock endpoints with api.timesblack.com/gw/ body mappings;
// attach the JSSO ticket in this module only. Components must not know either integration detail.
export const sendOtp = (phone: string) => process.env.NODE_ENV === 'test' ? mockSendOtp(phone) : request<{ message: string }>('/api/otp/send', { phone });
export const verifyOtp = (phone: string, code: string) => process.env.NODE_ENV === 'test' ? mockVerifyOtp(phone, code) : request<{ verificationToken: string }>('/api/otp/verify', { phone, code });
export const submitInterest = (applicant: Applicant) => process.env.NODE_ENV === 'test' ? mockSubmitInterest(applicant) : request<{ referenceNumber: string }>('/api/interest', applicant);
