import { NextResponse } from 'next/server';
import { mockVerifyOtp } from '@/lib/api/mock';
import { InterestApiError, otpSchema, phoneSchema } from '@/lib/api/types';
import { z } from 'zod';

export async function POST(request: Request) {
  try { const { phone, code } = z.object({ phone: phoneSchema, code: otpSchema }).parse(await request.json()); return NextResponse.json(await mockVerifyOtp(phone, code)); }
  catch (error) { const typed = error instanceof InterestApiError ? error : new InterestApiError('VALIDATION_ERROR', 'Enter a valid verification code.'); return NextResponse.json({ error: { code: typed.code, message: typed.message } }, { status: typed.code === 'OTP_INVALID' ? 401 : 400 }); }
}
