import { applicantSchema, InterestApiError, otpSchema, phoneSchema, type Applicant } from './types';

const delay = () => new Promise((resolve) => setTimeout(resolve, 180));
const tokenFor = (phone: string) => `1838-verified-${phone}-token`;

export async function mockSendOtp(phone: string) {
  phoneSchema.parse(phone); await delay();
  if (phone === '9000000000') throw new InterestApiError('OTP_SEND_FAILED', 'We could not send a code. Please try again.');
  return { message: 'A six digit code has been sent to your mobile number.' };
}
export async function mockVerifyOtp(phone: string, code: string) {
  phoneSchema.parse(phone); otpSchema.parse(code); await delay();
  if (code !== '183838') throw new InterestApiError('OTP_INVALID', 'The OTP entered is incorrect. Please enter the correct OTP.');
  return { verificationToken: tokenFor(phone) };
}
export async function mockSubmitInterest(applicant: Applicant) {
  applicantSchema.parse(applicant); await delay();
  if (!applicant.verificationToken.startsWith('1838-verified-')) throw new InterestApiError('VALIDATION_ERROR', 'Please verify your mobile number before continuing.');
  if (applicant.email === 'fail@example.com') throw new InterestApiError('SUBMISSION_FAILED', 'We could not submit your interest. Please try again.');
  return { referenceNumber: '1838-8A3F1C7D' };
}
