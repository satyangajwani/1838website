import { z } from 'zod';

export const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number.');
export const otpSchema = z.string().regex(/^\d{6}$/, 'Enter the six-digit code.');
export const applicantSchema = z.object({
  verificationToken: z.string().min(16),
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(60),
  email: z.string().email().max(254),
  alternateMobile: phoneSchema,
  city: z.string().trim().min(2).max(80),
  pincode: z.string().regex(/^\d{6}$/),
  pan: z.string().regex(/^[A-Z]{5}\d{4}[A-Z]$/),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  employmentStatus: z.enum(['employed', 'self-employed', 'retired', 'other']),
  incomeRange: z.string().min(1).max(40),
  existingIciciRelationship: z.boolean(),
  consent: z.literal(true),
});

export type Applicant = z.infer<typeof applicantSchema>;
export type ApiErrorCode = 'OTP_SEND_FAILED' | 'OTP_INVALID' | 'SUBMISSION_FAILED' | 'NETWORK_ERROR' | 'VALIDATION_ERROR';
export class InterestApiError extends Error {
  constructor(public readonly code: ApiErrorCode, message: string) { super(message); this.name = 'InterestApiError'; }
}
